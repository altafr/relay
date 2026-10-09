import type { InputMode } from './source-context.ts';

export type SocialChannel = 'LinkedIn' | 'X / Twitter' | 'Instagram';

export type RunContract = {
  inputMode: InputMode;
  subject: string;
  audience: string;
  tone: string;
  style: string;
  sourceContext: string;
};

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'and', 'are', 'because', 'been', 'being', 'between',
  'could', 'from', 'have', 'into', 'more', 'most', 'other', 'over', 'should', 'that', 'their',
  'there', 'these', 'they', 'this', 'those', 'through', 'under', 'using', 'what', 'when',
  'where', 'which', 'while', 'with', 'would', 'your',
]);

export function createRunContract(inputMode: InputMode, subject: string, sourceContext: string, audience = 'Tech leaders', tone = 'Smart and bold'): RunContract {
  return {
    inputMode,
    subject: subject.trim(),
    audience: audience.trim() || 'Tech leaders',
    tone: tone.trim() || 'Smart and bold',
    style: 'Confident, clear, evidence-led, and conversational. Prefer concrete nouns and active verbs. Use short sentences and restrained punctuation. Avoid hype, clichés, generic AI commentary, and invented facts. Keep one recognizable point of view across every channel while adapting only the format and length.',
    sourceContext,
  };
}

export function renderContract(contract: RunContract) {
  return `CONTENT CONTRACT — NEVER DEVIATE
PRIMARY SUBJECT: ${contract.subject}
INPUT TYPE: ${contract.inputMode}
AUDIENCE: ${contract.audience}
TONE: ${contract.tone}
SHARED VOICE: ${contract.style}
TOPIC LOCK: Every artifact must remain explicitly about the PRIMARY SUBJECT. Name it or closely paraphrase it near the beginning and repeatedly connect every claim to it.
EVIDENCE RULE: Use only the supplied source and Scout's cited research. Never invent a fact, quotation, statistic, product capability, person, or source.
CONSISTENCY RULE: Preserve the same thesis, vocabulary, factual claims, and point of view across all channels. Channel conventions may change; the underlying voice may not.`;
}

export function buildScoutPrompt(contract: RunContract) {
  const researchInstruction = contract.inputMode === 'Topic'
    ? `Research the PRIMARY SUBJECT using web search before writing. Use at least 3 relevant, credible sources when available. Prefer primary sources and current information. Include the source title and URL beside every researched claim. If sources disagree or a claim cannot be verified, say so.`
    : `Do not research beyond the supplied material. Treat the supplied URL or pasted text as the sole factual source and identify gaps instead of filling them with assumptions.`;

  return `${renderContract(contract)}

${researchInstruction}

SUPPLIED MATERIAL
${contract.sourceContext}

Return a compact research brief with exactly these headings:
SUBJECT RESTATEMENT
CENTRAL THESIS
VERIFIED FINDINGS (5–7 bullets; each must explicitly name or connect to the subject)
SOURCE TRAIL (title + URL for Topic mode; supplied source for other modes)
UNCERTAINTIES
ANCHOR TERMS (5–10 subject-specific terms the later agents must preserve)`;
}

export function buildMusePrompt(contract: RunContract, research: string) {
  return `${renderContract(contract)}

SCOUT RESEARCH
${research}

Create one unified creative brief. The angle must be specifically about the PRIMARY SUBJECT and supported by Scout's findings. Define: one thesis, one audience promise, one hook, 3 mandatory evidence details, 5–10 shared vocabulary terms, a narrative arc, and channel-format guidance. Do not introduce new facts or a different topic.`;
}

const channelInstructions: Record<SocialChannel, string> = {
  LinkedIn: 'Write a LinkedIn post of 130–190 words. Use short paragraphs, a strong opening, and no more than 3 relevant hashtags.',
  'X / Twitter': 'Write a 5-post X/Twitter thread numbered 1/ through 5/. Keep each post under 280 characters.',
  Instagram: 'Write a 6-slide Instagram carousel. Label every slide and keep each slide crisp.',
};

export function buildWriterPrompt(channel: SocialChannel, contract: RunContract, research: string, strategy: string) {
  return `${renderContract(contract)}

SCOUT RESEARCH
${research}

MUSE STRATEGY
${strategy}

SOURCE EXCERPT — USE TO PREVENT HANDOFF LOSS
${contract.sourceContext.slice(0, 12_000)}

CHANNEL: ${channel}
${channelInstructions[channel]}
Use at least 2 concrete, verifiable details from Scout's research or the source excerpt. Make the PRIMARY SUBJECT unmistakable in the opening. Do not write about the content-production process, agents, prompting, or generic strategy unless that is itself the PRIMARY SUBJECT. Return only the publish-ready copy.`;
}

export function buildFramePrompt(contract: RunContract, research: string, strategy: string) {
  return `${renderContract(contract)}

ROLE: Frame, the visual art director.
Create one LinkedIn post banner that communicates the PRIMARY SUBJECT and the same thesis used by the writers.

SCOUT RESEARCH
${research.slice(0, 4_500)}

MUSE STRATEGY
${strategy.slice(0, 2_500)}

VISUAL DIRECTION
- Wide 16:9 editorial banner composition with a clear focal point and generous negative space.
- Strictly black, white, and neutral gray; no color cast.
- Sophisticated editorial photography or conceptual illustration, not generic corporate stock imagery.
- Express one subject-specific visual metaphor supported by the research.
- No words, letters, logos, watermarks, UI screenshots, charts with labels, or decorative AI motifs.
- High contrast and legible at LinkedIn feed size.
- Do not drift into generic teamwork, content creation, robots, brains, or glowing networks unless one is explicitly the PRIMARY SUBJECT.`;
}

export function buildReviewPrompt(contract: RunContract, research: string, strategy: string, drafts: Record<SocialChannel, string>) {
  return `${renderContract(contract)}

Act as a strict publication gate. Review all drafts against the exact PRIMARY SUBJECT, Scout research, Muse strategy, and shared voice. A draft that is generic, changes the subject, discusses the content workflow instead of the subject, invents facts, or changes voice must fail.

SCOUT RESEARCH
${research}

MUSE STRATEGY
${strategy}

LINKEDIN
${drafts.LinkedIn}

X / TWITTER
${drafts['X / Twitter']}

INSTAGRAM
${drafts.Instagram}

First line: SCORE: 0–100
Second line: VERDICT: PASS or REVISE
Then give one short, actionable note per channel. A generic or off-topic draft must score below 70 and receive REVISE.`;
}

export function buildRevisionPrompt(channel: SocialChannel, contract: RunContract, research: string, strategy: string, draft: string, review: string) {
  return `${renderContract(contract)}

You are the final editor. Rewrite the ${channel} draft so it passes the topic, evidence, and shared-voice contract. Do not merely append the subject name: every paragraph or slide must materially relate to it.

SCOUT RESEARCH
${research}

MUSE STRATEGY
${strategy}

FAILED DRAFT
${draft}

PULSE REVIEW
${review}

${channelInstructions[channel]}
Return only the corrected publish-ready copy.`;
}

export function topicTerms(subject: string) {
  return [...new Set(subject.toLocaleLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}-]{2,}/gu) || [])]
    .filter((word) => !STOP_WORDS.has(word))
    .slice(0, 12);
}

export function isTopicGrounded(content: string, subject: string) {
  const normalizedContent = content.toLocaleLowerCase();
  const normalizedSubject = subject.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  if (normalizedSubject.length >= 4 && normalizedContent.includes(normalizedSubject)) return true;
  const terms = topicTerms(subject);
  if (!terms.length) return false;
  const matches = terms.filter((term) => normalizedContent.includes(term)).length;
  return matches >= Math.min(2, terms.length);
}

export function scoutTools(inputMode: InputMode) {
  return inputMode === 'Topic' ? [{ type: 'openrouter:web_search' as const }] : undefined;
}
