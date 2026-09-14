import React, { forwardRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import DraggableSticker from './DraggableSticker';
import IllustrationBackground from './IllustrationBackground';
import { DiaryEntry, LineKey, PlacedSticker } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';
import { lineFinalText } from '../utils/generateDiary';

const ALL_LINE_KEYS: LineKey[] = [...CATEGORIES.map((c) => c.key), 'closer'];

const TEXT_SIZE_SCALE: Record<NonNullable<DiaryEntry['textSize']>, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
};

// How close (in on-screen pixels) a drag has to get to a guide before it
// snaps — Instagram/PowerPoint-style magnetic alignment.
const SNAP_PX = 8;

function snapAxis(raw: number, candidates: number[], threshold: number): number | null {
  let best: number | null = null;
  let bestDist = threshold;
  for (const c of candidates) {
    const d = Math.abs(raw - c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

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
  lineHeight,
}: {
  value: string;
  onChangeText: (t: string) => void;
  textStyle: any;
  color: string;
  lineHeight: number;
}) {
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

    // Guide lines currently "lit up" mid-drag, in card-fraction coordinates.
    const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

    const handleStickerDragUpdate = (instanceId: string, rawX: number, rawY: number) => {
      const others = (entry.stickers ?? []).filter((s) => s.instanceId !== instanceId);
      if (cardSize.width === 0 || cardSize.height === 0) return { x: rawX, y: rawY };

      // Snap to: the card's own center (Instagram-style), each other
      // sticker's center (lining up rows/columns, PowerPoint-style), and the
      // midpoint between any two other stickers (even spacing between three).
      const xCandidates = [0.5, ...others.map((s) => s.x)];
      const yCandidates = [0.5, ...others.map((s) => s.y)];
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          xCandidates.push((others[i].x + others[j].x) / 2);
          yCandidates.push((others[i].y + others[j].y) / 2);
        }
      }

      const snappedX = snapAxis(rawX, xCandidates, SNAP_PX / cardSize.width);
      const snappedY = snapAxis(rawY, yCandidates, SNAP_PX / cardSize.height);
      setGuides({ x: snappedX, y: snappedY });
      return { x: snappedX ?? rawX, y: snappedY ?? rawY };
    };

    const handleStickerDragEnd = () => setGuides({ x: null, y: null });

    const hasPhoto = !!entry.backgroundImageUri;
    const hasIllustration = !!entry.illustration && !hasPhoto;
    const moodPalette = MOOD_PALETTES[entry.paletteOverride ?? entry.paletteKey] ?? DEFAULT_PALETTE;
    // A photo or illustration background needs its own high-contrast text
    // colors instead of the mood palette's, since those assume they're the backdrop.
    const palette =
      hasPhoto || hasIllustration
        ? { colors: moodPalette.colors, text: '#FFFFFF', subtext: 'rgba(255,255,255,0.8)' }
        : moodPalette;
    const fontStyle = fontFamily ? { fontFamily, fontWeight: 'normal' as const } : null;
    const align = entry.textAlign ?? 'left';
    const sizeScale = TEXT_SIZE_SCALE[entry.textSize ?? 'medium'];
    const baseFontSize = large ? 19 : 15;
    const baseLineHeight = large ? 30 : 23;
    const fontSize = baseFontSize * sizeScale;
    const lineHeight = baseLineHeight * sizeScale;
    const textStyle = [styles.diaryText, fontStyle, { textAlign: align, fontSize, lineHeight }];
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
        ) : hasIllustration ? (
          <>
            <View style={StyleSheet.absoluteFill}>
              <IllustrationBackground illustration={entry.illustration!} />
            </View>
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
                      lineHeight={lineHeight}
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
                <View style={{ height: lineHeight }} />
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
                onDragUpdate={onChangeSticker ? handleStickerDragUpdate : undefined}
                onDragEnd={onChangeSticker ? handleStickerDragEnd : undefined}
              />
            ))}
          </View>
        )}

        {(guides.x !== null || guides.y !== null) && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {guides.x !== null && (
              <View style={[styles.guideLineV, { left: guides.x * cardSize.width }]} />
            )}
            {guides.y !== null && (
              <View style={[styles.guideLineH, { top: guides.y * cardSize.height }]} />
            )}
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
    fontWeight: '500',
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
  guideLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FF3B78',
  },
  guideLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FF3B78',
  },
});
