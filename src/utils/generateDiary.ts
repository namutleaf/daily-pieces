import { CATEGORIES } from '../data/words';
import { CategoryKey, DiaryEntry, LineKey, PaletteKey, Selections, ToneKey } from '../types';

// Every fragment and closer is deliberately written to end in a
// "~았/었/였다" past-tense form, so the ending "다" can be swapped for a
// different tone's ending without breaking Korean grammar.
export const CLOSER_OPTIONS = [
  { label: '조용히 지나갔다', fragment: '오늘 하루도 이렇게 조용히 지나갔다' },
  { label: '나쁘지 않았다', fragment: '이런 하루도 나쁘지 않았다' },
  { label: '내일이 궁금하다', fragment: '내일은 또 어떤 조각이 모일지 궁금했다' },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function applyTone(baseFragment: string, tone: ToneKey): string {
  const sentence = `${baseFragment}.`;
  if (tone === 'polite') return `${baseFragment.slice(0, -1)}어요.`;
  if (tone === 'sns') return `${baseFragment.slice(0, -1)}음.`;
  return sentence;
}

export function formatDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAYS[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${w}요일`;
}

export function defaultBaseFragment(
  selections: Selections,
  categoryKey: CategoryKey,
  personName?: string
): string {
  const word = selections[categoryKey];
  if (categoryKey === 'person' && word.nameable && personName && word.fragmentTemplate) {
    return word.fragmentTemplate(personName);
  }
  return word.fragment;
}

export function lineFinalText(
  selections: Selections,
  key: LineKey,
  lineOverrides: Partial<Record<LineKey, string>>,
  closerFragment: string,
  tone: ToneKey,
  personName?: string
): string {
  if (lineOverrides[key] !== undefined) return lineOverrides[key]!;
  if (key === 'closer') return applyTone(closerFragment, tone);
  if (key === 'custom') return '';
  return applyTone(defaultBaseFragment(selections, key, personName), tone);
}

export function composeDiaryText(
  selections: Selections,
  lineOverrides: Partial<Record<LineKey, string>>,
  closerFragment: string,
  tone: ToneKey,
  personName?: string
): string {
  const lines = CATEGORIES.map((c) =>
    lineFinalText(selections, c.key, lineOverrides, closerFragment, tone, personName)
  );
  const closerLine = lineFinalText(selections, 'closer', lineOverrides, closerFragment, tone, personName);
  const parts = [...lines, '', closerLine];
  if (lineOverrides.custom) {
    parts.push('', lineOverrides.custom);
  }
  return parts.join('\n');
}

export function buildDiaryEntry(
  selections: Selections,
  tone: ToneKey,
  personName?: string
): DiaryEntry {
  const closerFragment = pickRandom(CLOSER_OPTIONS).fragment;
  const lineOverrides: Partial<Record<LineKey, string>> = {};

  const diaryText = composeDiaryText(selections, lineOverrides, closerFragment, tone, personName);

  const hashtags = CATEGORIES.map(
    (c) => `#${selections[c.key].label.replace(/\s+/g, '')}`
  );

  const now = new Date();

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.getTime(),
    dateLabel: formatDateLabel(now),
    selections,
    personName,
    lineOverrides,
    closerFragment,
    tone,
    diaryText,
    hashtags,
    paletteKey: selections.mood.label as PaletteKey,
  };
}
