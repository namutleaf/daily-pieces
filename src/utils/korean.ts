// Deterministic Hangul batchim (final-consonant) detection, used to pick the
// grammatically correct particle for a user-typed name (e.g. pet name).
export function hasBatchim(word: string): boolean {
  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;
  return code % 28 !== 0;
}

function withParticle(word: string, withBatchim: string, withoutBatchim: string): string {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}

export const topicParticle = (word: string) => withParticle(word, '은', '는');
export const subjectParticle = (word: string) => withParticle(word, '이', '가');
export const objectParticle = (word: string) => withParticle(word, '을', '를');
export const withParticleGwa = (word: string) => withParticle(word, '과', '와');
