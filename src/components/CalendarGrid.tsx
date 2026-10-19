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

type Cell = { day: number; key: string } | null;

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

  const cells: Cell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKeyFromTimestamp(new Date(year, month, d).getTime());
    cells.push({ day: d, key });
  }
  // Pad the last row out to a full 7 so every row has the same number of
  // (equal-width) columns as the weekday header, whatever the screen width.
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

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
          <View key={w} style={styles.weekdayCol}>
            <Text style={styles.weekday}>{w}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        // Each row is its own fixed-7-column flex row (rather than relying
        // on flexWrap with fixed pixel widths), so columns can never fall
        // out of sync with the weekday header on a narrow screen.
        <View key={`row-${rowIndex}`} style={styles.gridRow}>
          {row.map((cell, i) => {
            if (!cell) return <View key={`blank-${rowIndex}-${i}`} style={styles.cell} />;
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
      ))}
    </View>
  );
}

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
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekday: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
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
