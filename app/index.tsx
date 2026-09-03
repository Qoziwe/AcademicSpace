import { StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/brand';
import { accent, fontFamily, lightPalette, spacing } from '@/theme';

/**
 * Экран-заглушка Фазы 0: подтверждает, что Expo Router поднимается пустым,
 * токены и брендинг импортируются. Заменяется на реальный SPLASH (`/`) на Фазе 1.
 */
export default function BootstrapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.diamond} />
      <Text style={styles.title}>{BRAND.appName}</Text>
      <Text style={styles.subtitle}>Фаза 0 — бутстрап проекта готов</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightPalette.screen,
    gap: spacing.md,
  },
  diamond: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: accent.blue,
    transform: [{ rotate: '45deg' }],
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: lightPalette.ink,
  },
  subtitle: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    color: lightPalette.sub,
  },
});
