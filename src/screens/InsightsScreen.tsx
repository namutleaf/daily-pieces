import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DiaryEntry } from '../types';
import { theme } from '../theme';
import { loadEntries } from '../utils/storage';
import { computeLongestStreak, computeStreak } from '../utils/stats';
import { buildMonthlyRecap, findPatterns } from '../utils/insights';
import { shareCardImage } from '../utils/cardImage';
import PatternCard from '../components/PatternCard';
import MonthlyRecapCard from '../components/MonthlyRecapCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

export default function InsightsScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [sharing, setSharing] = useState(false);
  const recapRef = useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      loadEntries().then((list) => {
        setEntries(list);
        setLoaded(true);
      });
    }, [])
  );

  const patterns = useMemo(() => findPatterns(entries), [entries]);
  const recap = useMemo(() => buildMonthlyRecap(entries, cursor.year, cursor.month), [entries, cursor]);

  const now = new Date();
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const handleShareRecap = async () => {
    setSharing(true);
    const mm = String(cursor.month + 1).padStart(2, '0');
    await shareCardImage(recapRef, `daily-pieces-${cursor.year}-${mm}.png`);
    setSharing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>나의 조각들</Text>
        <View style={{ width: 40 }} />
      </View>

      {loaded && entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 모은 조각이 없어요.</Text>
          <Text style={styles.emptySub}>조각이 쌓이면 나만의 패턴을 찾아드려요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>총 기록</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>🔥 {computeStreak(entries)}</Text>
              <Text style={styles.statLabel}>연속 기록</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{computeLongestStreak(entries)}</Text>
              <Text style={styles.statLabel}>최장 연속</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>발견한 패턴</Text>
          <Text style={styles.sectionHint}>내 기분과 함께 자주 나타난 조각들이에요</Text>
          {patterns.status === 'collecting' ? (
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>
                조각 {patterns.need - patterns.have}개만 더 모으면{'\n'}나만의 패턴을 찾아드려요
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${(patterns.have / patterns.need) * 100}%` }]} />
              </View>
              <Text style={styles.progressCount}>
                {patterns.have} / {patterns.need}
              </Text>
            </View>
          ) : patterns.patterns.length === 0 ? (
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>아직 뚜렷한 패턴은 없어요</Text>
              <Text style={styles.progressSub}>다양한 날을 기록할수록 더 잘 보여요</Text>
            </View>
          ) : (
            <View style={styles.patternList}>
              {patterns.patterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, styles.sectionGap]}>월간 회고</Text>
          <View style={styles.monthNav}>
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={10}>
              <Text style={styles.monthNavBtn}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>
              {cursor.year}년 {cursor.month + 1}월
            </Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={10} disabled={isCurrentMonth}>
              <Text style={[styles.monthNavBtn, isCurrentMonth && styles.monthNavDisabled]}>›</Text>
            </Pressable>
          </View>
          <MonthlyRecapCard ref={recapRef} recap={recap} />
          {recap.daysRecorded > 0 && (
            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
              onPress={handleShareRecap}
              disabled={sharing}
            >
              <Text style={styles.shareBtnText}>이달의 조각 공유하기</Text>
            </Pressable>
          )}
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
    paddingBottom: 40,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.ink,
    marginBottom: 4,
  },
  sectionGap: {
    marginTop: 32,
  },
  sectionHint: {
    fontSize: 13,
    color: theme.inkSoft,
    marginBottom: 12,
  },
  patternList: {
    gap: 10,
  },
  progressCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSub: {
    fontSize: 13,
    color: theme.inkSoft,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.accent,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.accent,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 12,
  },
  monthNavBtn: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.accent,
    paddingHorizontal: 12,
  },
  monthNavDisabled: {
    color: theme.border,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    minWidth: 100,
    textAlign: 'center',
  },
  shareBtn: {
    marginTop: 14,
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
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
