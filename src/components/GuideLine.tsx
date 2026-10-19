import React from 'react';
import Svg, { Defs, Line, LinearGradient, Stop } from 'react-native-svg';

type Props = {
  orientation: 'vertical' | 'horizontal';
  length: number;
  color: string;
  gradientId: string;
};

const THICKNESS = 3;

// A smart-guide line drawn as dashed with a soft fade at both ends, instead
// of a flat solid bar — the same "alignment guide" look design tools use,
// rather than a plain debug-looking line.
export default function GuideLine({ orientation, length, color, gradientId }: Props) {
  const isVertical = orientation === 'vertical';
  const width = isVertical ? THICKNESS : length;
  const height = isVertical ? length : THICKNESS;

  const mid = THICKNESS / 2;

  return (
    <Svg width={width} height={height} style={styles.svg}>
      <Defs>
        {/* A perfectly vertical/horizontal line has a zero-width or
            zero-height bounding box, and objectBoundingBox gradients (the
            SVG default) are spec'd to be ignored entirely against a
            degenerate box — the line would silently paint nothing.
            userSpaceOnUse with the line's own endpoints sidesteps that. */}
        <LinearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={isVertical ? mid : 0}
          y1={isVertical ? 0 : mid}
          x2={isVertical ? mid : length}
          y2={isVertical ? length : mid}
        >
          <Stop offset="0" stopColor={color} stopOpacity={0} />
          <Stop offset="0.12" stopColor={color} stopOpacity={0.85} />
          <Stop offset="0.88" stopColor={color} stopOpacity={0.85} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Line
        x1={isVertical ? mid : 0}
        y1={isVertical ? 0 : mid}
        x2={isVertical ? mid : length}
        y2={isVertical ? length : mid}
        stroke={`url(#${gradientId})`}
        strokeWidth={1.5}
        strokeDasharray="5,5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = {
  svg: { position: 'absolute' as const },
};
