import type { SocialChannel } from './agent-prompts.ts';

export type ContentResult = { eyebrow: string; body: string; meta: string };
export type PostBanner = { dataUrl: string; alt: string; prompt: string; model: string; mediaType: string; fileExtension: string };

export function buildFallbackResults(rawSubject: string): Record<SocialChannel, ContentResult> {
  const cleaned = rawSubject.replace(/\s+/g, ' ').trim();
  const subject = cleaned.length > 140 ? `${cleaned.slice(0, 137)}…` : cleaned;

  return {
    LinkedIn: {
      eyebrow: 'Topic-locked outline · Built-in mode',
      body: `${subject}\n\nThis subject deserves a specific point of view—not a generic trend post.\n\nThree questions shape a useful first draft:\n\n→ What has materially changed about ${subject}?\n→ Who feels that change most directly?\n→ What evidence would challenge the obvious conclusion?\n\nA credible post should answer those questions with sourced facts before making a recommendation. Until that research is available, the honest move is to preserve the topic, expose the open questions, and avoid pretending that assumptions are findings.\n\nThe next step: identify primary sources about ${subject}, compare their claims, and turn the strongest supported insight into one clear argument.\n\n#Research #ContentStrategy`,
      meta: 'Consistent voice · No invented research · Built-in mode',
    },
    'X / Twitter': {
      eyebrow: 'Topic-locked outline · 5 posts',
      body: `1/ Let’s examine ${subject} without defaulting to a generic take. 🧵\n\n2/ Start with the change: what is different now, and what evidence demonstrates it?\n\n3/ Then identify who is affected by ${subject} and how their decisions change.\n\n4/ Test the obvious conclusion against a credible counterpoint or primary source.\n\n5/ Good analysis of ${subject} begins with evidence, stays on the subject, and ends with one defensible takeaway.`,
      meta: 'Consistent voice · No invented research · Built-in mode',
    },
    Instagram: {
      eyebrow: 'Topic-locked outline · 6 slides',
      body: `SLIDE 1\n${subject}\nA focused way to investigate it.\n\nSLIDE 2\nWHAT CHANGED?\nName the specific shift.\n\nSLIDE 3\nWHO IS AFFECTED?\nConnect ${subject} to real decisions.\n\nSLIDE 4\nWHAT IS THE EVIDENCE?\nPrioritize primary sources.\n\nSLIDE 5\nWHAT CHALLENGES THE EASY TAKE?\nLook for a credible counterpoint.\n\nSLIDE 6\nSTAY WITH THE SUBJECT\nOne supported insight beats six generic claims.`,
      meta: 'Consistent voice · No invented research · Built-in mode',
    },
  };
}
