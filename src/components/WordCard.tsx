import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WordItem } from '../types';
import { theme } from '../theme';

type Props = {
  word: WordItem;
  selected?: boolean;
  disabled?: boolean;
  onPress: (word: WordItem) => void;
};

export default function WordCard({ word, selected, disabled, onPress }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress(word)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={styles.emoji}>{word.emoji}</Text>
      <Text style={styles.label}>{word.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '22%',
    aspectRatio: 1.1,
    backgroundColor: theme.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    color: theme.ink,
    textAlign: 'center',
  },
});
