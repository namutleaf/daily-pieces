import React, { forwardRef, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORIES } from '../data/words';
import DraggableSticker, { BASE_SIZE as STICKER_BASE_SIZE } from './DraggableSticker';
import GuideLine from './GuideLine';
import IllustrationBackground from './IllustrationBackground';
import { CategoryKey, DiaryEntry, LineKey, PlacedSticker } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';
import { effectiveHashtags, lineFinalText } from '../utils/generateDiary';

const ALL_LINE_KEYS: LineKey[] = [...CATEGORIES.map((c) => c.key), 'closer'];

const TEXT_SIZE_SCALE: Record<NonNullable<DiaryEntry['textSize']>, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
};

// How close (in on-screen pixels) a drag has to get to a guide before it
// snaps — Instagram/PowerPoint-style magnetic alignment.
const SNAP_PX = 8;

// A virtual "safe border" inset from the card's own edges — matches the
// card's text padding, so a sticker dragged toward the edge snaps flush
// against it instead of bleeding past where the text sits. Same idea as
// Instagram's screen-edge sticker guides.
const SAFE_MARGIN_PX = 26;

type SnapCandidate = { value: number; kind: 'center' | 'align' };

// Snapped to the card's own center (Instagram-style) vs. lined up with
// another sticker (PowerPoint-style) — distinct colors so it's clear which
// guide fired.
const GUIDE_COLOR_CENTER = '#2F5FE0';
const GUIDE_COLOR_ALIGN = '#FF3B78';

// The closest candidate within threshold wins, same as any smart-guide
// implementation — the card center is just one entry in the list, not a
// priority pick, so a drag near other stickers correctly prefers lining up
// with them over pulling all the way back to center.
function snapAxis(raw: number, candidates: SnapCandidate[], threshold: number): SnapCandidate | null {
  let best: SnapCandidate | null = null;
  let bestDist = threshold;
  for (const c of candidates) {
    const d = Math.abs(raw - c.value);
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
  onPressHashtag?: (key: CategoryKey, currentTag: string) => void;
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
      onPressHashtag,
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
    const [guides, setGuides] = useState<{ x: SnapCandidate | null; y: SnapCandidate | null }>({
      x: null,
      y: null,
    });

    const handleStickerDragUpdate = (instanceId: string, rawX: number, rawY: number) => {
      const others = (entry.stickers ?? []).filter((s) => s.instanceId !== instanceId);
      if (cardSize.width === 0 || cardSize.height === 0) return { x: rawX, y: rawY };

      // The dragged sticker's own half-size (in card-fraction units) is
      // needed to line up EDGES rather than just centers — its center has
      // to land somewhere offset from the other sticker's edge, not on it.
      const draggedScale = entry.stickers?.find((s) => s.instanceId === instanceId)?.scale ?? 1;
      const draggedHalfW = (STICKER_BASE_SIZE * draggedScale) / 2 / cardSize.width;
      const draggedHalfH = (STICKER_BASE_SIZE * draggedScale) / 2 / cardSize.height;

      // Snap to: the card's own center and its safe-border inset
      // (Instagram-style, both "canvas" guides), each other sticker's
      // center or matching edge (lining up rows/columns or flush
      // left/right/top/bottom, PowerPoint-style), and the midpoint between
      // any two other stickers (even spacing between three). The closest
      // one wins, so dragging near an existing row of stickers lines up
      // with THEM rather than jumping back to card-center — canvas guides
      // and sticker-to-sticker guides are drawn in different colors so
      // it's clear which one fired.
      const marginXFrac = SAFE_MARGIN_PX / cardSize.width;
      const marginYFrac = SAFE_MARGIN_PX / cardSize.height;
      const xCandidates: SnapCandidate[] = [
        { value: 0.5, kind: 'center' },
        { value: marginXFrac + draggedHalfW, kind: 'center' }, // flush with left safe border
        { value: 1 - marginXFrac - draggedHalfW, kind: 'center' }, // flush with right safe border
      ];
      const yCandidates: SnapCandidate[] = [
        { value: 0.5, kind: 'center' },
        { value: marginYFrac + draggedHalfH, kind: 'center' }, // flush with top safe border
        { value: 1 - marginYFrac - draggedHalfH, kind: 'center' }, // flush with bottom safe border
      ];
      others.forEach((s) => {
        const otherHalfW = (STICKER_BASE_SIZE * s.scale) / 2 / cardSize.width;
        const otherHalfH = (STICKER_BASE_SIZE * s.scale) / 2 / cardSize.height;
        xCandidates.push({ value: s.x, kind: 'align' });
        xCandidates.push({ value: s.x - otherHalfW + draggedHalfW, kind: 'align' }); // left edges flush
        xCandidates.push({ value: s.x + otherHalfW - draggedHalfW, kind: 'align' }); // right edges flush
        yCandidates.push({ value: s.y, kind: 'align' });
        yCandidates.push({ value: s.y - otherHalfH + draggedHalfH, kind: 'align' }); // top edges flush
        yCandidates.push({ value: s.y + otherHalfH - draggedHalfH, kind: 'align' }); // bottom edges flush
      });
      for (let i = 0; i < others.length; i++) {
        for (let j = i + 1; j < others.length; j++) {
          xCandidates.push({ value: (others[i].x + others[j].x) / 2, kind: 'align' });
          yCandidates.push({ value: (others[i].y + others[j].y) / 2, kind: 'align' });
        }
      }

      const snappedX = snapAxis(rawX, xCandidates, SNAP_PX / cardSize.width);
      const snappedY = snapAxis(rawY, yCandidates, SNAP_PX / cardSize.height);
      setGuides({ x: snappedX, y: snappedY });
      return { x: snappedX?.value ?? rawX, y: snappedY?.value ?? rawY };
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
            {effectiveHashtags(entry).map(({ key, tag }) =>
              onPressHashtag ? (
                <Pressable
                  key={key}
                  onPress={() => onPressHashtag(key, tag)}
                  hitSlop={4}
                  style={({ pressed }) => pressed && styles.linePressed}
                >
                  <Text style={[styles.tag, { color: palette.subtext }]}>{tag}</Text>
                </Pressable>
              ) : (
                <Text key={key} style={[styles.tag, { color: palette.subtext }]}>
                  {tag}
                </Text>
              )
            )}
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
              <View style={{ position: 'absolute', left: guides.x.value * cardSize.width - 1.5, top: 0 }}>
                <GuideLine
                  orientation="vertical"
                  length={cardSize.height}
                  color={guides.x.kind === 'center' ? GUIDE_COLOR_CENTER : GUIDE_COLOR_ALIGN}
                  gradientId={guides.x.kind === 'center' ? 'guide-center-v' : 'guide-align-v'}
                />
              </View>
            )}
            {guides.y !== null && (
              <View style={{ position: 'absolute', top: guides.y.value * cardSize.height - 1.5, left: 0 }}>
                <GuideLine
                  orientation="horizontal"
                  length={cardSize.width}
                  color={guides.y.kind === 'center' ? GUIDE_COLOR_CENTER : GUIDE_COLOR_ALIGN}
                  gradientId={guides.y.kind === 'center' ? 'guide-center-h' : 'guide-align-h'}
                />
              </View>
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
});
