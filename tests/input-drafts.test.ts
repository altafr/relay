import assert from 'node:assert/strict';
import test from 'node:test';
import { initialSourceDrafts, updateSourceDraft } from '../lib/input-drafts.ts';

test('each input tab preserves its own draft while switching modes', () => {
  let drafts = { ...initialSourceDrafts };
  drafts = updateSourceDraft(drafts, 'Topic', 'A topic draft');
  drafts = updateSourceDraft(drafts, 'URL', 'https://example.com/article');
  drafts = updateSourceDraft(drafts, 'Paste text', 'A pasted source draft');

  assert.equal(drafts.Topic, 'A topic draft');
  assert.equal(drafts.URL, 'https://example.com/article');
  assert.equal(drafts['Paste text'], 'A pasted source draft');
});

test('updating one tab does not mutate or clear another tab', () => {
  const before = { ...initialSourceDrafts, URL: 'https://example.com' };
  const after = updateSourceDraft(before, 'Topic', 'Updated topic');

  assert.equal(before.Topic, initialSourceDrafts.Topic);
  assert.equal(after.URL, 'https://example.com');
  assert.equal(after['Paste text'], '');
});
