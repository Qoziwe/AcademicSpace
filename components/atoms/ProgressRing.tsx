/**
 * `<ProgressRing>` — круговая шкала прогресса (XP-кольцо вокруг аватара,
 * `design-reference.html:182/837` — `conic-gradient(from -90deg, #7C93FF
 * 0% 62%, rgba(255,255,255,.16) …)`). Старт с 12 часов, по часовой.
 * `conic-gradient` в RN нет — рисуем SVG-обводкой с `strokeDasharray`.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { accent } from '@/theme';

interface Props {
  /** 0..1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Контент по центру кольца (аватар, число). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProgressRing({
  progress,
  size = 82,
  strokeWidth = 4,
  color = accent.blueLight,
  trackColor = 'rgba(255,255,255,0.16)',
  children,
  style,
}: Props) {
  const p = Math.min(1, Math.max(0, progress));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference * p} ${circumference * (1 - p)}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children != null ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
