import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { getNotifPref, setNotifPref, applyNotificationSchedule, NotifPref } from '../utils/notifications';
import { getLockEnabled, setLockEnabled, checkLockSupport } from '../utils/lock';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const HOUR_PRESETS = [8, 12, 18, 21, 22];

export default function SettingsScreen({ navigation }: Props) {
  const [notif, setNotif] = useState<NotifPref>({ enabled: false, hour: 21, minute: 0 });
  const [lockEnabled, setLockEnabledState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getNotifPref(), getLockEnabled()]).then(([pref, lock]) => {
      setNotif(pref);
      setLockEnabledState(lock);
      setLoaded(true);
    });
  }, []);

  const handleToggleNotif = async (enabled: boolean) => {
    const next = { ...notif, enabled };
    setNotif(next);
    await setNotifPref(next);
    const result = await applyNotificationSchedule(next);
    if (!result.ok) {
      if (result.reason === 'web-unsupported') {
        Alert.alert('알림은 앱에서만', '웹 미리보기에서는 알림을 예약할 수 없어요. 실제 기기에서 확인해주세요.');
      } else if (result.reason === 'permission-denied') {
        Alert.alert('권한이 필요해요', '알림 권한을 허용해야 매일 알림을 받을 수 있어요.');
        setNotif({ ...next, enabled: false });
        await setNotifPref({ ...next, enabled: false });
      }
    }
  };

  const handlePickHour = async (hour: number) => {
    const next = { ...notif, hour };
    setNotif(next);
    await setNotifPref(next);
    if (next.enabled) await applyNotificationSchedule(next);
  };

  const handleToggleLock = async (enabled: boolean) => {
    if (enabled) {
      const support = await checkLockSupport();
      if (!support.supported) {
        if (support.reason === 'web-unsupported') {
          Alert.alert('잠금은 앱에서만', '웹 미리보기에서는 생체 잠금을 설정할 수 없어요. 실제 기기에서 확인해주세요.');
        } else if (support.reason === 'no-hardware') {
          Alert.alert('사용할 수 없어요', '이 기기에는 지문/얼굴 인식 기능이 없어요.');
        } else if (support.reason === 'not-enrolled') {
          Alert.alert('등록이 필요해요', '기기 설정에서 지문 또는 얼굴 인식을 먼저 등록해주세요.');
        }
        return;
      }
    }
    setLockEnabledState(enabled);
    await setLockEnabled(enabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('FontSettings')}>
          <Text style={styles.linkText}>글꼴 설정</Text>
          <Text style={styles.linkArrow}>›</Text>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>매일 알림</Text>
            <Switch
              value={notif.enabled}
              onValueChange={handleToggleNotif}
              disabled={!loaded}
              trackColor={{ true: theme.accent }}
            />
          </View>
          <Text style={styles.sectionHint}>정해진 시간에 오늘의 조각을 모아보라고 알려드려요.</Text>
          {notif.enabled && (
            <View style={styles.hourRow}>
              {HOUR_PRESETS.map((h) => {
                const active = notif.hour === h;
                return (
                  <Pressable
                    key={h}
                    style={[styles.hourChip, active && styles.hourChipActive]}
                    onPress={() => handlePickHour(h)}
                  >
                    <Text style={[styles.hourChipText, active && styles.hourChipTextActive]}>
                      {h}시
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>잠금 기능</Text>
            <Switch
              value={lockEnabled}
              onValueChange={handleToggleLock}
              disabled={!loaded}
              trackColor={{ true: theme.accent }}
            />
          </View>
          <Text style={styles.sectionHint}>
            {Platform.OS === 'web'
              ? '지문/얼굴 인식은 실제 기기에서만 사용할 수 있어요.'
              : '앱을 열 때마다 지문 또는 얼굴 인식으로 잠금을 해제해요.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 15,
    color: theme.inkSoft,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.ink,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
  },
  linkArrow: {
    fontSize: 18,
    color: theme.inkSoft,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.inkSoft,
    lineHeight: 18,
  },
  hourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.accentSoft,
  },
  hourChipActive: {
    backgroundColor: theme.accent,
  },
  hourChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
  },
  hourChipTextActive: {
    color: '#fff',
  },
});
