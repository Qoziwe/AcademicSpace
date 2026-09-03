/**
 * Переходный экран с брендовым навy-фоном (SPLASH / AUTH_LOADING /
 * ANALYSIS_LOADING). Навy-экраны не подчиняются теме
 * (`docs/design-tokens.md`) — всегда `navy.primary`.
 *
 * Фаза 2: `<BrandLogo>` + шрифты Unbounded/Manrope + токены.
 * Анимации spin/pulse ромба и кольца — Фаза 5 (Reanimated).
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/atoms';
import { BRAND } from '@/constants/brand';
import { bodyFont, displayFont, navy, spacing } from '@/theme';

interface Props {
  caption: string;
  sub?: string;
  /** Показать название приложения под знаком (SPLASH). */
  showBrandName?: boolean;
}

export function BrandLoading({ caption, sub, showBrandName = true }: Props) {
  return (
    <View style={styles.root}>
      <BrandLogo size={48} style={styles.logo} />
      {showBrandName ? (
        <Text style={[displayFont('600'), styles.brand]}>{BRAND.appName}</Text>
      ) : null}
      <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
      <Text style={[bodyFont('600'), styles.caption]}>{caption}</Text>
      {sub ? <Text style={[bodyFont('400'), styles.sub]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: navy.primary,
    paddingHorizontal: spacing.xxxl,
  },
  logo: {
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: 20,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  spinner: { marginTop: spacing.xxl },
  caption: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 14,
    textAlign: 'center',
  },
  sub: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    textAlign: 'center',
  },
});
