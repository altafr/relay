import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMusePrompt,
  buildFramePrompt,
  buildScoutPrompt,
  buildWriterPrompt,
  createRunContract,
  isTopicGrounded,
  renderContract,
  scoutTools,
} from '../lib/agent-prompts.ts';
import { POST } from '../app/api/generate/route.ts';

test('every agent receives the same subject, tone, and shared voice contract', () => {
  const contract = createRunContract(
    'Topic',
    'solid-state batteries for electric aviation',
    'USER-PROVIDED TOPIC:\nsolid-state batteries for electric aviation',
    'Aerospace executives',
    'Measured and practical',
  );
  const prompts = [
    buildScoutPrompt(contract),
    buildMusePrompt(contract, 'Research about solid-state batteries for electric aviation.'),
    buildWriterPrompt('LinkedIn', contract, 'Research', 'Strategy'),
    buildWriterPrompt('X / Twitter', contract, 'Research', 'Strategy'),
    buildWriterPrompt('Instagram', contract, 'Research', 'Strategy'),
    buildFramePrompt(contract, 'Research', 'Strategy'),
  ];
  const sharedContract = renderContract(contract);

  for (const prompt of prompts) {
    assert.ok(prompt.startsWith(sharedContract));
    assert.match(prompt, /PRIMARY SUBJECT: solid-state batteries for electric aviation/);
    assert.match(prompt, /TONE: Measured and practical/);
    assert.match(prompt, /Confident, clear, evidence-led, and conversational/);
  }
});

test('Scout researches typed topics but does not broaden URL or pasted-text sources', () => {
  assert.deepEqual(scoutTools('Topic'), [{ type: 'openrouter:web_search' }]);
  assert.equal(scoutTools('URL'), undefined);
  assert.equal(scoutTools('Paste text'), undefined);

  const topicPrompt = buildScoutPrompt(createRunContract('Topic', 'heat pumps', 'USER-PROVIDED TOPIC:\nheat pumps'));
  const pastedPrompt = buildScoutPrompt(createRunContract('Paste text', 'heat pump field notes', 'PASTED SOURCE TEXT TO SYNTHESIZE:\nheat pump field notes'));
  assert.match(topicPrompt, /Use at least 3 relevant, credible sources/);
  assert.match(topicPrompt, /source title and URL/);
  assert.match(pastedPrompt, /sole factual source/);
});

test('Frame keeps the complete visual contract within the image API prompt limit', () => {
  const contract = createRunContract('Topic', 'solid-state batteries for electric aviation', 'topic context');
  const prompt = buildFramePrompt(contract, 'research '.repeat(4_000), 'strategy '.repeat(4_000));
  assert.ok(prompt.length <= 10_000);
  assert.match(prompt, /PRIMARY SUBJECT: solid-state batteries for electric aviation/);
  assert.match(prompt, /Strictly black, white, and neutral gray/);
  assert.match(prompt, /No words, letters, logos, watermarks/);
});

test('topic grounding rejects generic copy and accepts subject-specific copy', () => {
  const subject = 'solid-state batteries for electric aviation';
  assert.equal(isTopicGrounded('Better workflows create more engaging content for every channel.', subject), false);
  assert.equal(isTopicGrounded('Solid-state batteries could change how electric aviation balances weight and range.', subject), true);
  assert.equal(isTopicGrounded('Electric aircraft need battery advances before aviation can scale.', subject), true);
});

test('the live pipeline researches a topic, shares one contract, and repairs an off-topic draft before returning it', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  const requests: Array<Record<string, unknown> & { endpoint?: string }> = [];
  const replies = [
    'SUBJECT RESTATEMENT\nsolid-state batteries for electric aviation\nCENTRAL THESIS\nEnergy density and safety shape aircraft feasibility.\nVERIFIED FINDINGS\n- Solid-state batteries target higher energy density for electric aviation.\nSOURCE TRAIL\n- Example primary source — https://example.com/research\nUNCERTAINTIES\nCommercial timelines vary.\nANCHOR TERMS\nsolid-state, batteries, electric, aviation',
    'THESIS: Solid-state batteries may change the weight-range trade-off in electric aviation.\nVOICE: measured, evidence-led.\nMANDATORY DETAILS: energy density; safety; commercial timelines.',
    'Better workflows create more engaging content for every channel.',
    '1/ Solid-state batteries could reshape electric aviation.\n\n2/ Energy density affects aircraft range.\n\n3/ Safety remains central.\n\n4/ Commercial timelines vary.\n\n5/ Evidence matters.',
    'SLIDE 1\nSOLID-STATE BATTERIES FOR ELECTRIC AVIATION\n\nSLIDE 2\nENERGY DENSITY\nAircraft range depends on weight.\n\nSLIDE 3\nSAFETY\nEvidence first.\n\nSLIDE 4\nTIMELINES\nUncertainty remains.\n\nSLIDE 5\nTRADE-OFFS\nTest the claims.\n\nSLIDE 6\nAVIATION\nFollow the evidence.',
    'SCORE: 86\nVERDICT: PASS\nLinkedIn: off-topic and must be rewritten.\nX: grounded.\nInstagram: grounded.',
    'Solid-state batteries are not a generic innovation story. For electric aviation, the question is whether improvements in energy density can support useful range without compromising safety.\n\nThe research brief also carries an important caution: commercial timelines vary. That uncertainty belongs in the story, because aerospace leaders need evidence—not hype—when evaluating new battery systems.\n\nThe useful conversation is therefore about the weight-range trade-off, safety evidence, and what must be proven before adoption.\n\n#ElectricAviation #BatteryTechnology',
  ];
  let replyIndex = 0;

  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_MODEL = 'test/model';
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const endpoint = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    requests.push({ ...requestBody, endpoint });
    if (endpoint.endsWith('/images')) {
      return Response.json({ data: [{ b64_json: 'dGVzdA==', media_type: 'image/png' }] });
    }
    const content = replies[replyIndex++];
    return Response.json({ model: 'test/model', choices: [{ message: { content } }] });
  }) as typeof fetch;

  try {
    const response = await POST(new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'solid-state batteries for electric aviation',
        inputMode: 'Topic',
        audience: 'Aerospace executives',
        tone: 'Measured and practical',
      }),
    }));
    const data = await response.json() as { outputs: Record<string, { body: string }>; banner: { dataUrl: string; prompt: string } };

    assert.equal(response.status, 200);
    assert.equal(requests.length, 8, 'the run should include Frame plus one repair call for the drifting channel');
    assert.deepEqual(requests[0].tools, [{ type: 'openrouter:web_search' }]);
    for (const request of requests.filter((item) => item.messages)) {
      const messages = request.messages as Array<{ content: string }>;
      assert.match(messages.map((message) => message.content).join('\n'), /solid-state batteries for electric aviation/i);
    }
    const frameRequest = requests.find((request) => request.endpoint?.endsWith('/images'));
    assert.ok(frameRequest);
    assert.match(String(frameRequest.prompt), /solid-state batteries for electric aviation/i);
    assert.match(String(frameRequest.prompt), /Strictly black, white, and neutral gray/);
    assert.equal(frameRequest.aspect_ratio, '16:9');
    assert.equal(data.banner.dataUrl, 'data:image/png;base64,dGVzdA==');
    for (const output of Object.values(data.outputs)) assert.equal(isTopicGrounded(output.body, 'solid-state batteries for electric aviation'), true);
    assert.match(data.outputs.LinkedIn.body, /weight-range trade-off/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = originalModel;
  }
});
