import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CATEGORIES } from '../data/words';
import { CategoryKey, Selections, WordItem } from '../types';
import { theme } from '../theme';
import WordCard from '../components/WordCard';
import ProgressDots from '../components/ProgressDots';
import { buildDiaryEntry } from '../utils/generateDiary';
import { saveEntry } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'CardSelect'>;

export default function CardSelectScreen({ navigation, route }: Props) {
  const { tone } = route.params;
  const [roundIndex, setRoundIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Selections>>({});
  const [busy, setBusy] = useState(false);

  const category = CATEGORIES[roundIndex];
  const isLastRound = roundIndex === CATEGORIES.length - 1;

  const handlePick = useCallback(
    async (word: WordItem) => {
      if (busy) return;
      setBusy(true);

      const nextSelections: Selections = {
        ...(selections as Selections),
        [category.key as CategoryKey]: word,
      };
      setSelections(nextSelections);

      setTimeout(async () => {
        if (isLastRound) {
          const entry = buildDiaryEntry(nextSelections, tone);
          await saveEntry(entry);
          navigation.replace('Result', { entry });
        } else {
          setRoundIndex((i) => i + 1);
          setBusy(false);
        }
      }, 260);
    },
    [busy, category.key, isLastRound, navigation, selections, tone]
  );

  const handleBack = () => {
    if (roundIndex === 0) {
      navigation.goBack();
      return;
    }
    setRoundIndex((i) => i - 1);
  };

  const selectedId = selections[category.key as CategoryKey]?.id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={styles.backText}>{roundIndex === 0 ? '취소' : '이전'}</Text>
        </Pressable>
        <Text style={styles.stepText}>
          {roundIndex + 1} / {CATEGORIES.length}
        </Text>
      </View>

      <ProgressDots total={CATEGORIES.length} current={roundIndex} />

      <View style={styles.questionWrap}>
        <Text style={styles.categoryLabel}>{category.title}</Text>
        <Text style={styles.question}>{category.question}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {category.words.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            selected={word.id === selectedId}
            disabled={busy}
            onPress={handlePick}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  questionWrap: {
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
});
