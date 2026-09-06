export type InputMode = 'Topic' | 'URL' | 'Paste text';

export class SourceContextError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'SourceContextError';
    this.status = status;
  }
}

const MAX_INPUT_CHARS = 15_000;
const MAX_DOWNLOAD_BYTES = 1_000_000;
const MAX_CONTEXT_CHARS = 14_000;
const MAX_REDIRECTS = 3;

function cleanWhitespace(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeHtmlEntities(value: string) {
  const entities: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity.startsWith('#')) {
      const radix = entity[1]?.toLowerCase() === 'x' ? 16 : 10;
      const raw = radix === 16 ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(raw, radix);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : ' ';
    }
    return entities[entity.toLowerCase()] ?? ' ';
  });
}

export function extractReadableText(html: string) {
  const title = decodeHtmlEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
    .replace(/<[^>]+>/g, ' ');
  const text = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|canvas|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|article|section|main|header|footer|li|h[1-6]|blockquote|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return {
    title: cleanWhitespace(title),
    text: cleanWhitespace(decodeHtmlEntities(text)).slice(0, MAX_CONTEXT_CHARS),
  };
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255)) return false;
  const [a, b] = parts.map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}

export function assertSafeUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SourceContextError('Enter a complete URL beginning with http:// or https://.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) throw new SourceContextError('Only HTTP and HTTPS URLs are supported.');
  if (url.username || url.password) throw new SourceContextError('URLs containing credentials are not supported.');

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const blockedName = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal');
  const blockedIpv6 = hostname === '::' || hostname === '::1' || hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe8') || hostname.startsWith('fe9') || hostname.startsWith('fea') || hostname.startsWith('feb');
  if (blockedName || blockedIpv6 || isPrivateIpv4(hostname)) throw new SourceContextError('Private or local network URLs cannot be imported.');

  return url;
}

async function readLimitedBody(response: Response) {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > MAX_DOWNLOAD_BYTES) throw new SourceContextError('That page is too large to import.', 413);
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DOWNLOAD_BYTES) {
      await reader.cancel();
      throw new SourceContextError('That page is too large to import.', 413);
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

async function fetchReaderFallback(sourceUrl: URL, fetcher: typeof fetch) {
  const readerUrl = new URL(`https://r.jina.ai/${sourceUrl.toString()}`);
  const response = await fetcher(readerUrl, {
    redirect: 'manual',
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status >= 300 && response.status < 400) {
    throw new SourceContextError('The reader fallback returned an unexpected redirect.', 422);
  }
  if (!response.ok) throw new SourceContextError(`The page blocked direct access and its reader fallback returned HTTP ${response.status}.`, 422);

  const raw = await readLimitedBody(response);
  const title = cleanWhitespace(raw.match(/^Title:\s*(.+)$/im)?.[1] || '');
  const contentMarker = raw.match(/^Markdown Content:\s*$/im);
  const markdown = contentMarker?.index === undefined ? raw : raw.slice(contentMarker.index + contentMarker[0].length);
  const text = cleanWhitespace(markdown).slice(0, MAX_CONTEXT_CHARS);
  if (text.length < 40) throw new SourceContextError('Not enough readable text was found at that URL.', 422);

  return { title, text, url: sourceUrl.toString(), extraction: 'reader' as const };
}

export async function fetchUrlContext(rawUrl: string, fetcher: typeof fetch = fetch) {
  let currentUrl = assertSafeUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetcher(currentUrl, {
      redirect: 'manual',
      headers: { Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9' },
      signal: AbortSignal.timeout(12_000),
    });

    if ([401, 403, 429].includes(response.status)) {
      return fetchReaderFallback(currentUrl, fetcher);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new SourceContextError('The URL redirected without a destination.', 422);
      if (redirect === MAX_REDIRECTS) throw new SourceContextError('The URL redirected too many times.', 422);
      currentUrl = assertSafeUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) throw new SourceContextError(`The URL returned HTTP ${response.status}.`, 422);
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml') && !contentType.includes('text/plain')) {
      throw new SourceContextError('That URL does not contain a readable web page.', 415);
    }

    const raw = await readLimitedBody(response);
    const extracted = contentType.includes('text/plain')
      ? { title: '', text: cleanWhitespace(raw).slice(0, MAX_CONTEXT_CHARS) }
      : extractReadableText(raw);
    if (extracted.text.length < 40) throw new SourceContextError('Not enough readable text was found at that URL.', 422);
    return { ...extracted, url: currentUrl.toString(), extraction: 'direct' as const };
  }

  throw new SourceContextError('The URL could not be imported.', 422);
}

export async function prepareSourceContext(mode: InputMode, rawSource: string, fetcher: typeof fetch = fetch) {
  const source = rawSource.trim();
  if (!source) throw new SourceContextError('A source is required.');
  if (source.length > MAX_INPUT_CHARS) throw new SourceContextError('Source must be under 15,000 characters.', 413);

  if (mode === 'URL') {
    const page = await fetchUrlContext(source, fetcher);
    return {
      kind: 'url' as const,
      label: page.title || new URL(page.url).hostname,
      context: `IMPORTED WEB PAGE\nTitle: ${page.title || 'Untitled page'}\nURL: ${page.url}\nExtraction: ${page.extraction}\n\nPAGE CONTENT:\n${page.text}`,
    };
  }

  if (mode === 'Paste text') {
    const text = cleanWhitespace(source).slice(0, MAX_CONTEXT_CHARS);
    return {
      kind: 'text' as const,
      label: text.slice(0, 80),
      context: `PASTED SOURCE TEXT TO SYNTHESIZE:\n${text}`,
    };
  }

  return {
    kind: 'topic' as const,
    label: source,
    context: `USER-PROVIDED TOPIC:\n${source}`,
  };
}
