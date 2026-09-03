/**
 * Плавающий таб-бар (`design-reference.html:1083`, `showTabs` / `tabs`).
 *
 * `TabBarHost` решает, показывать ли бар на текущем роуте
 * (`TAB_BAR_ROUTE_PATHS`). Вкладка «Задачи» для Free физически не
 * рендерится — hard-hide из `CLAUDE.md` §6 (`TabEntry.premium`).
 *
 * Фиксированный тёмный фон (`rgba(15,18,48,.95)`) — как в прототипе; blur
 * (`expo-blur`) — косметика Фазы 5, на функциональность не влияет.
 *
 * Навигация через `router.navigate`, а не `<Link asChild>`: на вебе
 * expo-router прокидывает массив стилей дочернего `<Pressable>` в
 * DOM-`<a>` как есть, и react-dom падает на индексном свойстве стиля.
 */

import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_ROUTE_PATHS, TAB_ENTRIES } from '@/navigation/registry';
import { selectIsPremium, useSessionStore } from '@/stores/session';
import { bodyFont, radius } from '@/theme';

/** Хост: решает, показывать ли таб-бар на текущем роуте. */
export function TabBarHost() {
  const pathname = usePathname();
  if (!TAB_BAR_ROUTE_PATHS.has(pathname)) return null;
  return <TabBar activePath={pathname} />;
}

export function TabBar({ activePath }: { activePath: string }) {
  const insets = useSafeAreaInsets();
  const isPremium = useSessionStore(selectIsPremium);

  const entries = TAB_ENTRIES.filter((e) => !e.premium || isPremium);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}
    >
      <View style={styles.bar}>
        {entries.map((entry) => {
          const active = entry.routePath === activePath;
          return (
            <Pressable
              key={entry.routePath}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => router.navigate(entry.href)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <View style={[styles.dot, active && styles.dotActive]} />
              <Text
                numberOfLines={1}
                style={[bodyFont('700'), styles.label, active && styles.labelActive]}
              >
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    padding: 9,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(15,18,48,0.95)',
    shadowColor: 'rgba(10,13,40,1)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 16,
  },
  tab: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#8FA6FF',
  },
  label: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.45)',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
