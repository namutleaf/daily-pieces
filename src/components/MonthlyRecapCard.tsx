import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_PALETTE, MOOD_PALETTES } from '../theme';
import { CategoryKey, PaletteKey } from '../types';
import { MonthlyRecap } from '../utils/insights';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const TOP_ROWS: { key: CategoryKey; title: string }[] = [
  { key: 'mood', title: '가장 많이 느낀 기분' },
  { key: 'person', title: '가장 많이 함께한 사람' },
  { key: 'place', title: '가장 자주 머문 곳' },
  { key: 'activity', title: '가장 자주 한 일' },
];

// The shareable "이달의 조각" card — kept as its own captured view so the
// image contains only the card, the same way DiaryCard is captured.
const MonthlyRecapCard = forwardRef<View, { recap: MonthlyRecap }>(({ recap }, ref) => {
  const topMood = recap.top.mood?.label as PaletteKey | undefined;
  const palette = (topMood && MOOD_PALETTES[topMood]) || DEFAULT_PALETTE;

  const cells: (MonthlyRecap['days'][number] | null)[] = [
    ...Array.from({ length: recap.firstWeekday }, () => null),
    ...recap.days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <LinearGradient colors={palette.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.headerRow}>
        <Text style={[styles.brand, { color: palette.text }]}>Daily Pieces</Text>
        <Text style={[styles.month, { color: palette.subtext }]}>
          {recap.year}년 {recap.month + 1}월
        </Text>
      </View>

      <Text style={[styles.kicker, { color: palette.subtext }]}>이달의 조각</Text>
      <Text style={[styles.bigNumber, { color: palette.text }]}>{recap.daysRecorded}일 기록</Text>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={[styles.weekday, { color: palette.subtext }]}>
              {w}
            </Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((cell, ci) => (
              <View key={ci} style={styles.cellSlot}>
                {cell && (
                  <View
                    style={[
                      styles.cell,
                      cell.paletteKey
                        ? { backgroundColor: (MOOD_PALETTES[cell.paletteKey] ?? DEFAULT_PALETTE).colors[1] }
                        : cell.recorded
                          ? styles.cellRecordedPrivate
                          : styles.cellEmpty,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {recap.daysRecorded === 0 ? (
        <Text style={[styles.emptyText, { color: palette.subtext }]}>이 달엔 아직 모은 조각이 없어요</Text>
      ) : (
        <View style={styles.tops}>
          {TOP_ROWS.map(({ key, title }) => {
            const top = recap.top[key];
            if (!top) return null;
            return (
              <View key={key} style={styles.topRow}>
                <Text style={[styles.topTitle, { color: palette.subtext }]}>{title}</Text>
                <Text style={[styles.topValue, { color: palette.text }]}>
                  {top.emoji} {top.label} · {top.count}번
                </Text>
              </View>
            );
          })}
          {recap.brightRate !== null && (
            <Text style={[styles.footer, { color: palette.text }]}>
              기분 좋은 날 {Math.round(recap.brightRate * 100)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

MonthlyRecapCard.displayName = 'MonthlyRecapCard';
export default MonthlyRecapCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  month: {
    fontSize: 12,
    fontWeight: '600',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
  },
  bigNumber: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 16,
  },
  grid: {
    gap: 5,
    marginBottom: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 5,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  cellSlot: {
    flex: 1,
    aspectRatio: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  cellEmpty: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'transparent',
  },
  cellRecordedPrivate: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
  tops: {
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  topValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
});
