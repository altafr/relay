import type { SocialChannel } from './agent-prompts.ts';

export type ContentResult = { eyebrow: string; body: string; meta: string };
export type PostBanner = { dataUrl: string; alt: string; prompt: string; model: string; mediaType: string; fileExtension: string };

const hongKongThingsToDo = [
  'Ride the Star Ferry across Victoria Harbour',
  'Watch the skyline from Victoria Peak',
  'Walk the Tsim Sha Tsui waterfront and Avenue of Stars',
  'Explore Temple Street Night Market',
  'Visit Wong Tai Sin Temple',
  'Take the Ngong Ping 360 cable car to the Big Buddha',
  'Wander through Sheung Wan and visit Man Mo Temple',
  'Spend an afternoon in Tai O fishing village',
  'Hike the Dragon’s Back trail',
  'Plan a dim sum crawl through local neighbourhoods',
];

function listTopic(rawSubject: string) {
  const match = rawSubject.match(/top\s+10\s+things\s+to\s+do\s+in\s+(.+)/i);
  if (!match) return null;
  const place = match[1].replace(/[?.!]+$/, '').trim();
  if (/^(hk|hong\s+kong)$/i.test(place)) return { label: 'Hong Kong', items: hongKongThingsToDo };
  return { label: place, items: null as string[] | null };
}

export function buildFallbackResults(rawSubject: string): Record<SocialChannel, ContentResult> {
  const cleaned = rawSubject.replace(/\s+/g, ' ').trim();
  const subject = cleaned.length > 140 ? `${cleaned.slice(0, 137)}…` : cleaned;
  const list = listTopic(cleaned);

  if (list?.items) {
    const numbered = list.items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const thread = [
      `1/ Visiting Hong Kong? Here are 10 experiences worth building a trip around. 🧵`,
      `2/ Start with the harbour: ${list.items[0]}; then take in the city from above with ${list.items[1].toLowerCase()}.`,
      `3/ For neighbourhood energy, choose ${list.items[2].toLowerCase()} and ${list.items[3].toLowerCase()}.`,
      `4/ Balance the city with culture and the outdoors: ${list.items[4].toLowerCase()}, ${list.items[5].toLowerCase()}, or ${list.items[8].toLowerCase()}.`,
      `5/ Save time for slower Hong Kong: ${list.items[7].toLowerCase()} and a proper dim sum crawl.`,
    ].join('\n\n');
    const carousel = [
      `SLIDE 1\n10 things to do in Hong Kong\nA first-timer’s shortlist.`,
      `SLIDE 2\nHARBOUR + SKYLINE\n${list.items[0]}\n${list.items[1]}`,
      `SLIDE 3\nTHE CLASSIC WALK\n${list.items[2]}\n${list.items[3]}`,
      `SLIDE 4\nCULTURE\n${list.items[4]}\n${list.items[6]}`,
      `SLIDE 5\nBEYOND CENTRAL\n${list.items[5]}\n${list.items[7]}`,
      `SLIDE 6\nTHE OUTDOOR + FOOD FINISH\n${list.items[8]}\n${list.items[9]}`,
    ].join('\n\n');
    return {
      LinkedIn: {
        eyebrow: 'LinkedIn · Travel shortlist',
        body: `Planning a first trip to Hong Kong? Start with this balanced shortlist—not just the usual skyline photo.\n\n${numbered}\n\nThe best Hong Kong itinerary mixes harbour views, neighbourhood walks, temples, food, and one day outside the centre. Pick three city experiences, one cultural stop, one outdoor plan, and leave room to wander.\n\nSave this list, then check opening hours, weather, and transport before you go. Which one would you add?\n\n#HongKong #TravelPlanning #AsiaTravel`,
        meta: 'LinkedIn-ready · Travel list · Source-grounded',
      },
      'X / Twitter': { eyebrow: 'X · 5-post thread', body: thread, meta: 'X-ready · 5 posts · Source-grounded' },
      Instagram: { eyebrow: 'Instagram · 6-slide carousel', body: carousel, meta: 'Instagram-ready · 6 slides · Source-grounded' },
    };
  }

  return {
    LinkedIn: {
      eyebrow: 'LinkedIn · Source-grounded draft',
      body: `The most useful conversation about ${subject} starts with a sharper question: what would have to be true for this to matter?\n\nIt is easy to turn ${subject} into a broad trend post. That is rarely useful. A better approach is to name the specific change, connect it to the people making decisions, and separate evidence from assumption.\n\nFor this topic, the working angle is simple: define the real shift, show who feels it first, and make the trade-off visible. The strongest version of the argument should include primary sources and one credible counterpoint—not just a confident prediction.\n\nThat discipline makes the post more useful to leaders evaluating ${subject}. It gives them a question they can test, a claim they can challenge, and a next step they can act on.\n\nWhat evidence would change your view of ${subject}?\n\n#Research #Leadership #Strategy`,
      meta: 'LinkedIn-ready · Source-grounded · No invented research',
    },
    'X / Twitter': {
      eyebrow: 'X · 5-post thread',
      body: `1/ The useful question about ${subject} is not “is this exciting?” It is: what would have to be true for it to matter? 🧵\n\n2/ Name the specific shift. Broad claims about ${subject} are easy to share and hard to act on.\n\n3/ Connect that shift to a real decision: who feels it first, and what changes for them?\n\n4/ Add the discipline most posts skip: primary sources, a clear uncertainty, and one credible counterpoint.\n\n5/ The takeaway: make ${subject} testable. A sharper question beats a louder prediction.`,
      meta: 'X-ready · 5 posts · Source-grounded · No invented research',
    },
    Instagram: {
      eyebrow: 'Instagram · 6-slide carousel',
      body: `SLIDE 1\n${subject}\nThe sharper question behind the headline.\n\nSLIDE 2\nSTART WITH THE SHIFT\nWhat has specifically changed about ${subject}?\n\nSLIDE 3\nMAKE IT HUMAN\nWho feels that change first—and what decision does it affect?\n\nSLIDE 4\nSEPARATE SIGNAL FROM HYPE\nUse primary sources. Name what is known and what is still uncertain.\n\nSLIDE 5\nTEST THE EASY TAKE\nWhat credible counterpoint would challenge the obvious story?\n\nSLIDE 6\nTHE TAKEAWAY\nMake ${subject} testable. One clear question is more useful than six generic claims.`,
      meta: 'Instagram-ready · 6 slides · Source-grounded · No invented research',
    },
  };
}
