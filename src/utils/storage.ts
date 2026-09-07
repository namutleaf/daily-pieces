import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';

const KEY = 'daily_pieces_entries_v1';

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

export async function updateEntryText(id: string, diaryText: string): Promise<void> {
  const entries = await loadEntries();
  const next = entries.map((e) => (e.id === id ? { ...e, diaryText } : e));
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
