/**
 * Переходный брендовый навy-экран (AUTH_LOADING, `design-reference.html:148`).
 * Навy-экраны не подчиняются теме (`docs/design-tokens.md`) — всегда
 * `navy.primary`.
 *
 * Кольцо `spin` 1100 мс + ромб `pulse` 1600 мс — Reanimated-примитивы
 * `<Spin>` / `<Pulse>` (Фаза 5), значения из прототипа (`:153–154`).
 */

import { StyleSheet, Text, View } from 'react-native';

import { Pulse, Spin } from '@/components/motion';
import { bodyFont, navy, spacing } from '@/theme';

interface Props {
  caption: string;
  sub?: string;
}

export function BrandLoading({ caption, sub }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.rings}>
        <View style={styles.ringBase} />
        <Spin durationMs={1100} style={styles.ringSpin} />
        <Pulse durationMs={1600} style={styles.diamond} />
      </View>

      <View style={styles.caption}>
        <Text style={[bodyFont('700'), styles.title]}>{caption}</Text>
        {sub ? <Text style={[bodyFont('400'), styles.sub]}>{sub}</Text> : null}
      </View>

      <View style={styles.track}>
        <View style={styles.trackFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: navy.primary,
    gap: 30,
    paddingHorizontal: 50,
  },
  rings: { width: 96, height: 96 },
  ringBase: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ringSpin: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#7C93FF',
  },
  diamond: {
    position: 'absolute',
    inset: 34,
    borderRadius: 9,
    backgroundColor: '#7C93FF',
    transform: [{ rotate: '45deg' }],
  },
  caption: { alignItems: 'center', paddingHorizontal: spacing.sm },
  title: { fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
  sub: {
    fontSize: 13.5,
    lineHeight: 21.5,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
  },
  track: {
    width: 150,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  trackFill: { width: '100%', height: '100%', borderRadius: 2, backgroundColor: '#7C93FF' },
});
