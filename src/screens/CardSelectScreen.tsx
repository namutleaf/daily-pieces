import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { CATEGORIES } from '../data/words';
import { CategoryKey, DiaryEntry, Selections, WordItem } from '../types';
import { theme } from '../theme';
import WordCard from '../components/WordCard';
import ProgressDots from '../components/ProgressDots';
import MoodMessageModal from '../components/MoodMessageModal';
import { buildDiaryEntry } from '../utils/generateDiary';
import { pickMoodMessage } from '../data/moodMessages';
import { detectToneFromText } from '../utils/detectTone';
import { applyCustomLineAndTone, getLastName, saveEntry, setLastName } from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'CardSelect'>;

const SET_SIZE = 8;

export default function CardSelectScreen({ navigation, route }: Props) {
  const { tone } = route.params;
  const [roundIndex, setRoundIndex] = useState(0);
  const [selections, setSelections] = useState<Partial<Selections>>({});
  const [personName, setPersonName] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [namePrompt, setNamePrompt] = useState<WordItem | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [pendingEntry, setPendingEntry] = useState<DiaryEntry | null>(null);
  const [moodMessage, setMoodMessage] = useState('');
  const [setIndex, setSetIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');

  const category = CATEGORIES[roundIndex];
  const isLastRound = roundIndex === CATEGORIES.length - 1;
  const totalSets = Math.ceil(category.words.length / SET_SIZE);
  const visibleWords = category.words.slice(setIndex * SET_SIZE, setIndex * SET_SIZE + SET_SIZE);
  const isLastSet = setIndex >= totalSets - 1;

  useEffect(() => {
    setSetIndex(0);
  }, [roundIndex]);

  const commitSelection = useCallback(
    (word: WordItem, name: string | undefined) => {
      setBusy(true);
      const effectivePersonName = category.key === 'person' ? name : personName;
      if (category.key === 'person') setPersonName(name);

      const nextSelections: Selections = {
        ...(selections as Selections),
        [category.key as CategoryKey]: word,
      };
      setSelections(nextSelections);

      setTimeout(async () => {
        if (isLastRound) {
          const entry = buildDiaryEntry(nextSelections, tone, effectivePersonName);
          await saveEntry(entry);
          setMoodMessage(pickMoodMessage(entry.paletteKey));
          setCustomInput('');
          setPendingEntry(entry);
          setBusy(false);
        } else {
          setRoundIndex((i) => i + 1);
          setBusy(false);
        }
      }, 260);
    },
    [category.key, isLastRound, navigation, personName, selections, tone]
  );

  const handlePick = useCallback(
    async (word: WordItem) => {
      if (busy) return;
      if (category.key === 'person' && word.nameable) {
        const last = await getLastName(word.id);
        setNameInput(last ?? '');
        setNamePrompt(word);
        return;
      }
      commitSelection(word, undefined);
    },
    [busy, category.key, commitSelection]
  );

  const handleNameSkip = () => {
    if (!namePrompt) return;
    const word = namePrompt;
    setNamePrompt(null);
    commitSelection(word, undefined);
  };

  const handleNameConfirm = async () => {
    if (!namePrompt) return;
    const word = namePrompt;
    const trimmed = nameInput.trim();
    setNamePrompt(null);
    if (trimmed) {
      await setLastName(word.id, trimmed);
      commitSelection(word, trimmed);
    } else {
      commitSelection(word, undefined);
    }
  };

  const handleContinueToResult = async () => {
    if (!pendingEntry) return;
    const trimmed = customInput.trim();
    if (!trimmed) {
      navigation.replace('Result', { entry: pendingEntry });
      return;
    }
    const tone = detectToneFromText(trimmed);
    const updated = await applyCustomLineAndTone(pendingEntry.id, tone, trimmed);
    navigation.replace('Result', { entry: updated ?? pendingEntry });
  };

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
        {visibleWords.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            selected={word.id === selectedId}
            disabled={busy}
            onPress={handlePick}
          />
        ))}

        {totalSets > 1 && (
          <Pressable
            style={({ pressed }) => [styles.moreBtn, pressed && styles.pressed]}
            onPress={() => setSetIndex(isLastSet ? 0 : setIndex + 1)}
          >
            <Text style={styles.moreBtnText}>
              {isLastSet ? '처음부터 다시 보기' : '다른 카드 보기'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={namePrompt !== null} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.promptCard}>
            <Text style={styles.promptEmoji}>{namePrompt?.emoji}</Text>
            <Text style={styles.promptTitle}>{namePrompt?.label}의 이름이 있나요?</Text>
            <Text style={styles.promptSub}>입력하면 일기에 이름이 들어가요 (선택)</Text>
            <TextInput
              style={styles.promptInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="예: 초코"
              placeholderTextColor={theme.inkSoft}
              autoFocus
            />
            <View style={styles.promptActions}>
              <Pressable
                style={({ pressed }) => [styles.promptBtn, pressed && styles.pressed]}
                onPress={handleNameSkip}
              >
                <Text style={styles.promptBtnText}>건너뛰기</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.promptBtn,
                  styles.promptBtnPrimary,
                  pressed && styles.pressed,
                ]}
                onPress={handleNameConfirm}
              >
                <Text style={styles.promptBtnPrimaryText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {pendingEntry && (
        <MoodMessageModal
          visible={pendingEntry !== null}
          paletteKey={pendingEntry.paletteKey}
          message={moodMessage}
          customText={customInput}
          onChangeCustomText={setCustomInput}
          onContinue={handleContinueToResult}
        />
      )}
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  promptCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  promptEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 4,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: 13,
    color: theme.inkSoft,
    marginBottom: 16,
    textAlign: 'center',
  },
  promptInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.ink,
    marginBottom: 18,
    outlineWidth: 0,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  promptBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  promptBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  promptBtnPrimary: {
    backgroundColor: theme.accent,
  },
  promptBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
  moreBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
  },
  moreBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
  },
});
