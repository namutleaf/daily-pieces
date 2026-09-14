import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { IllustrationKey } from '../data/illustrations';

// A fixed (not random) scatter, so the star field looks the same every time
// the card re-renders or is captured for sharing.
const STARS = [
  { x: 24, y: 40, r: 1.6 },
  { x: 60, y: 22, r: 1.2 },
  { x: 95, y: 55, r: 1.8 },
  { x: 140, y: 18, r: 1.3 },
  { x: 175, y: 48, r: 1.6 },
  { x: 20, y: 100, r: 1.2 },
  { x: 55, y: 130, r: 1.5 },
  { x: 110, y: 95, r: 1.2 },
  { x: 160, y: 110, r: 1.7 },
  { x: 265, y: 40, r: 1.4 },
  { x: 40, y: 180, r: 1.3 },
  { x: 90, y: 210, r: 1.6 },
  { x: 200, y: 150, r: 1.2 },
  { x: 250, y: 190, r: 1.5 },
  { x: 130, y: 250, r: 1.3 },
  { x: 30, y: 280, r: 1.6 },
  { x: 270, y: 260, r: 1.3 },
  { x: 190, y: 300, r: 1.5 },
  { x: 70, y: 330, r: 1.2 },
  { x: 230, y: 330, r: 1.6 },
];

const FLOWERS = [
  { x: 45, y: 90, color: '#F2A6C3' },
  { x: 110, y: 60, color: '#F7C97E' },
  { x: 200, y: 100, color: '#C9A6E8' },
  { x: 255, y: 65, color: '#F2A6C3' },
  { x: 30, y: 190, color: '#9FCBEA' },
  { x: 150, y: 170, color: '#F7C97E' },
  { x: 230, y: 210, color: '#F2A6C3' },
  { x: 80, y: 250, color: '#C9A6E8' },
  { x: 190, y: 290, color: '#9FCBEA' },
  { x: 260, y: 300, color: '#F7C97E' },
];

type Props = { illustration: IllustrationKey };

// Simple flat-shape scenes drawn with vector primitives — since these are
// code-drawn (not image files), they always render correctly here, in the
// shared web preview, and on a real device alike, with no asset to go
// missing. viewBox 300x375 matches the card's own aspect ratio.
export default function IllustrationBackground({ illustration }: Props) {
  switch (illustration) {
    case 'night-sky':
      return (
        <Svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#1B2A6B" />
              <Stop offset="1" stopColor="#3C2E68" />
            </LinearGradient>
          </Defs>
          <Rect width="300" height="375" fill="url(#g)" />
          {STARS.map((s, i) => (
            <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.85} />
          ))}
          <Circle cx="225" cy="72" r="26" fill="#FDF3C7" />
          <Circle cx="236" cy="64" r="22" fill="#1B2A6B" />
        </Svg>
      );

    case 'clouds':
      return (
        <Svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#AFD8F5" />
              <Stop offset="1" stopColor="#E8F4FF" />
            </LinearGradient>
          </Defs>
          <Rect width="300" height="375" fill="url(#g)" />
          <Ellipse cx="80" cy="90" rx="55" ry="28" fill="#FFFFFF" opacity="0.9" />
          <Ellipse cx="125" cy="100" rx="38" ry="22" fill="#FFFFFF" opacity="0.9" />
          <Ellipse cx="215" cy="180" rx="60" ry="30" fill="#FFFFFF" opacity="0.85" />
          <Ellipse cx="255" cy="190" rx="34" ry="19" fill="#FFFFFF" opacity="0.85" />
          <Ellipse cx="60" cy="280" rx="50" ry="26" fill="#FFFFFF" opacity="0.8" />
          <Ellipse cx="100" cy="290" rx="34" ry="18" fill="#FFFFFF" opacity="0.8" />
        </Svg>
      );

    case 'waves':
      return (
        <Svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#BFE3F2" />
              <Stop offset="1" stopColor="#3E76B8" />
            </LinearGradient>
          </Defs>
          <Rect width="300" height="375" fill="url(#g)" />
          <Path
            d="M0,220 Q37.5,200 75,220 T150,220 T225,220 T300,220 V375 H0 Z"
            fill="#FFFFFF"
            opacity={0.22}
          />
          <Path
            d="M0,262 Q37.5,242 75,262 T150,262 T225,262 T300,262 V375 H0 Z"
            fill="#FFFFFF"
            opacity={0.32}
          />
          <Path
            d="M0,305 Q37.5,285 75,305 T150,305 T225,305 T300,305 V375 H0 Z"
            fill="#FFFFFF"
            opacity={0.5}
          />
        </Svg>
      );

    case 'mountains':
      return (
        <Svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F7B8A6" />
              <Stop offset="1" stopColor="#7C6FB0" />
            </LinearGradient>
          </Defs>
          <Rect width="300" height="375" fill="url(#g)" />
          <Circle cx="150" cy="105" r="38" fill="#FFE8B0" opacity={0.9} />
          <Polygon points="0,375 0,235 70,155 140,235 140,375" fill="#5B4E8C" opacity={0.85} />
          <Polygon points="90,375 90,265 180,175 260,265 260,375" fill="#413569" opacity={0.9} />
          <Polygon points="200,375 200,245 260,195 300,245 300,375" fill="#2E2650" />
        </Svg>
      );

    case 'florals':
      return (
        <Svg width="100%" height="100%" viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice">
          <Rect width="300" height="375" fill="#FBF0F3" />
          {FLOWERS.map((f, i) => (
            <React.Fragment key={i}>
              <Path d={`M${f.x},${f.y} L${f.x},${f.y + 28}`} stroke="#8FBF8A" strokeWidth={3} />
              <Circle cx={f.x} cy={f.y - 8} r={9} fill={f.color} />
              <Circle cx={f.x - 8} cy={f.y} r={8} fill={f.color} opacity={0.9} />
              <Circle cx={f.x + 8} cy={f.y} r={8} fill={f.color} opacity={0.9} />
              <Circle cx={f.x} cy={f.y + 4} r={8} fill={f.color} opacity={0.9} />
              <Circle cx={f.x} cy={f.y - 2} r={4.5} fill="#FFD873" />
            </React.Fragment>
          ))}
        </Svg>
      );

    default:
      return null;
  }
}
