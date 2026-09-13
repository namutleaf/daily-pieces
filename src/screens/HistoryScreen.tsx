import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DiaryEntry } from '../types';
import { theme } from '../theme';
import { loadEntries } from '../utils/storage';
import CalendarGrid from '../components/CalendarGrid';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;
type ViewMode = 'list' | 'calendar';

export default function HistoryScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEntries().then((list) => {
        setEntries(list);
        setLoaded(true);
      });
    }, [])
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.dateLabel.includes(q) ||
        e.diaryText.includes(q) ||
        e.hashtags.some((tag) => tag.includes(q))
    );
  }, [entries, query]);

  const openEntry = (entry: DiaryEntry) =>
    navigation.navigate('Result', { entry, fromHistory: true });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>지난 조각들</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, mode === 'list' && styles.modeBtnActive]}
          onPress={() => setMode('list')}
        >
          <Text style={[styles.modeBtnText, mode === 'list' && styles.modeBtnTextActive]}>목록</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'calendar' && styles.modeBtnActive]}
          onPress={() => setMode('calendar')}
        >
          <Text style={[styles.modeBtnText, mode === 'calendar' && styles.modeBtnTextActive]}>
            달력
          </Text>
        </Pressable>
      </View>

      {loaded && entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 모은 조각이 없어요.</Text>
          <Text style={styles.emptySub}>오늘의 조각을 먼저 모아보세요.</Text>
        </View>
      ) : mode === 'calendar' ? (
        <View style={styles.calendarWrap}>
          <CalendarGrid entries={entries} onSelectDay={openEntry} />
        </View>
      ) : (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="날짜, 단어, 내용으로 검색"
              placeholderTextColor={theme.inkSoft}
            />
          </View>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>검색 결과가 없어요.</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => openEntry(item)}
                >
                  <Text style={styles.rowDate}>{item.dateLabel}</Text>
                  <Text style={styles.rowTags} numberOfLines={1}>
                    {item.hashtags.join('  ')}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </>
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modeBtnActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.ink,
    outlineWidth: 0,
  },
  calendarWrap: {
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  row: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 16,
  },
  rowPressed: {
    opacity: 0.75,
  },
  rowDate: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 6,
  },
  rowTags: {
    fontSize: 13,
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
