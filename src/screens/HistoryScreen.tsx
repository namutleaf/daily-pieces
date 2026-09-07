import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { DiaryEntry } from '../types';
import { theme } from '../theme';
import { loadEntries } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>지난 조각들</Text>
        <View style={{ width: 40 }} />
      </View>

      {loaded && entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>아직 모은 조각이 없어요.</Text>
          <Text style={styles.emptySub}>오늘의 조각을 먼저 모아보세요.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate('Result', { entry: item, fromHistory: true })}
            >
              <Text style={styles.rowDate}>{item.dateLabel}</Text>
              <Text style={styles.rowTags} numberOfLines={1}>
                {item.hashtags.join('  ')}
              </Text>
            </Pressable>
          )}
        />
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
