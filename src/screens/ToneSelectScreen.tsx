import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TONE_OPTIONS } from '../data/tones';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ToneSelect'>;

export default function ToneSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>취소</Text>
        </Pressable>
      </View>

      <View style={styles.questionWrap}>
        <Text style={styles.categoryLabel}>말투 선택</Text>
        <Text style={styles.question}>오늘 일기는 어떤 말투로 써볼까요?</Text>
      </View>

      <View style={styles.list}>
        {TONE_OPTIONS.map((tone) => (
          <Pressable
            key={tone.key}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('CardSelect', { tone: tone.key })}
          >
            <Text style={styles.emoji}>{tone.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={styles.label}>{tone.label}</Text>
              <Text style={styles.sample}>{tone.sample}</Text>
            </View>
          </Pressable>
        ))}
      </View>
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  questionWrap: {
    marginBottom: 28,
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
    textAlign: 'center',
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 18,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.7,
  },
  emoji: {
    fontSize: 30,
  },
  cardText: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.ink,
    marginBottom: 4,
  },
  sample: {
    fontSize: 13,
    color: theme.inkSoft,
  },
});
