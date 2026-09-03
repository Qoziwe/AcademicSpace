/**
 * `<Button>` — три варианта из прототипа:
 *  - `primary` — заливка (tone: `navy` #2C317A / `blue` #2E6BFF / `gold`
 *    #F3C24B / `contrast` белый на навy-экранах). Основные CTA.
 *  - `secondary` — мягкая голубая плашка `#EAF1FF` / `accent.blue`
 *    («Открыть чат», «Обсудить с ИИ-ментором», premium-CTA документов).
 *  - `ghost` — прозрачная с обводкой («У меня уже есть аккаунт»).
 *
 * `size`: sm (44) / md (48) / lg (56) — высоты и радиусы из дизайна.
 * `elevated` — тень CTA в цвет кнопки (`shadow.cta`).
 */

import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, navy, radius } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Tone = 'navy' | 'blue' | 'gold' | 'contrast';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  elevated?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Ghost: цвет текста/иконок. */
  color?: string;
  /** Ghost: цвет обводки. */
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<Size, { height: number; radius: number; fontSize: number; paddingH: number }> =
  {
    sm: { height: 44, radius: radius.md, fontSize: 13, paddingH: 16 },
    md: { height: 48, radius: 15, fontSize: 14, paddingH: 18 },
    lg: { height: 56, radius: radius.lg, fontSize: 15, paddingH: 22 },
  };

const PRIMARY_BG: Record<Tone, string> = {
  navy: navy.primary,
  blue: accent.blue,
  gold: accent.gold,
  contrast: '#FFFFFF',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'navy',
  size = 'lg',
  disabled = false,
  loading = false,
  block = true,
  elevated = false,
  iconLeft,
  iconRight,
  color,
  borderColor,
  style,
}: Props) {
  const { palette } = useTheme();
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  let bg = 'transparent';
  let fg = color ?? accent.blue;
  let border: string | undefined;

  if (variant === 'primary') {
    bg = PRIMARY_BG[tone];
    fg = tone === 'gold' ? '#221A00' : tone === 'contrast' ? palette.ink : '#FFFFFF';
  } else if (variant === 'secondary') {
    bg = 'rgba(46,107,255,0.10)';
    fg = accent.blue;
  } else {
    border = borderColor ?? 'rgba(0,0,0,0.12)';
    fg = color ?? accent.blue;
  }

  const shadow =
    elevated && variant === 'primary'
      ? {
          shadowColor: bg,
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 10,
        }
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          borderRadius: s.radius,
          paddingHorizontal: s.paddingH,
          backgroundColor: bg,
          borderWidth: border ? 1 : 0,
          borderColor: border,
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {iconLeft}
          <Text style={[bodyFont('700'), { fontSize: s.fontSize, color: fg }]}>{label}</Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
