import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import { DiaryEntry, LineKey } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';
import { applyTone, baseFragmentFor } from '../utils/generateDiary';

type Props = {
  entry: DiaryEntry;
  editing?: boolean;
  editValue?: string;
  onChangeEditValue?: (text: string) => void;
  onPressLine?: (key: LineKey) => void;
  large?: boolean;
};

const DiaryCard = forwardRef<View, Props>(
  ({ entry, editing, editValue, onChangeEditValue, onPressLine, large }, ref) => {
    const palette = MOOD_PALETTES[entry.paletteKey] ?? DEFAULT_PALETTE;
    const interactive = !editing && !entry.manualText && !!onPressLine;

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
                style={[
                  styles.diaryText,
                  styles.diaryInput,
                  large && styles.diaryTextLarge,
                  { color: palette.text },
                ]}
                value={editValue}
                onChangeText={onChangeEditValue}
                multiline
                autoFocus
                placeholder="일기를 직접 적어보세요"
                placeholderTextColor={palette.subtext}
              />
            ) : entry.manualText || !interactive ? (
              <Text style={[styles.diaryText, large && styles.diaryTextLarge, { color: palette.text }]}>
                {entry.diaryText}
              </Text>
            ) : (
              <View>
                {CATEGORIES.map((c) => (
                  <Pressable key={c.key} onPress={() => onPressLine?.(c.key)} hitSlop={4}>
                    <Text style={[styles.diaryText, large && styles.diaryTextLarge, { color: palette.text }]}>
                      {applyTone(baseFragmentFor(entry.selections, c.key, entry.fragmentOverrides, entry.personName), entry.tone)}
                    </Text>
                  </Pressable>
                ))}
                <View style={{ height: large ? 30 : 23 }} />
                <Pressable onPress={() => onPressLine?.('closer')} hitSlop={4}>
                  <Text style={[styles.diaryText, large && styles.diaryTextLarge, { color: palette.text }]}>
                    {applyTone(entry.closerFragment, entry.tone)}
                  </Text>
                </Pressable>
              </View>
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
  diaryTextLarge: {
    fontSize: 19,
    lineHeight: 30,
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
