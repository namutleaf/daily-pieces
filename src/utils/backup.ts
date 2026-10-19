import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { DiaryEntry } from '../types';
import { loadEntries, replaceAllEntries } from './storage';

export type ExportResult =
  | { ok: true }
  | { ok: false; reason: 'web-unsupported' | 'no-entries' | 'share-unavailable' | 'failed' };

export async function exportEntries(): Promise<ExportResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'web-unsupported' };
  try {
    const entries = await loadEntries();
    if (entries.length === 0) return { ok: false, reason: 'no-entries' };
    const payload = JSON.stringify(
      { app: 'daily-pieces', version: 1, exportedAt: Date.now(), entries },
      null,
      2
    );
    const fileUri = `${FileSystem.cacheDirectory}daily-pieces-backup-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, payload, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return { ok: false, reason: 'share-unavailable' };
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: '일기 백업 내보내기' });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

export type ImportResult =
  | { ok: true; added: number }
  | { ok: false; reason: 'web-unsupported' | 'canceled' | 'invalid-file' | 'failed' };

function isDiaryEntryShape(value: unknown): value is DiaryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return typeof e.id === 'string' && typeof e.diaryText === 'string' && !!e.selections;
}

export async function importEntries(): Promise<ImportResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'web-unsupported' };
  try {
    const picked = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return { ok: false, reason: 'canceled' };

    const content = await FileSystem.readAsStringAsync(picked.assets[0].uri);
    const parsed = JSON.parse(content);
    if (!parsed || !Array.isArray(parsed.entries)) return { ok: false, reason: 'invalid-file' };

    const incoming = parsed.entries.filter(isDiaryEntryShape);
    if (incoming.length === 0) return { ok: false, reason: 'invalid-file' };

    const existing = await loadEntries();
    const existingIds = new Set(existing.map((e) => e.id));
    const toAdd = incoming.filter((e: DiaryEntry) => !existingIds.has(e.id));
    await replaceAllEntries([...existing, ...toAdd]);
    return { ok: true, added: toAdd.length };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
