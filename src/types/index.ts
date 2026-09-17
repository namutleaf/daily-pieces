import { IllustrationKey } from '../data/illustrations';

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

export type ToneKey = 'plain' | 'polite' | 'sns' | 'letter' | 'cute';

export type PaletteKey =
  | '설렘'
  | '평온'
  | '뿌듯'
  | '피곤'
  | '그리움'
  | '행복'
  | '살짝 우울'
  | '두근두근';

// 'custom' is the optional free-typed sentence the user can add when the
// diary is created; it only exists when lineOverrides.custom is set.
export type LineKey = CategoryKey | 'closer' | 'custom';

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
  // Per-category replacement for a hashtag, from tapping it and either
  // picking one of that word's variant labels or typing something new.
  // Undefined for a category means "use the auto-generated tag."
  hashtagOverrides?: Partial<Record<CategoryKey, string>>;
  paletteKey: PaletteKey;
  // User-chosen background (via long-press on the card), overriding the
  // mood-derived paletteKey. Undefined means "use the mood's own color."
  paletteOverride?: PaletteKey;
  // A user-picked photo used as the card background instead of the mood
  // gradient. Takes priority over paletteOverride/paletteKey when set.
  backgroundImageUri?: string;
  // A preset vector illustration background, mutually exclusive with both
  // backgroundImageUri and paletteOverride (picking one clears the others).
  illustration?: IllustrationKey;
  // Decorative stickers (from src/data/stickers.ts) placed freely on the
  // card, each with its own position/size/rotation.
  stickers?: PlacedSticker[];
  // When true, opening this entry requires biometric auth (independent of
  // the whole-app lock in Settings), for hiding a single sensitive day.
  locked?: boolean;
  // How the diary text lines are aligned within the card. Undefined means
  // the default ('left').
  textAlign?: 'left' | 'center' | 'right';
  // Diary text size. Undefined means the default ('medium').
  textSize?: 'small' | 'medium' | 'large';
};

export type PlacedSticker = {
  // Unique per placement, so the same sticker design can be placed more
  // than once and each copy dragged/resized independently.
  instanceId: string;
  stickerId: string;
  // Center point as a 0-1 fraction of the card's width/height, so the
  // placement holds up across different render sizes (card vs. share image).
  x: number;
  y: number;
  scale: number;
  rotation: number;
};
