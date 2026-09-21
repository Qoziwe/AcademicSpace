/**
 * Route-guard'ы Auth / Premium как переиспользуемая обёртка (Фаза 1 роадмапа).
 *
 * Применяется в каждом route-файле `app/**` одной строкой:
 *   export default withGuard(Screen, { auth: true, premium: true });
 *
 * Значения `auth` / `premium` берутся из колонок реестра
 * (`navigation/registry.ts` → `ROUTES[id]`), чтобы не расходились с
 * `docs/source/03-routes.md`.
 *
 * Поведение:
 *  - пока `hydrated === false` (AsyncStorage ещё читается) — нейтральный
 *    fallback, без редиректа (иначе deep link мигал бы на /welcome);
 *  - `auth` и нет сессии → `<Redirect href="/welcome" />`;
 *  - `premium` и тариф не premium → `<Redirect href="/subscription/offer" />`
 *    (Free по deep link на Premium-only роут уводит на Paywall — требование
 *    реестра и `CLAUDE.md` §6 / Фаза 6).
 */

import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessionStore } from '@/stores/session';
import { accent, lightPalette } from '@/theme';

export interface GuardOptions {
  auth?: boolean;
  premium?: boolean;
}

function GuardFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator color={accent.blue} />
    </View>
  );
}

export function withGuard<P extends object>(
  Screen: ComponentType<P>,
  options: GuardOptions = {},
): ComponentType<P> {
  function Guarded(props: P) {
    const isAuthed = useSessionStore((s) => s.isAuthed);
    const plan = useSessionStore((s) => s.plan);
    const hydrated = useSessionStore((s) => s.hydrated);

    if (!hydrated) return <GuardFallback />;
    if (options.auth && !isAuthed) return <Redirect href="/welcome" />;
    if (options.premium && plan !== 'premium') return <Redirect href="/subscription/offer" />;

    return <Screen {...props} />;
  }

  Guarded.displayName = `withGuard(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return Guarded;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightPalette.screen,
  },
});
