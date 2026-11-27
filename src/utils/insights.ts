import { CATEGORIES } from '../data/words';
import { CategoryKey, DiaryEntry, PaletteKey } from '../types';
import { dateKeyFromTimestamp, groupEntriesByDate } from './stats';

// The payoff of structured entries: because every diary records the same
// six slots, the app can notice what tends to come with a good (or heavy)
// day — something a free-text or chat-generated diary can't do.

export type MoodValence = 'bright' | 'low';

// 심심함 and user-added mood words are deliberately left out: they're not
// clearly good or bad, and guessing would skew every pattern built on them.
const MOOD_VALENCE: Record<string, MoodValence> = {
  설렘: 'bright',
  평온: 'bright',
  뿌듯: 'bright',
  행복: 'bright',
  두근두근: 'bright',
  홀가분함: 'bright',
  감사함: 'bright',
  짜릿함: 'bright',
  몽글몽글함: 'bright',
  벅참: 'bright',
  피곤: 'low',
  그리움: 'low',
  '살짝 우울': 'low',
  답답함: 'low',
  허전함: 'low',
};

export function moodValence(entry: DiaryEntry): MoodValence | null {
  return MOOD_VALENCE[entry.selections.mood.label] ?? null;
}

export const MIN_ENTRIES_FOR_PATTERNS = 7;
const MIN_SUPPORT = 3;
const MIN_HITS = 2;
const MIN_LIFT = 0.15;
const MIN_WEEKDAY_LIFT = 0.2;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
// Ordered by how actionable the insight is — "who/what lifts my mood" beats
// "sunny days are nice" — and used to break ties between equally strong
// patterns.
const PATTERN_CATEGORIES: CategoryKey[] = ['person', 'activity', 'place', 'moment', 'weather'];

// A named person ("민준") is more telling than the generic card ("친구").
function labelFor(entry: DiaryEntry, key: CategoryKey): string {
  if (key === 'person' && entry.personName) return entry.personName;
  return entry.selections[key].label;
}

// Locked entries are locked so their content doesn't surface; patterns and
// recap highlights are built from content, so they skip them.
function visible(entries: DiaryEntry[]): DiaryEntry[] {
  return entries.filter((e) => !e.locked);
}

export type Pattern = {
  id: string;
  kind: MoodValence | 'weekday';
  categoryTitle: string;
  emoji: string;
  label: string;
  detail: string;
  count: number;
  hits: number;
  lift: number;
};

export type PatternResult =
  | { status: 'collecting'; have: number; need: number }
  | { status: 'ready'; patterns: Pattern[] };

function categoryTitle(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.title ?? '';
}

function labelPatterns(rated: { entry: DiaryEntry; valence: MoodValence }[], valence: MoodValence): Pattern[] {
  const base = rated.filter((r) => r.valence === valence).length / rated.length;
  const patterns: Pattern[] = [];

  // At most one pattern per category: the same good days tend to share a
  // weather, a place and an activity, and three cards restating one cluster
  // would crowd out a different, more telling one (like a person).
  for (const key of PATTERN_CATEGORIES) {
    const candidates: Pattern[] = [];
    const tally = new Map<string, { emoji: string; count: number; hits: number }>();
    for (const { entry, valence: v } of rated) {
      const label = labelFor(entry, key);
      const t = tally.get(label) ?? { emoji: entry.selections[key].emoji, count: 0, hits: 0 };
      t.count += 1;
      if (v === valence) t.hits += 1;
      tally.set(label, t);
    }
    for (const [label, t] of tally) {
      if (t.count < MIN_SUPPORT || t.hits < MIN_HITS) continue;
      const rate = t.hits / t.count;
      const lift = rate - base;
      if (lift < MIN_LIFT || rate < 0.5) continue;
      candidates.push({
        id: `${valence}-${key}-${label}`,
        kind: valence,
        categoryTitle: categoryTitle(key),
        emoji: t.emoji,
        label,
        detail:
          valence === 'bright'
            ? `${t.count}번 중 ${t.hits}번은 기분이 좋았어요`
            : `${t.count}번 중 ${t.hits}번은 마음이 가라앉았어요`,
        count: t.count,
        hits: t.hits,
        lift,
      });
    }
    const best = candidates.sort((a, b) => b.lift - a.lift || b.count - a.count)[0];
    if (best) patterns.push(best);
  }
  // Stable sort keeps PATTERN_CATEGORIES order for (near-)equal lifts.
  return patterns.sort((a, b) => Math.round((b.lift - a.lift) * 100) / 100);
}

function weekdayPattern(rated: { entry: DiaryEntry; valence: MoodValence }[]): Pattern | null {
  const base = rated.filter((r) => r.valence === 'bright').length / rated.length;
  const byDay = WEEKDAYS.map(() => ({ count: 0, hits: 0 }));
  for (const { entry, valence } of rated) {
    const d = byDay[new Date(entry.createdAt).getDay()];
    d.count += 1;
    if (valence === 'bright') d.hits += 1;
  }
  let best: Pattern | null = null;
  byDay.forEach((d, i) => {
    if (d.count < MIN_SUPPORT) return;
    const rate = d.hits / d.count;
    const lift = rate - base;
    if (lift < MIN_WEEKDAY_LIFT || rate < 0.6) return;
    if (best && lift <= best.lift) return;
    best = {
      id: `weekday-${i}`,
      kind: 'weekday',
      categoryTitle: '요일',
      emoji: '📅',
      label: `${WEEKDAYS[i]}요일`,
      detail: `기분 좋은 날이 가장 많은 요일이에요 (${d.count}번 중 ${d.hits}번)`,
      count: d.count,
      hits: d.hits,
      lift,
    };
  });
  return best;
}

export function findPatterns(allEntries: DiaryEntry[]): PatternResult {
  const entries = visible(allEntries);
  if (entries.length < MIN_ENTRIES_FOR_PATTERNS) {
    return { status: 'collecting', have: entries.length, need: MIN_ENTRIES_FOR_PATTERNS };
  }
  const rated = entries
    .map((entry) => ({ entry, valence: moodValence(entry) }))
    .filter((r): r is { entry: DiaryEntry; valence: MoodValence } => r.valence !== null);
  if (rated.length === 0) return { status: 'ready', patterns: [] };

  const bright = labelPatterns(rated, 'bright').slice(0, 4);
  const low = labelPatterns(rated, 'low').slice(0, 2);
  const weekday = weekdayPattern(rated);
  return { status: 'ready', patterns: [...bright, ...(weekday ? [weekday] : []), ...low] };
}

export type TopPick = { label: string; emoji: string; count: number };

function topByCategory(entries: DiaryEntry[]): Partial<Record<CategoryKey, TopPick>> {
  const result: Partial<Record<CategoryKey, TopPick>> = {};
  for (const { key } of CATEGORIES) {
    const tally = new Map<string, TopPick>();
    for (const entry of entries) {
      const label = labelFor(entry, key);
      const t = tally.get(label) ?? { label, emoji: entry.selections[key].emoji, count: 0 };
      t.count += 1;
      tally.set(label, t);
    }
    const top = [...tally.values()].sort((a, b) => b.count - a.count)[0];
    if (top) result[key] = top;
  }
  return result;
}

export type RecapDay = { day: number; recorded: boolean; paletteKey: PaletteKey | null };

export type MonthlyRecap = {
  year: number;
  month: number;
  firstWeekday: number;
  days: RecapDay[];
  daysRecorded: number;
  top: Partial<Record<CategoryKey, TopPick>>;
  brightRate: number | null;
};

export function buildMonthlyRecap(allEntries: DiaryEntry[], year: number, month: number): MonthlyRecap {
  const inMonth = allEntries.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const shown = visible(inMonth);
  const allByDate = groupEntriesByDate(inMonth);
  const shownByDate = groupEntriesByDate(shown);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: RecapDay[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKeyFromTimestamp(new Date(year, month, day).getTime());
    days.push({
      day,
      recorded: !!allByDate.get(key)?.length,
      paletteKey: shownByDate.get(key)?.[0]?.paletteKey ?? null,
    });
  }

  const rated = shown.map(moodValence).filter((v): v is MoodValence => v !== null);
  return {
    year,
    month,
    firstWeekday: new Date(year, month, 1).getDay(),
    days,
    daysRecorded: days.filter((d) => d.recorded).length,
    top: topByCategory(shown),
    brightRate: rated.length ? rated.filter((v) => v === 'bright').length / rated.length : null,
  };
}
