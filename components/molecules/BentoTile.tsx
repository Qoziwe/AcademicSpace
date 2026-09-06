/**
 * `<BentoTile>` — плитка быстрого доступа на дашборде (`tiles`,
 * `design-reference.html:206`). Реализует lock-тизер из `CLAUDE.md` §6
 * (паттерн 2): плитка premium-раздела для Free рендерится всегда, но с
 * `opacity .55`, иконкой-замком и переходом на PAYWALL вместо цели —
 * через `usePremiumGate().resolveHref`.
 *
 * Иконка — цветная SVG `<TileIcon>` на всю площадь плитки (не вложенный
 * контейнер), подпись — на полупрозрачной подложке снизу.
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

import { Icon, TileIcon, type TileIconName } from '@/components/atoms';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { bodyFont, radius } from '@/theme';

const LABEL_COLOR = '#3A4180';

interface Props {
  label: string;
  /** Имя цветной иконки плитки (`<TileIcon>`). */
  icon: TileIconName;
  href: Href;
  /** Плитка ведёт в premium-раздел (для Free → замок + PAYWALL). */
  premium?: boolean;
  variant?: 'default' | 'bot';
  onPress?: (locked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export function BentoTile({ label, icon, href, premium = false, onPress, style }: Props) {
  const { isPremium, resolveHref } = usePremiumGate();
  const locked = premium && !isPremium;

  const go = () => {
    if (onPress) onPress(locked);
    else router.push(resolveHref(href, { locked }));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={go}
      style={[styles.press, style]}
    >
      <View style={[styles.tile, locked && styles.tileLocked]}>
        <TileIcon name={icon} />
        <View style={styles.labelWrap}>
          <Text numberOfLines={1} style={[bodyFont('700'), styles.label]}>
            {label}
          </Text>
        </View>
        {locked ? (
          <View style={styles.lock}>
            <Icon name="lock" size={9} color="#F3C24B" strokeWidth={1.6} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { flex: 1 },
  tile: {
    position: 'relative',
    height: 82,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#E2EAFB',
  },
  tileLocked: { opacity: 0.55 },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(20,24,60,0.06)',
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
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#2C317A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
