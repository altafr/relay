import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSafeUrl, extractReadableText, prepareSourceContext } from '../lib/source-context.ts';

test('Topic mode uses the exact typed topic as agent context without fetching', async () => {
  let fetchCount = 0;
  const result = await prepareSourceContext('Topic', 'AI governance for small businesses', async () => {
    fetchCount += 1;
    return new Response();
  });
  assert.equal(result.kind, 'topic');
  assert.match(result.context, /USER-PROVIDED TOPIC:\nAI governance for small businesses/);
  assert.equal(fetchCount, 0);
});

test('Paste text mode normalizes and preserves the supplied material for synthesis', async () => {
  const pasted = 'Launch notes:\n\n  Customers save 4 hours.\n\n\nTeams want simpler onboarding.';
  const result = await prepareSourceContext('Paste text', pasted);
  assert.equal(result.kind, 'text');
  assert.match(result.context, /PASTED SOURCE TEXT TO SYNTHESIZE/);
  assert.match(result.context, /Customers save 4 hours/);
  assert.match(result.context, /Teams want simpler onboarding/);
  assert.doesNotMatch(result.context, /\n{3,}/);
});

test('Paste text accepts sources up to 150,000 characters and retains a large synthesis context', async () => {
  const largeSource = `Opening claim. ${'Evidence and supporting context. '.repeat(4_000)}`;
  assert.ok(largeSource.length > 15_000 && largeSource.length < 150_000);
  const result = await prepareSourceContext('Paste text', largeSource);
  assert.equal(result.kind, 'text');
  assert.ok(result.context.length > 100_000);
});

test('Sources larger than 150,000 characters are rejected with the expanded limit', async () => {
  await assert.rejects(
    () => prepareSourceContext('Paste text', 'x'.repeat(150_001)),
    /under 150,000 characters/,
  );
});

test('URL mode fetches HTML and extracts readable title and body content', async () => {
  const fakeFetch: typeof fetch = async (input) => {
    assert.equal(String(input), 'https://example.com/article');
    return new Response(`<!doctype html><html><head><title>Useful &amp; Clear</title><style>.x{}</style></head><body><main><h1>A practical guide</h1><p>Research-backed advice for responsible adoption.</p><script>stealSecrets()</script></main></body></html>`, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  };
  const result = await prepareSourceContext('URL', 'https://example.com/article', fakeFetch);
  assert.equal(result.kind, 'url');
  assert.equal(result.label, 'Useful & Clear');
  assert.match(result.context, /A practical guide/);
  assert.match(result.context, /Research-backed advice/);
  assert.doesNotMatch(result.context, /stealSecrets|\.x\{\}/);
});

test('URL mode follows a safe redirect and validates the destination', async () => {
  let calls = 0;
  const fakeFetch: typeof fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response(null, { status: 302, headers: { location: 'https://www.example.com/final' } });
    return new Response('This final page contains enough useful readable content for the content agents.', { headers: { 'content-type': 'text/plain' } });
  };
  const result = await prepareSourceContext('URL', 'https://example.com/start', fakeFetch);
  assert.equal(calls, 2);
  assert.match(result.context, /https:\/\/www\.example\.com\/final/);
});

test('URL mode uses the reader fallback when a public page blocks direct fetching', async () => {
  const calls: string[] = [];
  const fakeFetch: typeof fetch = async (input) => {
    calls.push(String(input));
    if (calls.length === 1) return new Response('challenge', { status: 403, headers: { 'content-type': 'text/html' } });
    return new Response('Title: Protected Article\n\nURL Source: https://openai.com/article\n\nMarkdown Content:\n## Launch details\nThe product introduces three concrete improvements for professional teams.', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });
  };

  const result = await prepareSourceContext('URL', 'https://openai.com/article', fakeFetch);
  assert.deepEqual(calls, ['https://openai.com/article', 'https://r.jina.ai/https://openai.com/article']);
  assert.equal(result.label, 'Protected Article');
  assert.match(result.context, /Extraction: reader/);
  assert.match(result.context, /three concrete improvements/);
  assert.doesNotMatch(result.context, /challenge/);
});

test('reader fallback uses edge-compatible manual redirect handling', async () => {
  const redirects: Array<RequestRedirect | undefined> = [];
  const fakeFetch: typeof fetch = async (_input, init) => {
    redirects.push(init?.redirect);
    if (redirects.length === 1) return new Response('challenge', { status: 403 });
    return new Response('Title: Edge Safe\n\nMarkdown Content:\nThis response contains enough readable content to verify edge-safe behavior.', { headers: { 'content-type': 'text/plain' } });
  };
  await prepareSourceContext('URL', 'https://example.com/protected', fakeFetch);
  assert.deepEqual(redirects, ['manual', 'manual']);
});

test('URL validation blocks local, private, credentialed, and non-http targets', () => {
  for (const value of ['http://localhost/admin', 'http://intranet/path', 'http://127.0.0.1', 'http://10.0.0.2', 'http://192.168.1.5', 'http://[::ffff:127.0.0.1]', 'https://example.com:8443', 'https://service.test', 'file:///etc/passwd', 'https://user:pass@example.com']) {
    assert.throws(() => assertSafeUrl(value));
  }
});

test('HTML extraction decodes entities and removes executable or decorative content', () => {
  const result = extractReadableText('<title>A &amp; B</title><style>hidden</style><h1>Hello&nbsp;world</h1><noscript>no</noscript><p>Useful text.</p>');
  assert.equal(result.title, 'A & B');
  assert.match(result.text, /Hello world/);
  assert.match(result.text, /Useful text/);
  assert.doesNotMatch(result.text, /hidden|no/);
});

test('HTML extraction prefers article content and removes page chrome', () => {
  const result = extractReadableText('<html><head><title>Article</title></head><body><nav>Navigation noise</nav><main><article><h1>Core finding</h1><p>The source-specific evidence belongs here.</p><aside>Related links</aside></article></main><footer>Footer noise</footer></body></html>');
  assert.match(result.text, /Core finding/);
  assert.match(result.text, /source-specific evidence/);
  assert.doesNotMatch(result.text, /Navigation noise|Related links|Footer noise/);
});

test('reader fallback strips Markdown link destinations but preserves their labels', async () => {
  let calls = 0;
  const fakeFetch: typeof fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response('blocked', { status: 403 });
    return new Response('Title: Clean Reader\n\nMarkdown Content:\n![Chart](https://cdn.example.com/chart.png) Read the [research report](https://example.com/report) for concrete findings.', { headers: { 'content-type': 'text/plain' } });
  };
  const result = await prepareSourceContext('URL', 'https://example.com/protected', fakeFetch);
  assert.match(result.context, /Chart Read the research report/);
  assert.doesNotMatch(result.context, /cdn\.example\.com|example\.com\/report/);
});
