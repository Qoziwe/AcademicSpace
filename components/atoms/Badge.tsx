/**
 * `<Badge>` — некликабельная плашка-ярлык: `PREMIUM`
 * (`design-reference.html:305/480/578`), категории `SAFETY / MATCH / REACH`
 * (`:450`), `mdKind` на карточке модуля (`:1012`). Опциональная ведущая
 * точка — как у `PREMIUM` и `MATCH`.
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { accent, bodyFont } from '@/theme';

export type BadgeTone = 'gold' | 'blue' | 'green' | 'rose' | 'neutral' | 'onNavy';

interface Props {
  label: string;
  tone?: BadgeTone;
  /** Ведущая квадратная/круглая точка в цвет текста. */
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  gold: { bg: 'rgba(243,194,75,0.16)', fg: accent.gold },
  blue: { bg: 'rgba(46,107,255,0.12)', fg: accent.blue },
  green: { bg: 'rgba(31,181,116,0.14)', fg: accent.green },
  rose: { bg: 'rgba(226,115,155,0.16)', fg: accent.rose },
  neutral: { bg: 'rgba(122,127,158,0.14)', fg: '#7A7F9E' },
  // На тёмном навy-фоне (шапка UNIVERSITY_DETAILS: rgba(46,107,255,.28) / #C3D0FF).
  onNavy: { bg: 'rgba(46,107,255,0.28)', fg: '#C3D0FF' },
};

export function Badge({ label, tone = 'neutral', dot = false, size = 'md', style }: Props) {
  const c = TONES[tone];
  const compact = size === 'sm';

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.bg,
          paddingHorizontal: compact ? 7 : 9,
          paddingVertical: compact ? 3 : 4,
        },
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: c.fg }]} /> : null}
      <Text style={[bodyFont('800'), styles.label, { color: c.fg, fontSize: compact ? 9 : 10 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  label: {
    letterSpacing: 0.6,
  },
});
