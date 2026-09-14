import React, { useCallback, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DiaryEntry } from '../types';
import { CATEGORIES } from '../data/words';
import { theme, MOOD_PALETTES } from '../theme';
import { loadEntries } from '../utils/storage';
import {
  computeStreak,
  computeLongestStreak,
  mostFrequentByCategory,
  moodFrequency,
  recentMoodStrip,
} from '../utils/stats';

const MOOD_STRIP_DAYS = 14;

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

export default function StatsScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEntries().then((list) => {
        setEntries(list);
        setLoaded(true);
      });
    }, [])
  );

  const streak = computeStreak(entries);
  const longest = computeLongestStreak(entries);
  const topWords = mostFrequentByCategory(entries);
  const moods = moodFrequency(entries);
  const strip = recentMoodStrip(entries, MOOD_STRIP_DAYS);
  const maxMoodCount = moods[0]?.count ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>나의 기록 통계</Text>
        <View style={{ width: 40 }} />
      </View>

      {loaded && entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 모은 조각이 없어요.</Text>
          <Text style={styles.emptySub}>오늘의 조각을 먼저 모아보세요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>총 기록 수</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>🔥 {streak}</Text>
              <Text style={styles.statLabel}>현재 연속 기록</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{longest}</Text>
              <Text style={styles.statLabel}>최장 연속 기록</Text>
            </View>
          </View>

          {moods.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>기분 흐름</Text>
              <View style={styles.moodStrip}>
                {strip.map((day) => (
                  <View
                    key={day.dateKey}
                    style={[
                      styles.moodStripCell,
                      {
                        backgroundColor: day.paletteKey
                          ? MOOD_PALETTES[day.paletteKey].colors[0]
                          : theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.moodStripHint}>최근 {MOOD_STRIP_DAYS}일</Text>

              <View style={styles.moodList}>
                {moods.map((mood) => (
                  <View key={mood.key} style={styles.moodRow}>
                    <View style={[styles.moodSwatch, { backgroundColor: MOOD_PALETTES[mood.key].colors[0] }]} />
                    <Text style={styles.moodLabel}>{mood.key}</Text>
                    <View style={styles.moodBarTrack}>
                      <View
                        style={[
                          styles.moodBarFill,
                          {
                            width: `${(mood.count / maxMoodCount) * 100}%`,
                            backgroundColor: MOOD_PALETTES[mood.key].colors[1],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.moodCount}>{mood.count}회</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>가장 자주 고른 조각</Text>
          <View style={styles.wordList}>
            {CATEGORIES.map((category) => {
              const top = topWords[category.key];
              if (!top) return null;
              return (
                <View key={category.key} style={styles.wordRow}>
                  <Text style={styles.wordCategory}>{category.title}</Text>
                  <View style={styles.wordValue}>
                    <Text style={styles.wordEmoji}>{top.emoji}</Text>
                    <Text style={styles.wordLabel}>{top.label}</Text>
                    <Text style={styles.wordCount}>{top.count}회</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.accent,
  },
  statLabel: {
    fontSize: 12,
    color: theme.inkSoft,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 12,
  },
  moodStrip: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  moodStripCell: {
    flex: 1,
    height: 28,
    borderRadius: 6,
  },
  moodStripHint: {
    fontSize: 11,
    color: theme.inkSoft,
    textAlign: 'right',
    marginBottom: 16,
  },
  moodList: {
    gap: 10,
    marginBottom: 28,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
    width: 62,
  },
  moodBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  moodCount: {
    fontSize: 12,
    color: theme.inkSoft,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  wordList: {
    gap: 10,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  wordCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  wordValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordEmoji: {
    fontSize: 16,
  },
  wordLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink,
  },
  wordCount: {
    fontSize: 12,
    color: theme.accent,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.ink,
  },
  emptySub: {
    fontSize: 14,
    color: theme.inkSoft,
  },
});
