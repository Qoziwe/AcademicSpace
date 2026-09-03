import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { DevMenu } from '@/components/dev/DevMenu';
import { OfflineBanner } from '@/components/organisms/OfflineBanner';
import { TabBarHost } from '@/components/organisms/TabBar';
import { AppProviders } from '@/providers/AppProviders';
import { lightPalette } from '@/theme';

/**
 * Корневой layout — единый Stack на всё приложение (`CLAUDE.md` §7: у каждого
 * ID реестра честный отдельный route-файл, а не переключение по стейту).
 * Nav-type из реестра прокидывается через `<Stack.Screen options>`:
 *  - `subscription/*` (PAYWALL / PLAN_SELECTION / PAYMENT_FLOW) — модалки;
 *  - `auth/loading`, `ai/analysis/loading`, `system/maintenance`,
 *    `system/update` — жест «назад» отключён.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="subscription/offer" options={{ presentation: 'modal' }} />
          <Stack.Screen name="subscription/plans" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="subscription/payment"
            options={{ presentation: 'modal', gestureEnabled: false }}
          />
          <Stack.Screen name="auth/loading" options={{ gestureEnabled: false }} />
          <Stack.Screen name="ai/analysis/loading" options={{ gestureEnabled: false }} />
          <Stack.Screen name="system/maintenance" options={{ gestureEnabled: false }} />
          <Stack.Screen name="system/update" options={{ gestureEnabled: false }} />
        </Stack>

        <TabBarHost />
        <OfflineBanner />
        {__DEV__ ? <DevMenu /> : null}
      </View>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightPalette.page,
  },
});
