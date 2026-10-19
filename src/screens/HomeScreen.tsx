import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { DiaryEntry } from '../types';
import { loadEntries } from '../utils/storage';
import { computeStreak } from '../utils/stats';
import { findOnThisDayMemory, Memory } from '../utils/memories';
import { checkAndUnlockMilestones } from '../utils/milestones';
import { findStickerById } from '../data/stickers';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [streak, setStreak] = useState(0);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [celebrateMilestone, setCelebrateMilestone] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadEntries().then(async (entries: DiaryEntry[]) => {
        if (cancelled) return;
        const currentStreak = computeStreak(entries);
        setStreak(currentStreak);
        setMemory(findOnThisDayMemory(entries));

        const newlyUnlocked = await checkAndUnlockMilestones(currentStreak);
        if (!cancelled && newlyUnlocked.length > 0) {
          setCelebrateMilestone(Math.max(...newlyUnlocked));
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const celebrateSticker = celebrateMilestone
    ? findStickerById(`milestone-${celebrateMilestone}`)
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={() => navigation.navigate('Stats')}
          hitSlop={12}
        >
          <Text style={styles.settingsText}>📊 통계</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={() => navigation.navigate('Settings')}
          hitSlop={12}
        >
          <Text style={styles.settingsText}>⚙️ 설정</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.kicker}>DAILY PIECES</Text>
        <Text style={styles.title}>단어 조각으로{'\n'}오늘을 기록해요</Text>
        <Text style={styles.subtitle}>
          카드를 하나씩 고르면{'\n'}짧은 일기가 완성돼요
        </Text>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak}일 연속 기록 중</Text>
          </View>
        )}

        {memory && (
          <Pressable
            style={({ pressed }) => [styles.memoryCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Result', { entry: memory.entry, fromHistory: true })}
          >
            <Text style={styles.memoryLabel}>✨ {memory.label}</Text>
            <Text style={styles.memoryText} numberOfLines={2}>
              {memory.entry.diaryText.split('\n').find((line) => line.trim().length > 0)}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ToneSelect')}
        >
          <Text style={styles.primaryBtnText}>오늘의 조각 모으기</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.secondaryBtnText}>지난 조각들 보기</Text>
        </Pressable>
      </View>

      <Modal visible={celebrateMilestone !== null} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>{celebrateSticker?.emoji ?? '🎉'}</Text>
            <Text style={styles.celebrateTitle}>{celebrateMilestone}일 연속 기록 달성!</Text>
            <Text style={styles.celebrateSub}>보너스 스티커가 열렸어요. 일기 카드 꾸미기에서 붙여보세요.</Text>
            <Pressable
              style={({ pressed }) => [styles.celebrateBtn, pressed && styles.pressed]}
              onPress={() => setCelebrateMilestone(null)}
            >
              <Text style={styles.celebrateBtnText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  hero: {
    marginTop: 24,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.accent,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.ink,
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.inkSoft,
    lineHeight: 24,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 20,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.accent,
  },
  memoryCard: {
    marginTop: 16,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 16,
    gap: 6,
  },
  memoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.accent,
  },
  memoryText: {
    fontSize: 14,
    color: theme.ink,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  secondaryBtnText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  celebrateCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  celebrateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrateTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  celebrateSub: {
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  celebrateBtn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  celebrateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
