import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/AppProviders';

/**
 * Корневой layout. На Фазе 0 — единственный экран-заглушка (`index`).
 * Полное дерево роутов по `docs/source/03-routes.md` собирается на Фазе 1.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
