import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { DiaryEntry } from '../types';
import { dateKeyFromTimestamp, groupEntriesByDate } from '../utils/stats';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  entries: DiaryEntry[];
  onSelectDay: (entry: DiaryEntry) => void;
};

export default function CalendarGrid({ entries, onSelectDay }: Props) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const byDate = useMemo(() => groupEntriesByDate(entries), [entries]);
  const todayKey = dateKeyFromTimestamp(Date.now());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKeyFromTimestamp(new Date(year, month, d).getTime());
    cells.push({ day: d, key });
  }

  const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
  const goNextMonth = () => setCursor(new Date(year, month + 1, 1));

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={goPrevMonth} hitSlop={10}>
          <Text style={styles.nav}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {year}년 {month + 1}월
        </Text>
        <Pressable onPress={goNextMonth} hitSlop={10}>
          <Text style={styles.nav}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, i) => {
          if (!cell) return <View key={`blank-${i}`} style={styles.cell} />;
          const dayEntries = byDate.get(cell.key);
          const hasEntry = !!dayEntries?.length;
          const isToday = cell.key === todayKey;
          return (
            <Pressable
              key={cell.key}
              style={styles.cell}
              disabled={!hasEntry}
              onPress={() => dayEntries && onSelectDay(dayEntries[0])}
            >
              <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                <Text style={[styles.dayText, isToday && styles.todayText]}>{cell.day}</Text>
              </View>
              {hasEntry && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 14,
  },
  nav: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.accent,
    paddingHorizontal: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.ink,
    minWidth: 100,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: theme.accentSoft,
  },
  dayText: {
    fontSize: 13,
    color: theme.ink,
  },
  todayText: {
    fontWeight: '700',
    color: theme.accent,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.accent,
  },
});
