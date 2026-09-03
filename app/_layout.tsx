import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { DevMenu } from '@/components/dev/DevMenu';
import { OfflineBanner } from '@/components/organisms/OfflineBanner';
import { TabBarHost } from '@/components/organisms/TabBar';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useTheme } from '@/hooks/useTheme';
import { useMockStore } from '@/mocks/store';
import { AppProviders } from '@/providers/AppProviders';
import { useSessionStore } from '@/stores/session';
import { useThemeStore } from '@/stores/theme';

/**
 * Корневой layout — единый Stack на всё приложение (`CLAUDE.md` §7: у каждого
 * ID реестра честный отдельный route-файл, а не переключение по стейту).
 * Nav-type из реестра прокидывается через `<Stack.Screen options>`:
 *  - `subscription/*` (PAYWALL / PLAN_SELECTION / PAYMENT_FLOW) — модалки;
 *  - `auth/loading`, `ai/analysis/loading`, `system/maintenance`,
 *    `system/update` — жест «назад» отключён.
 *
 * Сплэш держится (native splash) пока не загрузятся шрифты и не
 * гидратируются сторы сессии/темы (Фаза 2).
 */
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded } = useAppFonts();
  const sessionHydrated = useSessionStore((s) => s.hydrated);
  const themeHydrated = useThemeStore((s) => s.hydrated);
  const mockHydrated = useMockStore((s) => s.hydrated);

  const ready = fontsLoaded && sessionHydrated && themeHydrated && mockHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}

function AppShell() {
  const { palette, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: palette.page }]}>
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
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
