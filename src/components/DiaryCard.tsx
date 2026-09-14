import React, { forwardRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import DraggableSticker from './DraggableSticker';
import { DiaryEntry, LineKey, PlacedSticker } from '../types';
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
  // Stickers are only draggable/pinchable where a change handler is given
  // (the main result view); other renders (the edit modal, the ref used
  // only to capture a share image) show them plain.
  onChangeSticker?: (instanceId: string, patch: Pick<PlacedSticker, 'x' | 'y' | 'scale' | 'rotation'>) => void;
  onDeleteSticker?: (instanceId: string) => void;
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
  (
    {
      entry,
      editing,
      draftLines,
      onChangeLine,
      onPressLine,
      onLongPressCard,
      large,
      fontFamily,
      onChangeSticker,
      onDeleteSticker,
    },
    ref
  ) => {
    const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
    const handleLayout = (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setCardSize({ width, height });
    };

    const hasPhoto = !!entry.backgroundImageUri;
    const moodPalette = MOOD_PALETTES[entry.paletteOverride ?? entry.paletteKey] ?? DEFAULT_PALETTE;
    // A photo background needs its own high-contrast text colors instead of
    // the mood palette's, since the mood colors assume they're the backdrop.
    const palette = hasPhoto
      ? { colors: moodPalette.colors, text: '#FFFFFF', subtext: 'rgba(255,255,255,0.8)' }
      : moodPalette;
    const fontStyle = fontFamily ? { fontFamily, fontWeight: 'normal' as const } : null;
    const align = entry.textAlign ?? 'left';
    const textStyle = [styles.diaryText, large && styles.diaryTextLarge, fontStyle, { textAlign: align }];
    const tagsJustify =
      align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

    const currentText = (key: LineKey) =>
      lineFinalText(entry.selections, key, entry.lineOverrides, entry.closerFragment, entry.tone, entry.personName);
    const hasCustomLine = entry.lineOverrides.custom !== undefined;
    const editLineKeys = hasCustomLine ? [...ALL_LINE_KEYS, 'custom' as LineKey] : ALL_LINE_KEYS;

    return (
      <View
        ref={ref}
        collapsable={false}
        onLayout={handleLayout}
        style={editing ? styles.wrapperEditing : styles.wrapper}
      >
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

          <View style={[styles.tagsRow, { justifyContent: tagsJustify }]}>
            {entry.hashtags.map((tag) => (
              <Text key={tag} style={[styles.tag, { color: palette.subtext }]}>
                {tag}
              </Text>
            ))}
          </View>
        </Pressable>

        {!!entry.stickers?.length && cardSize.width > 0 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {entry.stickers.map((placed) => (
              <DraggableSticker
                key={placed.instanceId}
                placed={placed}
                cardWidth={cardSize.width}
                cardHeight={cardSize.height}
                interactive={!!onChangeSticker}
                onChange={(patch) => onChangeSticker?.(placed.instanceId, patch)}
                onLongPressDelete={() => onDeleteSticker?.(placed.instanceId)}
              />
            ))}
          </View>
        )}
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
});
