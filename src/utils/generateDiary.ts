import { CATEGORIES } from '../data/words';
import { DiaryEntry, PaletteKey, Selections } from '../types';

const OPENERS = [
  '오늘의 조각들을 모아보면,',
  '하루를 몇 개의 단어로 남겨본다면,',
  '오늘을 기록해두고 싶어서 몇 자 적는다.',
];

const CLOSERS = [
  '오늘 하루도 이렇게 조용히 저물어간다.',
  '이런 하루도 나쁘지 않았다.',
  '내일은 또 어떤 조각이 모일지 궁금하다.',
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function formatDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAYS[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${w}요일`;
}

export function buildDiaryEntry(selections: Selections): DiaryEntry {
  const opener = pickRandom(OPENERS);
  const closer = pickRandom(CLOSERS);

  const lines = [
    `${selections.weather.fragment}.`,
    `${selections.mood.fragment}.`,
    `${selections.person.fragment}.`,
    `${selections.place.fragment}.`,
    `${selections.activity.fragment}.`,
    `${selections.moment.fragment}.`,
  ];

  const diaryText = [opener, '', ...lines, '', closer].join('\n');

  const hashtags = CATEGORIES.map(
    (c) => `#${selections[c.key].label.replace(/\s+/g, '')}`
  );

  const now = new Date();

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.getTime(),
    dateLabel: formatDateLabel(now),
    selections,
    diaryText,
    hashtags,
    paletteKey: selections.mood.label as PaletteKey,
  };
}
