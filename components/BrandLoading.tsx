/**
 * Переходный экран с брендовым навy-фоном (SPLASH / AUTH_LOADING /
 * ANALYSIS_LOADING). По `design-tokens.md` навy-экраны не подчиняются
 * теме — всегда `navy.primary`.
 *
 * Фаза 1: статичный ромб + спиннер + подпись. Анимации spin/pulse —
 * Фаза 5 (Reanimated).
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/brand';
import { fontFamily, navy } from '@/theme';

interface Props {
  caption: string;
  sub?: string;
}

export function BrandLoading({ caption, sub }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.diamond} />
      <Text style={styles.brand}>{BRAND.appName}</Text>
      <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
      <Text style={styles.caption}>{caption}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: navy.primary,
    paddingHorizontal: 32,
  },
  diamond: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7C93FF',
    transform: [{ rotate: '45deg' }],
    marginBottom: 20,
  },
  brand: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  spinner: { marginTop: 28 },
  caption: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 14,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fontFamily.text,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    textAlign: 'center',
  },
});
