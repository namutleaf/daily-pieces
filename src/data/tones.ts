import { ToneKey } from '../types';

export type ToneOption = {
  key: ToneKey;
  label: string;
  sample: string;
  emoji: string;
};

// Chosen once in Settings as the default for new diaries. 'cute' (애교체,
// "~당") used to be offered too but read as cheap next to the others;
// `applyTone` still handles it so diaries already saved with it render.
export const TONE_OPTIONS: ToneOption[] = [
  { key: 'plain', label: '담담한 반말체', sample: '하늘이 맑고 화창했다.', emoji: '🖋️' },
  { key: 'polite', label: '공손한 존댓말체', sample: '하늘이 맑고 화창했어요.', emoji: '🙇' },
  { key: 'sns', label: '쿨한 SNS체', sample: '하늘이 맑고 화창했음.', emoji: '📱' },
  { key: 'letter', label: '다정한 편지체', sample: '하늘이 맑고 화창했답니다.', emoji: '💌' },
];
