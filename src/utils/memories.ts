import { DiaryEntry } from '../types';
import { dateKeyFromTimestamp, groupEntriesByDate } from './stats';

export type Memory = { label: string; entry: DiaryEntry };

// Looks for a past entry that lands on an exact calendar anniversary of
// today — years first (most delightful), falling back to a month or a
// week ago for accounts too new to have a yearly memory yet. All purely
// local date math, no server needed.
export function findOnThisDayMemory(entries: DiaryEntry[], now: Date = new Date()): Memory | null {
  // A locked entry is locked precisely so its content doesn't surface
  // unguarded — showing it as a "1 year ago today" preview (or opening it
  // straight from the home screen with no biometric check, unlike History)
  // would defeat that.
  const byDate = groupEntriesByDate(entries.filter((e) => !e.locked));

  const yearsAgo = [1, 2, 3].map((years) => ({
    label: `${years}년 전 오늘`,
    date: new Date(now.getFullYear() - years, now.getMonth(), now.getDate()),
  }));
  for (const candidate of yearsAgo) {
    const found = byDate.get(dateKeyFromTimestamp(candidate.date.getTime()));
    if (found?.length) return { label: candidate.label, entry: found[0] };
  }

  const shorter = [
    { label: '1개월 전 오늘', date: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) },
    { label: '1주일 전 오늘', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
  ];
  for (const candidate of shorter) {
    const found = byDate.get(dateKeyFromTimestamp(candidate.date.getTime()));
    if (found?.length) return { label: candidate.label, entry: found[0] };
  }

  return null;
}
