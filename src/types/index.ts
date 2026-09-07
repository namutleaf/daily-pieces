export type CategoryKey =
  | 'weather'
  | 'mood'
  | 'person'
  | 'place'
  | 'activity'
  | 'moment';

export type WordItem = {
  id: string;
  label: string;
  emoji: string;
  fragment: string;
};

export type Category = {
  key: CategoryKey;
  title: string;
  question: string;
  words: WordItem[];
};

export type Selections = Record<CategoryKey, WordItem>;

export type ToneKey = 'plain' | 'polite' | 'sns';

export type PaletteKey =
  | '설렘'
  | '평온'
  | '뿌듯'
  | '피곤'
  | '그리움'
  | '행복'
  | '살짝 우울'
  | '두근두근';

export type DiaryEntry = {
  id: string;
  createdAt: number;
  dateLabel: string;
  selections: Selections;
  tone: ToneKey;
  diaryText: string;
  hashtags: string[];
  paletteKey: PaletteKey;
};
