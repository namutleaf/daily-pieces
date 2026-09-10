import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import { DiaryEntry, LineKey } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';
import { lineFinalText } from '../utils/generateDiary';

const ALL_LINE_KEYS: LineKey[] = [...CATEGORIES.map((c) => c.key), 'closer'];

type Props = {
  entry: DiaryEntry;
  editing?: boolean;
  draftLines?: Partial<Record<LineKey, string>>;
  onChangeLine?: (key: LineKey, text: string) => void;
  onPressLine?: (key: LineKey) => void;
  onLongPressCard?: () => void;
  large?: boolean;
  fontFamily?: string;
};

function LineInput({
  value,
  onChangeText,
  textStyle,
  color,
  large,
}: {
  value: string;
  onChangeText: (t: string) => void;
  textStyle: any;
  color: string;
  large?: boolean;
}) {
  const lineHeight = large ? 30 : 23;
  // Guarantee room for at least two wrapped lines up front (some platforms'
  // web TextInput never fires onContentSizeChange), then grow further if it does.
  const [height, setHeight] = useState(lineHeight * 2);
  return (
    <TextInput
      style={[textStyle, styles.diaryInput, { color, height }]}
      value={value}
      onChangeText={onChangeText}
      onContentSizeChange={(e) =>
        setHeight(Math.max(lineHeight * 2, e.nativeEvent.contentSize.height))
      }
      multiline
      scrollEnabled={false}
    />
  );
}

const DiaryCard = forwardRef<View, Props>(
  ({ entry, editing, draftLines, onChangeLine, onPressLine, onLongPressCard, large, fontFamily }, ref) => {
    const palette = MOOD_PALETTES[entry.paletteOverride ?? entry.paletteKey] ?? DEFAULT_PALETTE;
    const fontStyle = fontFamily ? { fontFamily, fontWeight: 'normal' as const } : null;
    const textStyle = [styles.diaryText, large && styles.diaryTextLarge, fontStyle];

    const currentText = (key: LineKey) =>
      lineFinalText(entry.selections, key, entry.lineOverrides, entry.closerFragment, entry.tone, entry.personName);
    const hasCustomLine = entry.lineOverrides.custom !== undefined;
    const editLineKeys = hasCustomLine ? [...ALL_LINE_KEYS, 'custom' as LineKey] : ALL_LINE_KEYS;

    return (
      <View ref={ref} collapsable={false} style={editing ? styles.wrapperEditing : styles.wrapper}>
        <LinearGradient
          colors={palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          style={editing ? styles.cardEditing : styles.card}
          disabled={editing || !onLongPressCard}
          onLongPress={onLongPressCard}
          delayLongPress={450}
        >
          <View style={[styles.headerRow, editing && styles.headerRowEditing]}>
            <Text style={[styles.brand, { color: palette.text }]}>Daily Pieces</Text>
            <Text style={[styles.date, { color: palette.subtext }]}>{entry.dateLabel}</Text>
          </View>

          <View style={editing ? styles.bodyWrapEditing : styles.bodyWrap}>
            {editing ? (
              <View>
                {editLineKeys.map((key) => (
                  <View key={key} style={(key === 'closer' || key === 'custom') && styles.closerSpacer}>
                    <LineInput
                      value={draftLines?.[key] ?? currentText(key)}
                      onChangeText={(t) => onChangeLine?.(key, t)}
                      textStyle={textStyle}
                      color={palette.text}
                      large={large}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.key}
                    onPress={() => onPressLine?.(c.key)}
                    onLongPress={onLongPressCard}
                    delayLongPress={450}
                    hitSlop={4}
                    style={({ pressed }) => pressed && styles.linePressed}
                  >
                    <Text style={[...textStyle, { color: palette.text }]}>{currentText(c.key)}</Text>
                  </Pressable>
                ))}
                <View style={{ height: large ? 30 : 23 }} />
                <Pressable
                  onPress={() => onPressLine?.('closer')}
                  onLongPress={onLongPressCard}
                  delayLongPress={450}
                  hitSlop={4}
                  style={({ pressed }) => pressed && styles.linePressed}
                >
                  <Text style={[...textStyle, { color: palette.text }]}>{currentText('closer')}</Text>
                </Pressable>
                {hasCustomLine && (
                  <View style={styles.closerSpacer}>
                    <Text style={[...textStyle, { color: palette.text }]}>{currentText('custom')}</Text>
                  </View>
                )}
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
        </Pressable>
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
  wrapperEditing: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    flex: 1,
    padding: 26,
    justifyContent: 'space-between',
  },
  cardEditing: {
    padding: 26,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRowEditing: {
    marginBottom: 20,
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
  bodyWrapEditing: {
    marginBottom: 20,
  },
  linePressed: {
    opacity: 0.55,
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
    padding: 4,
    margin: -4,
    marginBottom: 2,
    textAlignVertical: 'top',
    borderRadius: 8,
    outlineWidth: 0,
  },
  closerSpacer: {
    marginTop: 14,
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
