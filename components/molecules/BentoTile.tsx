/**
 * `<BentoTile>` — плитка быстрого доступа на дашборде (`tiles`,
 * `design-reference.html:206`). Реализует lock-тизер из `CLAUDE.md` §6
 * (паттерн 2): плитка premium-раздела для Free рендерится всегда, но с
 * `opacity .55`, иконкой-замком и переходом на PAYWALL вместо цели —
 * через `usePremiumGate().resolveHref`.
 *
 * По умолчанию навигирует через `router.push`; `onPress` (для Playground/
 * тестов) переопределяет с тем же lock-поведением.
 *
 * NB: не `<Link asChild>` — на вебе expo-router прокидывает массив стилей
 * дочернего `<Pressable>` в DOM-`<a>` как есть, и react-dom падает
 * («Failed to set an indexed property [0] on CSSStyleDeclaration»).
 */

import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { IconTile } from '@/components/atoms';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { bodyFont, navy, radius } from '@/theme';

const TILE_BG = '#E2EAFB'; // ref: design-reference.html tiles / палитра
const LABEL_COLOR = '#3A4180';

interface Props {
  label: string;
  /** Глиф из прототипа: ◉ ▤ ◎ ▦ ≡ ∿ ✓ ●● (`glyphs` map). */
  glyph: string;
  href: Href;
  /** Плитка ведёт в premium-раздел (для Free → замок + PAYWALL). */
  premium?: boolean;
  variant?: 'default' | 'bot';
  onPress?: (locked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function BentoTile({
  label,
  glyph,
  href,
  premium = false,
  variant = 'default',
  onPress,
  style,
}: Props) {
  const { isPremium, resolveHref } = usePremiumGate();
  const locked = premium && !isPremium;
  const isBot = variant === 'bot';

  const body = (
    <View
      style={[
        styles.tile,
        { backgroundColor: isBot ? '#FFFFFF' : TILE_BG, opacity: locked ? 0.55 : 1 },
      ]}
    >
      <IconTile
        size={26}
        radius={9}
        tone={isBot ? 'navy' : 'navySoft'}
        glyph={glyph}
        glyphSize={isBot ? 9 : 13}
      />
      <Text style={[bodyFont('700'), styles.label]}>{label}</Text>
      {locked ? (
        <View style={styles.lock}>
          <View style={styles.lockDot} />
        </View>
      ) : null}
    </View>
  );

  const go = () => {
    if (onPress) onPress(locked);
    else router.push(resolveHref(href, { locked }));
  };

  return (
    <Pressable accessibilityRole="button" onPress={go} style={[styles.press, style]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { flex: 1 },
  tile: {
    position: 'relative',
    height: 74,
    borderRadius: radius.lg,
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 9.5,
    color: LABEL_COLOR,
    lineHeight: 11,
  },
  lock: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 5,
    backgroundColor: navy.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockDot: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#F3C24B',
  },
});
