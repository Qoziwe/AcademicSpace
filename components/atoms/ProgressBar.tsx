/**
 * `<ProgressBar>` — горизонтальная полоса прогресса. В прототипе много
 * вариантов (XP на дашборде — градиент 5px; прогресс задач — 4px `accent.blue`;
 * копилка/модуль — 6px `accent.blueLight` на навy). Параметризуем цветом,
 * высотой и фоном трека.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { accent } from '@/theme';

interface Props {
  /** 0..1. Значения за пределами клампятся. */
  value: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  /** Градиентная заливка (XP-бар дашборда: `#7C93FF → #B6C4FF`). */
  fillGradient?: [string, string];
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  height = 5,
  trackColor = '#EDEFF6',
  fillColor = accent.blue,
  fillGradient,
  style,
}: Props) {
  const pct = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` as const;

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}
    >
      {fillGradient ? (
        <LinearGradient
          colors={fillGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: pct, height: '100%', borderRadius: height / 2 }}
        />
      ) : (
        <View
          style={{
            width: pct,
            height: '100%',
            borderRadius: height / 2,
            backgroundColor: fillColor,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
