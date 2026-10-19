import { ToneKey } from '../types';

// Lightweight heuristic to guess a tone from a short free-typed sentence,
// so the rest of the diary can be shifted to match it without asking the
// user to classify their own writing style.
export function detectToneFromText(text: string): ToneKey {
  const trimmed = text.trim();
  if (!trimmed) return 'plain';

  if (/[ㅋㅎ]{2,}/.test(trimmed)) return 'sns';

  const stripped = trimmed.replace(/[.!?~\s]+$/g, '');

  if (/(요|니다)$/.test(stripped)) return 'polite';
  if (/(음|함|임)$/.test(stripped)) return 'sns';

  return 'plain';
}
