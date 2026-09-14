import { CATEGORIES } from '../data/words';
import { CategoryKey, DiaryEntry, PaletteKey } from '../types';

export function dateKeyFromTimestamp(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// A streak stays "alive" through today even if today's entry hasn't been
// made yet, as long as yesterday's was — it only breaks after a full day
// is missed entirely.
export function computeStreak(entries: DiaryEntry[]): number {
  const days = new Set(entries.map((e) => dateKeyFromTimestamp(e.createdAt)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  if (!days.has(dateKeyFromTimestamp(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dateKeyFromTimestamp(cursor.getTime()))) return 0;
  }

  let streak = 0;
  while (days.has(dateKeyFromTimestamp(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// "YYYY-MM-DD" parses as UTC midnight if handed straight to `new Date(...)`,
// not local midnight — a classic footgun. Split it ourselves so this always
// lines up with the local-time dates used everywhere else in this file.
function parseDateKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function computeLongestStreak(entries: DiaryEntry[]): number {
  const days = Array.from(new Set(entries.map((e) => dateKeyFromTimestamp(e.createdAt)))).sort();
  if (days.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const diffDays = Math.round((parseDateKey(days[i]) - parseDateKey(days[i - 1])) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

export function groupEntriesByDate(entries: DiaryEntry[]): Map<string, DiaryEntry[]> {
  const map = new Map<string, DiaryEntry[]>();
  for (const e of entries) {
    const key = dateKeyFromTimestamp(e.createdAt);
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }
  return map;
}

export type TopWord = { label: string; emoji: string; count: number };

export function mostFrequentByCategory(
  entries: DiaryEntry[]
): Partial<Record<CategoryKey, TopWord>> {
  const tally: Partial<Record<CategoryKey, Record<string, TopWord>>> = {};

  for (const entry of entries) {
    for (const category of CATEGORIES) {
      const word = entry.selections[category.key];
      const byLabel = tally[category.key] ?? (tally[category.key] = {});
      const existing = byLabel[word.label];
      byLabel[word.label] = existing
        ? { ...existing, count: existing.count + 1 }
        : { label: word.label, emoji: word.emoji, count: 1 };
    }
  }

  const result: Partial<Record<CategoryKey, TopWord>> = {};
  for (const category of CATEGORIES) {
    const byLabel = tally[category.key];
    if (!byLabel) continue;
    const top = Object.values(byLabel).sort((a, b) => b.count - a.count)[0];
    result[category.key] = top;
  }
  return result;
}

export type MoodCount = { key: PaletteKey; count: number };

export function moodFrequency(entries: DiaryEntry[]): MoodCount[] {
  const tally = new Map<PaletteKey, number>();
  for (const e of entries) {
    tally.set(e.paletteKey, (tally.get(e.paletteKey) ?? 0) + 1);
  }
  return Array.from(tally.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export type MoodStripDay = { dateKey: string; paletteKey: PaletteKey | null };

// The last `days` calendar days (today last), each tagged with that day's
// recorded mood — the actual word picked, not any cosmetic background
// re-skin — so a "기분 흐름" strip can be drawn without a charting library.
export function recentMoodStrip(entries: DiaryEntry[], days: number): MoodStripDay[] {
  const byDate = groupEntriesByDate(entries);
  const today = new Date();
  const result: MoodStripDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = dateKeyFromTimestamp(d.getTime());
    const dayEntries = byDate.get(key);
    result.push({ dateKey: key, paletteKey: dayEntries?.[0]?.paletteKey ?? null });
  }
  return result;
}
