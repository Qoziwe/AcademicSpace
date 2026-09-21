/**
 * `<PlanCard>` — карточка тарифа (`design-reference.html:608` `plans`).
 * Выделена из PAYWALL в переиспользуемый молекул (`CLAUDE.md` §7): из неё
 * собираются и PAYWALL (маркетинг + выбор), и PLAN_SELECTION (только выбор),
 * и PROFILE_SUBSCRIPTION (смена тарифа).
 *
 * `tone`:
 *  - `onNavy` — на брендовом навy-фоне пейвола (вне темы), 1:1 с прототипом;
 *  - `surface` — на theme-aware поверхности (PROFILE_SUBSCRIPTION).
 */

import { StyleSheet, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, displayFont, radius } from '@/theme';

type Tone = 'onNavy' | 'surface';

interface Props {
  period: string;
  price: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  /** Лента «ВЫГОДНЕЕ» слева сверху. */
  best?: boolean;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function PlanCard({
  period,
  price,
  sub,
  selected,
  onPress,
  best = false,
  tone = 'onNavy',
  style,
}: Props) {
  const { palette } = useTheme();

  const onNavy = tone === 'onNavy';
  const bg = onNavy
    ? selected
      ? '#FFFFFF'
      : 'rgba(255,255,255,0.06)'
    : selected
      ? 'rgba(46,107,255,0.08)'
      : palette.card;
  const border = onNavy
    ? selected
      ? '#FFFFFF'
      : 'rgba(255,255,255,0.12)'
    : selected
      ? accent.blue
      : palette.border;

  const inkOnCard = onNavy ? '#1B1F4B' : palette.ink;
  const subOnCard = onNavy ? '#9297B5' : palette.sub;
  const periodColor = onNavy ? (selected ? '#7A7F9E' : 'rgba(255,255,255,0.6)') : palette.sub;
  const priceColor = onNavy ? (selected ? inkOnCard : '#FFFFFF') : palette.ink;
  const subColor = onNavy ? (selected ? subOnCard : 'rgba(255,255,255,0.45)') : palette.sub;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      {best ? (
        <View style={styles.ribbon}>
          <Text style={[bodyFont('800'), styles.ribbonText]}>ВЫГОДНЕЕ</Text>
        </View>
      ) : null}
      <Text style={[bodyFont('700'), styles.period, { color: periodColor }]}>{period}</Text>
      <Text style={[displayFont('600'), styles.price, { color: priceColor }]}>{price}</Text>
      <Text style={[bodyFont('500'), styles.sub, { color: subColor }]}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    position: 'relative',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: 15,
  },
  ribbon: {
    position: 'absolute',
    top: -9,
    left: 14,
    backgroundColor: accent.gold,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ribbonText: {
    fontSize: 9,
    color: '#221A00',
    letterSpacing: 0.4,
  },
  period: { fontSize: 11.5 },
  price: { fontSize: 20, marginTop: 6, letterSpacing: -0.4 },
  sub: { fontSize: 10.5, marginTop: 4 },
});
