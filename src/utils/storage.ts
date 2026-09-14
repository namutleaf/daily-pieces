import AsyncStorage from '@react-native-async-storage/async-storage';
import { composeDiaryText } from './generateDiary';
import { CategoryKey, DiaryEntry, LineKey, PaletteKey, PlacedSticker, ToneKey, WordItem } from '../types';
import { FontKey } from '../data/fonts';

const KEY = 'daily_pieces_entries_v1';
const NAMES_KEY = 'daily_pieces_last_names_v1';
const FONT_KEY = 'daily_pieces_font_pref_v1';
const CUSTOM_WORDS_KEY = 'daily_pieces_custom_words_v1';

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

// Overwrites the whole entry list at once — used by backup import, where
// entries arrive as a batch rather than one at a time.
export async function replaceAllEntries(entries: DiaryEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function updateEntryLock(id: string, locked: boolean): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, locked };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
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

export async function updateBackgroundImage(
  id: string,
  backgroundImageUri: string | undefined
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, backgroundImageUri };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updateTextAlign(
  id: string,
  textAlign: DiaryEntry['textAlign']
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, textAlign };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updateTextSize(
  id: string,
  textSize: DiaryEntry['textSize']
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, textSize };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updateIllustration(
  id: string,
  illustration: DiaryEntry['illustration']
): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, illustration };
    return updated;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return updated;
}

export async function updateStickers(id: string, stickers: PlacedSticker[]): Promise<DiaryEntry | null> {
  const entries = await loadEntries();
  let updated: DiaryEntry | null = null;
  const next = entries.map((e) => {
    if (e.id !== id) return e;
    updated = { ...e, stickers };
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

// User-added word cards, layered on top of the built-in categories in
// src/data/words.ts without touching that static data.
type CustomWordsMap = Partial<Record<CategoryKey, WordItem[]>>;

export async function getCustomWords(): Promise<CustomWordsMap> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_WORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function addCustomWord(categoryKey: CategoryKey, word: WordItem): Promise<void> {
  const map = await getCustomWords();
  const list = map[categoryKey] ?? [];
  map[categoryKey] = [...list, word];
  await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(map));
}

export async function removeCustomWord(categoryKey: CategoryKey, wordId: string): Promise<void> {
  const map = await getCustomWords();
  const list = map[categoryKey] ?? [];
  map[categoryKey] = list.filter((w) => w.id !== wordId);
  await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(map));
}
