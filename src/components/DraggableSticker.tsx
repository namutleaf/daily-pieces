import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { findStickerById } from '../data/stickers';
import { PlacedSticker } from '../types';

type Props = {
  placed: PlacedSticker;
  cardWidth: number;
  cardHeight: number;
  interactive: boolean;
  onChange: (patch: Pick<PlacedSticker, 'x' | 'y' | 'scale' | 'rotation'>) => void;
  onLongPressDelete?: () => void;
  // Called with this sticker's raw (unsnapped) position on every pan update;
  // returns the position to actually use, letting the parent pull it onto a
  // magnetic guide (card center, another sticker, or an even-spacing point).
  onDragUpdate?: (instanceId: string, rawX: number, rawY: number) => { x: number; y: number };
  onDragEnd?: (instanceId: string) => void;
};

// Exported so DiaryCard can compute each sticker's on-screen edges for
// edge-to-edge alignment guides, without duplicating the size constant.
export const BASE_SIZE = 40;
const MIN_SCALE = 0.4;
const MAX_SCALE = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function DraggableSticker({
  placed,
  cardWidth,
  cardHeight,
  interactive,
  onChange,
  onLongPressDelete,
  onDragUpdate,
  onDragEnd,
}: Props) {
  const sticker = findStickerById(placed.stickerId);
  const [pressed, setPressed] = useState(false);

  // Instagram-style stickers: one finger held down keeps moving it, adding a
  // second finger pinches/rotates at the same time — no visible handles or
  // border, just direct manipulation. Each gesture tracks its own "value at
  // gesture start" so simultaneous pan+pinch+rotate compose without one
  // gesture's start clobbering another's in-progress baseline.
  const [live, setLive] = useState(placed);
  const liveRef = useRef(live);
  liveRef.current = live;

  const draggingRef = useRef(false);
  useEffect(() => {
    if (!draggingRef.current) setLive(placed);
  }, [placed.x, placed.y, placed.scale, placed.rotation]);

  const basePan = useRef({ x: placed.x, y: placed.y });
  const baseScale = useRef(placed.scale);
  const baseRotation = useRef(placed.rotation);

  const commit = () => onChange(liveRef.current);

  const pan = Gesture.Pan()
    .onBegin(() => {
      draggingRef.current = true;
      basePan.current = { x: liveRef.current.x, y: liveRef.current.y };
    })
    .onUpdate((e) => {
      const rawX = clamp(basePan.current.x + e.translationX / cardWidth, 0, 1);
      const rawY = clamp(basePan.current.y + e.translationY / cardHeight, 0, 1);
      const snapped = onDragUpdate?.(placed.instanceId, rawX, rawY) ?? { x: rawX, y: rawY };
      setLive((prev) => ({ ...prev, x: snapped.x, y: snapped.y }));
    })
    .onFinalize(() => {
      draggingRef.current = false;
      onDragEnd?.(placed.instanceId);
      commit();
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      draggingRef.current = true;
      baseScale.current = liveRef.current.scale;
    })
    .onUpdate((e) => {
      setLive((prev) => ({ ...prev, scale: clamp(baseScale.current * e.scale, MIN_SCALE, MAX_SCALE) }));
    })
    .onFinalize(() => {
      draggingRef.current = false;
      commit();
    });

  const rotate = Gesture.Rotation()
    .onBegin(() => {
      draggingRef.current = true;
      baseRotation.current = liveRef.current.rotation;
    })
    .onUpdate((e) => {
      setLive((prev) => ({ ...prev, rotation: baseRotation.current + (e.rotation * 180) / Math.PI }));
    })
    .onFinalize(() => {
      draggingRef.current = false;
      commit();
    });

  // A plain hold (no drag) removes the sticker — matches the "long-press
  // to delete" pattern people already know from home-screen icons. It
  // naturally coexists with pan/pinch/rotate: RNGH fails a long-press on
  // its own once the touch moves past its small tolerance, so an actual
  // drag never gets mistaken for a delete-hold.
  const longPress = Gesture.LongPress()
    .minDuration(450)
    .onTouchesDown(() => setPressed(true))
    .onTouchesUp(() => setPressed(false))
    .onStart(() => {
      setPressed(false);
      onLongPressDelete?.();
    })
    .onFinalize(() => setPressed(false));

  const composed = Gesture.Simultaneous(pan, pinch, rotate, longPress);

  if (!sticker || cardWidth === 0 || cardHeight === 0) return null;

  const size = BASE_SIZE * live.scale;
  const content = (
    <Text
      style={[
        styles.emoji,
        pressed && styles.emojiPressed,
        {
          left: live.x * cardWidth - size / 2,
          top: live.y * cardHeight - size / 2,
          width: size,
          height: size,
          fontSize: size,
          lineHeight: size,
          transform: [{ rotate: `${live.rotation}deg` }],
        },
      ]}
    >
      {sticker.emoji}
    </Text>
  );

  if (!interactive) return content;

  return <GestureDetector gesture={composed}>{content}</GestureDetector>;
}

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  emojiPressed: {
    opacity: 0.5,
  },
});
