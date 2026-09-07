import { CATEGORIES } from '../data/words';
import { DiaryEntry, PaletteKey, Selections, ToneKey } from '../types';

// Every fragment and closer is deliberately written to end in a
// "~았/었/였다" past-tense form, so the ending "다" can be swapped for a
// different tone's ending without breaking Korean grammar.
const CLOSERS = [
  '오늘 하루도 이렇게 조용히 지나갔다.',
  '이런 하루도 나쁘지 않았다.',
  '내일은 또 어떤 조각이 모일지 궁금했다.',
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function applyTone(sentence: string, tone: ToneKey): string {
  if (!sentence.endsWith('다.')) return sentence;
  const stem = sentence.slice(0, -2);
  if (tone === 'polite') return `${stem}어요.`;
  if (tone === 'sns') return `${stem}음.`;
  return sentence;
}

export function formatDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAYS[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${w}요일`;
}

export function buildDiaryEntry(selections: Selections, tone: ToneKey): DiaryEntry {
  const closer = pickRandom(CLOSERS);

  const lines = [
    `${selections.weather.fragment}.`,
    `${selections.mood.fragment}.`,
    `${selections.person.fragment}.`,
    `${selections.place.fragment}.`,
    `${selections.activity.fragment}.`,
    `${selections.moment.fragment}.`,
  ].map((line) => applyTone(line, tone));

  const diaryText = [...lines, '', applyTone(closer, tone)].join('\n');

  const hashtags = CATEGORIES.map(
    (c) => `#${selections[c.key].label.replace(/\s+/g, '')}`
  );

  const now = new Date();

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.getTime(),
    dateLabel: formatDateLabel(now),
    selections,
    tone,
    diaryText,
    hashtags,
    paletteKey: selections.mood.label as PaletteKey,
  };
}
