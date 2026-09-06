import type { InputMode } from './source-context';

export const initialSourceDrafts: Record<InputMode, string> = {
  Topic: 'Why multi-agent AI teams are the future of creative work',
  URL: '',
  'Paste text': '',
};

export function updateSourceDraft(drafts: Record<InputMode, string>, mode: InputMode, value: string) {
  return { ...drafts, [mode]: value };
}
