/**
 * `<HeaderBar>` — верхняя панель контентных экранов
 * (`design-reference.html`: `padding:52px 20px 14px;background:#fff;
 * border-bottom` — Questionnaire / Filters / Results / Portfolio / Chat /
 * Tasks / Vaults / Log / Settings).
 *
 * Варианты:
 *  - `light` — белая карта-шапка, theme-aware (`palette.card` / `border` /
 *    `ink` / `sub`), `CLAUDE.md` §8;
 *  - `dark` — брендовый навy (`navy.primary`), белый текст — шапки
 *    UNIVERSITY_DETAILS / VAULT_DETAIL / PROFILE / MODULE_DETAIL.
 *
 * `onBack` рендерит чип-стрелку (38×38). `rightSlot` — действие справа
 * (напр. «Сменить страну»). `below` — слот под строкой заголовка
 * (`<FilterStepper>`). `children` — доп. контент навy-шапки (бейджи, статы).
 */

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { bodyFont, navy, radius, spacing } from '@/theme';

interface Props {
  title?: string;
  sub?: string;
  onBack?: () => void;
  variant?: 'light' | 'dark';
  rightSlot?: ReactNode;
  below?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function HeaderBar({
  title,
  sub,
  onBack,
  variant = 'light',
  rightSlot,
  below,
  children,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  const dark = variant === 'dark';
  const bg = dark ? navy.primary : palette.card;
  const inkColor = dark ? '#FFFFFF' : palette.ink;
  const subColor = dark ? 'rgba(255,255,255,0.6)' : palette.sub;
  const chipBg = dark ? 'rgba(255,255,255,0.12)' : palette.chip;
  const chipIcon = dark ? '#FFFFFF' : palette.ink;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: bg,
          paddingTop: Math.max(insets.top, 20) + 12,
          borderBottomWidth: dark ? 0 : 1,
          borderBottomColor: palette.border,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: chipBg, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Icon name="chevron-left" size={18} color={chipIcon} />
          </Pressable>
        ) : null}

        {title != null ? (
          <View style={styles.titleCol}>
            <Text style={[bodyFont('800'), styles.title, { color: inkColor }]}>{title}</Text>
            {sub != null ? (
              <Text style={[bodyFont('500'), styles.sub, { color: subColor }]}>{sub}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.titleCol} />
        )}

        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>

      {children}
      {below ? <View style={styles.below}>{below}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  chip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 15.5 },
  sub: { fontSize: 11, marginTop: 2 },
  right: { flexShrink: 0 },
  below: { marginTop: 14 },
});
