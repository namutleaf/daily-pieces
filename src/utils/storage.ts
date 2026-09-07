import AsyncStorage from '@react-native-async-storage/async-storage';
import { composeDiaryText } from './generateDiary';
import { CategoryKey, DiaryEntry } from '../types';

const KEY = 'daily_pieces_entries_v1';
const NAMES_KEY = 'daily_pieces_last_names_v1';

export async function loadEntries(): Promise<DiaryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DiaryEntry[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveEntry(entry: DiaryEntry): Promise<void> {
  const entries = await loadEntries();
  entries.unshift(entry);
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function removeEntry(id: string): Promise<void> {
  const entries = await loadEntries();
  const next = entries.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function updateManualText(id: string, manualText: string): Promise<void> {
  const entries = await loadEntries();
  const next = entries.map((e) =>
    e.id === id ? { ...e, manualText, diaryText: manualText } : e
  );
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function updateEntryFragment(
  id: string,
  categoryKey: CategoryKey,
  fragment: string
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    const fragmentOverrides = { ...e.fragmentOverrides, [categoryKey]: fragment };
    const diaryText = composeDiaryText(
      e.selections,
      fragmentOverrides,
      e.closerFragment,
      e.tone,
      e.personName
    );
    updated = { ...e, fragmentOverrides, diaryText, manualText: undefined };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updateEntryCloser(id: string, closerFragment: string): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    const diaryText = composeDiaryText(
      e.selections,
      e.fragmentOverrides,
      closerFragment,
      e.tone,
      e.personName
    );
    updated = { ...e, closerFragment, diaryText, manualText: undefined };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function getLastName(wordId: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(NAMES_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[wordId] ?? null;
  } catch {
    return null;
  }
}

export async function setLastName(wordId: string, name: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NAMES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[wordId] = name;
    await AsyncStorage.setItem(NAMES_KEY, JSON.stringify(map));
  } catch {
    // best-effort only
  }
}
