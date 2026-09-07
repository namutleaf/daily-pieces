export type CategoryKey =
  | 'weather'
  | 'mood'
  | 'person'
  | 'place'
  | 'activity'
  | 'moment';

export type FragmentVariant = {
  label: string;
  fragment: string;
};

export type WordItem = {
  id: string;
  label: string;
  emoji: string;
  fragment: string;
  variants?: FragmentVariant[];
  nameable?: boolean;
  fragmentTemplate?: (name: string) => string;
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

export type LineKey = CategoryKey | 'closer';

export type DiaryEntry = {
  id: string;
  createdAt: number;
  dateLabel: string;
  selections: Selections;
  personName?: string;
  // Final, already-toned text per line (from picking a preset alternative or
  // typing directly). A line with no override falls back to its default
  // fragment (or the closer fragment) run through applyTone.
  lineOverrides: Partial<Record<LineKey, string>>;
  closerFragment: string;
  tone: ToneKey;
  diaryText: string;
  hashtags: string[];
  paletteKey: PaletteKey;
};
