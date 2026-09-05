import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { DevMenu } from '@/components/dev/DevMenu';
import { OfflineBanner } from '@/components/organisms/OfflineBanner';
import { Sidebar } from '@/components/organisms/Sidebar';
import { TabBarHost } from '@/components/organisms/TabBar';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/hooks/useTheme';
import { useMockStore } from '@/mocks/store';
import { NO_SHELL_ROUTE_PATHS } from '@/navigation/registry';
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

/**
 * Роуты, которым на десктопе (внутри сайдбар-раскладки) нужна широкая
 * многоколоночная колонка, а не комфортная читаемая — Dashboard/Results/
 * Vaults List перестраиваются внутри себя под `isWide` (Фаза 7, roadmap).
 */
const WIDE_SHELL_PATHS = new Set<string>(['/dashboard', '/universities/results', '/documents']);
const DESKTOP_CONTENT_MAX_WIDTH = 780;
const DESKTOP_WIDE_CONTENT_MAX_WIDTH = 1240;

function AppShell() {
  const { palette, isDark } = useTheme();
  const pathname = usePathname();
  const { isDesktop } = useBreakpoint();

  // Сайдбар (десктоп-навигация) заменяет плавающий таб-бар только на роутах
  // с мок-сессией и вне модалок — Splash/Welcome/Auth/System/Paywall не трогаем
  // (брендовые полноэкранные моменты, см. `NO_SHELL_ROUTE_PATHS`).
  const showShell = isDesktop && !NO_SHELL_ROUTE_PATHS.has(pathname);
  const contentMaxWidth = showShell
    ? WIDE_SHELL_PATHS.has(pathname)
      ? DESKTOP_WIDE_CONTENT_MAX_WIDTH
      : DESKTOP_CONTENT_MAX_WIDTH
    : undefined;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: palette.page }]}>
        <View style={[styles.body, showShell && styles.bodyShell]}>
          <Sidebar visible={showShell} activePath={pathname} />

          <View style={[styles.contentOuter, showShell && styles.contentOuterShell]}>
            <View style={[styles.frame, contentMaxWidth != null && { maxWidth: contentMaxWidth }]}>
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

              {!showShell ? <TabBarHost /> : null}
            </View>
          </View>
        </View>

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
  body: {
    flex: 1,
  },
  bodyShell: {
    flexDirection: 'row',
  },
  contentOuter: {
    flex: 1,
    width: '100%',
  },
  contentOuterShell: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  frame: {
    flex: 1,
    width: '100%',
  },
});
