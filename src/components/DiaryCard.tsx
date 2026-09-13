import React, { forwardRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import { findStickerById } from '../data/stickers';
import { DiaryEntry, LineKey } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';
import { lineFinalText } from '../utils/generateDiary';

const ALL_LINE_KEYS: LineKey[] = [...CATEGORIES.map((c) => c.key), 'closer'];

// A slight alternating tilt so a row of stickers reads as hand-placed
// rather than machine-aligned, without needing absolute positioning that
// could overlap the diary text (which varies a lot in length).
const STICKER_TILTS = ['-8deg', '6deg', '-4deg', '9deg'];

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
    const hasPhoto = !!entry.backgroundImageUri;
    const moodPalette = MOOD_PALETTES[entry.paletteOverride ?? entry.paletteKey] ?? DEFAULT_PALETTE;
    // A photo background needs its own high-contrast text colors instead of
    // the mood palette's, since the mood colors assume they're the backdrop.
    const palette = hasPhoto
      ? { colors: moodPalette.colors, text: '#FFFFFF', subtext: 'rgba(255,255,255,0.8)' }
      : moodPalette;
    const fontStyle = fontFamily ? { fontFamily, fontWeight: 'normal' as const } : null;
    const textStyle = [styles.diaryText, large && styles.diaryTextLarge, fontStyle];

    const currentText = (key: LineKey) =>
      lineFinalText(entry.selections, key, entry.lineOverrides, entry.closerFragment, entry.tone, entry.personName);
    const hasCustomLine = entry.lineOverrides.custom !== undefined;
    const editLineKeys = hasCustomLine ? [...ALL_LINE_KEYS, 'custom' as LineKey] : ALL_LINE_KEYS;

    return (
      <View ref={ref} collapsable={false} style={editing ? styles.wrapperEditing : styles.wrapper}>
        {hasPhoto ? (
          <>
            <Image
              source={{ uri: entry.backgroundImageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={[StyleSheet.absoluteFill, styles.photoScrim]} />
          </>
        ) : (
          <LinearGradient
            colors={palette.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
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

          {!!entry.stickers?.length && (
            <View style={styles.stickerRow}>
              {entry.stickers.map((id, i) => {
                const sticker = findStickerById(id);
                if (!sticker) return null;
                return (
                  <Text
                    key={`${id}-${i}`}
                    style={[styles.stickerEmoji, { transform: [{ rotate: STICKER_TILTS[i % STICKER_TILTS.length] }] }]}
                  >
                    {sticker.emoji}
                  </Text>
                );
              })}
            </View>
          )}

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
  photoScrim: {
    backgroundColor: 'rgba(0,0,0,0.38)',
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
  stickerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  stickerEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
});
