import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const PREF_KEY = 'daily_pieces_notif_pref_v1';

export type NotifPref = { enabled: boolean; hour: number; minute: number };

const DEFAULT_PREF: NotifPref = { enabled: false, hour: 21, minute: 0 };

export async function getNotifPref(): Promise<NotifPref> {
  try {
    const raw = await AsyncStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PREF;
  } catch {
    return DEFAULT_PREF;
  }
}

export async function setNotifPref(pref: NotifPref): Promise<void> {
  await AsyncStorage.setItem(PREF_KEY, JSON.stringify(pref));
}

export type ApplyResult = { ok: boolean; reason?: 'web-unsupported' | 'permission-denied' };

// Cancels any previously scheduled reminder and, if enabled, schedules the
// single daily one at the chosen time. Local-only — no server/push needed.
export async function applyNotificationSchedule(pref: NotifPref): Promise<ApplyResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'web-unsupported' };

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!pref.enabled) return { ok: true };

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return { ok: false, reason: 'permission-denied' };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Pieces',
      body: '오늘의 조각을 모아볼 시간이에요 ✨',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: pref.hour,
      minute: pref.minute,
    },
  });
  return { ok: true };
}
