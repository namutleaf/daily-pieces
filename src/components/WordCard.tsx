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
    width: '47%',
    aspectRatio: 1.15,
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
    fontSize: 34,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ink,
  },
});
