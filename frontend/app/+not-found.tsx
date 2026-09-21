import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { accent, fontFamily, lightPalette, spacing } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Не найдено' }} />
      <View style={styles.root}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.text}>Такого экрана нет в реестре роутов.</Text>
        <Link href="/dashboard" style={styles.link}>
          На дашборд
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightPalette.screen,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  code: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    fontWeight: '700',
    color: lightPalette.ink,
  },
  text: {
    fontFamily: fontFamily.text,
    fontSize: 13,
    color: lightPalette.sub,
    textAlign: 'center',
  },
  link: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    fontWeight: '700',
    color: accent.blue,
    marginTop: spacing.md,
  },
});
