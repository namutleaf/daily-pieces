import AsyncStorage from '@react-native-async-storage/async-storage';
import { composeDiaryText } from './generateDiary';
import { DiaryEntry, LineKey, PaletteKey, ToneKey } from '../types';
import { FontKey } from '../data/fonts';

const KEY = 'daily_pieces_entries_v1';
const NAMES_KEY = 'daily_pieces_last_names_v1';
const FONT_KEY = 'daily_pieces_font_pref_v1';

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

// Merges one or more final (already-toned) line texts into an entry's
// overrides, whether they came from picking a preset alternative or typing
// directly — both go through this single path so word-swap keeps working
// no matter how a line was last changed.
export async function updateLineOverrides(
  id: string,
  patch: Partial<Record<LineKey, string>>
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    const lineOverrides = { ...e.lineOverrides, ...patch };
    const diaryText = composeDiaryText(
      e.selections,
      lineOverrides,
      e.closerFragment,
      e.tone,
      e.personName
    );
    updated = { ...e, lineOverrides, diaryText };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

// Used once, right when a diary is created: the user's own typed sentence
// sets the tone for the whole entry, and is appended as its own line.
export async function applyCustomLineAndTone(
  id: string,
  tone: ToneKey,
  customText: string
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    const lineOverrides = { ...e.lineOverrides, custom: customText };
    const diaryText = composeDiaryText(e.selections, lineOverrides, e.closerFragment, tone, e.personName);
    updated = { ...e, tone, lineOverrides, diaryText };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updatePaletteOverride(
  id: string,
  paletteOverride: PaletteKey | undefined
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, paletteOverride };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function getFontPreference(): Promise<FontKey> {
  try {
    const raw = await AsyncStorage.getItem(FONT_KEY);
    return (raw as FontKey) ?? 'system';
  } catch {
    return 'system';
  }
}

export async function setFontPreference(key: FontKey): Promise<void> {
  try {
    await AsyncStorage.setItem(FONT_KEY, key);
  } catch {
    // best-effort only
  }
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
