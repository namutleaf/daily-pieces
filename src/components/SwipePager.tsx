import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { theme } from '../theme';

type Props = {
  pages: ReactNode[];
  // Horizontal padding inside each page, so the pager itself can sit
  // edge-to-edge and cards slide off the screen edge instead of being
  // clipped at the screen's content padding.
  pagePadding?: number;
  // True while a swipe is in progress (and briefly after), so the parent
  // can ignore a card "tap" that was really the end of a drag.
  onSwipingChange?: (swiping: boolean) => void;
};

const DRAG_THRESHOLD_PX = 6;
const FLICK_VELOCITY = 0.35; // px per ms

export default function SwipePager({ pages, pagePadding = 0, onSwipingChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const swipingCb = useRef(onSwipingChange);
  swipingCb.current = onSwipingChange;

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goTo = (target: number) => scrollRef.current?.scrollTo({ x: target * width, animated: true });

  // Browsers don't scroll an overflow container on mouse-drag (only touch
  // and trackpads), so on web a mouse drag is translated into scrolling
  // here, snapping to a page on release.
  useEffect(() => {
    if (Platform.OS !== 'web' || !width) return;
    const node = (scrollRef.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.();
    if (!node) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startScroll = node.scrollLeft;
      lastT = performance.now();
      velocity = 0;
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        moved = true;
        node.style.scrollSnapType = 'none';
        if (releaseTimer) clearTimeout(releaseTimer);
        swipingCb.current?.(true);
      }
      if (!moved) return;
      node.scrollLeft = startScroll - dx;
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      const startPage = Math.round(startScroll / width);
      let target = Math.round(node.scrollLeft / width);
      if (Math.abs(velocity) > FLICK_VELOCITY) target = startPage + (velocity < 0 ? 1 : -1);
      target = Math.max(0, Math.min(pages.length - 1, target));
      // Not node.scrollTo({ left }): react-native-web replaces the host
      // node's scrollTo with RN's ({ x, y, animated }) signature, so a DOM-
      // style call reads x as undefined and scrolls back to the first page.
      scrollRef.current?.scrollTo({ x: target * width, animated: true });
      releaseTimer = setTimeout(() => {
        node.style.scrollSnapType = '';
        swipingCb.current?.(false);
      }, 350);
    };

    node.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      node.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (releaseTimer) clearTimeout(releaseTimer);
    };
  }, [width, pages.length]);

  return (
    <View onLayout={handleLayout}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => swipingCb.current?.(true)}
          onScrollEndDrag={() => setTimeout(() => swipingCb.current?.(false), 120)}
          style={styles.scroller}
        >
          {pages.map((content, i) => (
            <View key={i} style={{ width, paddingHorizontal: pagePadding }}>
              {content}
            </View>
          ))}
        </ScrollView>
      )}
      {pages.length > 1 && (
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8} accessibilityLabel={`${i + 1}번째 카드 묶음`}>
              <View style={[styles.dot, i === page && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroller: Platform.select({ web: { userSelect: 'none' } as object, default: {} }),
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.accent,
  },
});
