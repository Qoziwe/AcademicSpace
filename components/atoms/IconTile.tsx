/**
 * `<IconTile>` — скруглённый квадрат-контейнер под иконку/глиф.
 * Встречается в дизайне повсюду: плитки дашборда (`iconWrap` 26/r9),
 * слоты загрузки портфолио (36/r12), ячейки копилки (34/r11), карточка
 * модуля в чате (26/r9).
 *
 * `tone` задаёт пресет фон/цвет; при желании — точечные оверрайды через
 * `background` / `color`.
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, navy } from '@/theme';

export type IconTileTone = 'blueSoft' | 'muted' | 'navy' | 'navySoft';

interface Props {
  size?: number;
  radius?: number;
  tone?: IconTileTone;
  /** Готовый узел иконки (напр. из `@expo/vector-icons`). */
  children?: ReactNode;
  /** Строковый глиф — рендерится с цветом тона (плитки дашборда). */
  glyph?: string;
  glyphSize?: number;
  background?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconTile({
  size = 36,
  radius = 12,
  tone = 'blueSoft',
  children,
  glyph,
  glyphSize = 13,
  background,
  color,
  style,
}: Props) {
  const { palette } = useTheme();

  const preset: Record<IconTileTone, { bg: string; fg: string }> = {
    blueSoft: { bg: 'rgba(46,107,255,0.10)', fg: accent.blue },
    muted: { bg: palette.chip, fg: palette.sub },
    navy: { bg: navy.deep, fg: accent.blueLight },
    navySoft: { bg: 'rgba(21,24,67,0.07)', fg: '#232A6B' },
  };

  const bg = background ?? preset[tone].bg;
  const fg = color ?? preset[tone].fg;

  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: radius, backgroundColor: bg },
        style,
      ]}
    >
      {glyph != null ? (
        <Text style={[bodyFont('700'), { fontSize: glyphSize, color: fg, lineHeight: glyphSize }]}>
          {glyph}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
