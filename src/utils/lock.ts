import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const LOCK_KEY = 'daily_pieces_lock_enabled_v1';

export async function getLockEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(LOCK_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setLockEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(LOCK_KEY, enabled ? '1' : '0');
}

export type LockSupport = { supported: boolean; reason?: 'web-unsupported' | 'no-hardware' | 'not-enrolled' };

export async function checkLockSupport(): Promise<LockSupport> {
  if (Platform.OS === 'web') return { supported: false, reason: 'web-unsupported' };
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return { supported: false, reason: 'no-hardware' };
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return { supported: false, reason: 'not-enrolled' };
  return { supported: true };
}

export async function authenticate(promptMessage: string): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const result = await LocalAuthentication.authenticateAsync({ promptMessage });
  return result.success;
}
