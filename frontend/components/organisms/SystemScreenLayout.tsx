/**
 * `<SystemScreenLayout>` — общий каркас системных экранов
 * (`design-reference.html:1055`, `isSystem`). Один компонент ветвится по
 * `kind` (`CLAUDE.md` §7): фон, цвет иконки и палитра текста берутся из
 * `sysCopyMap` / `sysWrap` прототипа. Эти экраны сознательно вне темы
 * (`docs/design-tokens.md`).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

export type SystemKind = 'error' | 'offline' | 'maintenance' | 'update';

interface Props {
  kind: SystemKind;
  title: string;
  text: string;
  /** Моноширинная плашка с тех. деталями (`request_id`, версия). */
  detail?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

interface KindTheme {
  bg: string;
  dark: boolean;
  iconColor: string;
  /** update → квадрат (rotate 45°), остальные → круг. */
  square: boolean;
  iconSize: number;
}

const KIND: Record<SystemKind, KindTheme> = {
  error: { bg: navy.deep, dark: true, iconColor: accent.rose, square: false, iconSize: 26 },
  maintenance: {
    bg: navy.primary,
    dark: true,
    iconColor: accent.gold,
    square: false,
    iconSize: 26,
  },
  update: { bg: navy.deep, dark: true, iconColor: accent.blue, square: true, iconSize: 26 },
  offline: { bg: '#F6F7FB', dark: false, iconColor: '#9297B5', square: false, iconSize: 28 },
};

export function SystemScreenLayout({ kind, title, text, detail, ctaLabel, onCta }: Props) {
  const insets = useSafeAreaInsets();
  const k = KIND[kind];

  const titleColor = k.dark ? '#FFFFFF' : '#1B1F4B';
  const textColor = k.dark ? 'rgba(255,255,255,0.6)' : '#7A7F9E';

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: k.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.inner}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: k.dark ? 'rgba(255,255,255,0.08)' : '#E9ECF6' },
          ]}
        >
          <View
            style={{
              width: k.iconSize,
              height: k.iconSize,
              borderRadius: k.square ? 9 : k.iconSize / 2,
              backgroundColor: k.iconColor,
              transform: k.square ? [{ rotate: '45deg' }] : undefined,
            }}
          />
        </View>

        <View style={styles.textCol}>
          <Text style={[displayFont('600'), styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={[bodyFont('500'), styles.text, { color: textColor }]}>{text}</Text>
        </View>

        {detail ? (
          <View
            style={[
              styles.detail,
              { backgroundColor: k.dark ? 'rgba(255,255,255,0.07)' : '#EDEFF6' },
            ]}
          >
            <Text style={[styles.detailText, { color: textColor }]}>{detail}</Text>
          </View>
        ) : null}

        {ctaLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCta}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: k.dark ? '#FFFFFF' : '#1B1F4B', opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text
              style={[bodyFont('800'), styles.ctaText, { color: k.dark ? '#1B1F4B' : '#FFFFFF' }]}
            >
              {ctaLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { alignItems: 'center' },
  title: { fontSize: 21, letterSpacing: -0.5, textAlign: 'center' },
  text: { fontSize: 13, lineHeight: 20.8, marginTop: 11, textAlign: 'center' },
  detail: {
    width: '100%',
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  detailText: {
    fontFamily: 'monospace',
    fontSize: 10.5,
  },
  cta: {
    width: '100%',
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 14 },
});
