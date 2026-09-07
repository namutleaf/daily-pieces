import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DiaryEntry } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';

type Props = {
  entry: DiaryEntry;
  editing?: boolean;
  editValue?: string;
  onChangeEditValue?: (text: string) => void;
};

const DiaryCard = forwardRef<View, Props>(
  ({ entry, editing, editValue, onChangeEditValue }, ref) => {
    const palette = MOOD_PALETTES[entry.paletteKey] ?? DEFAULT_PALETTE;

    return (
      <View ref={ref} collapsable={false} style={styles.wrapper}>
        <LinearGradient
          colors={palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={[styles.brand, { color: palette.text }]}>Daily Pieces</Text>
            <Text style={[styles.date, { color: palette.subtext }]}>{entry.dateLabel}</Text>
          </View>

          <View style={styles.bodyWrap}>
            {editing ? (
              <TextInput
                style={[styles.diaryText, styles.diaryInput, { color: palette.text }]}
                value={editValue}
                onChangeText={onChangeEditValue}
                multiline
                autoFocus
                placeholder="일기를 직접 적어보세요"
                placeholderTextColor={palette.subtext}
              />
            ) : (
              <Text style={[styles.diaryText, { color: palette.text }]}>{entry.diaryText}</Text>
            )}
          </View>

          <View style={styles.tagsRow}>
            {entry.hashtags.map((tag) => (
              <Text key={tag} style={[styles.tag, { color: palette.subtext }]}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }
);

DiaryCard.displayName = 'DiaryCard';
export default DiaryCard;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    flex: 1,
    padding: 26,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  diaryText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  diaryInput: {
    padding: 8,
    margin: -8,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    outlineWidth: 0,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
  },
});
