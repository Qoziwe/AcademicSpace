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
 * Активная «пилюля» едет за пальцем: long-press (~120 мс) в ЛЮБОЙ точке
 * бара «подхватывает» её — пилюля пружиной прибегает под палец и трекает
 * его позицию (`e.x`), на отпускании прилипает к ближайшему слоту и
 * переключает вкладку (`router.navigate`). Быстрый тап по вкладке — как
 * обычно, через её `Pressable`. Вся анимация — в UI-потоке (Reanimated
 * worklets), навигация коммитится один раз в `onEnd` через `runOnJS`.
 *
 * Навигация через `router.navigate`, а не `<Link asChild>`: на вебе
 * expo-router прокидывает массив стилей дочернего `<Pressable>` в
 * DOM-`<a>` как есть, и react-dom падает на индексном свойстве стиля.
 */

import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/atoms';
import { LiquidGlass } from '@/components/organisms/LiquidGlass';
import { TAB_BAR_ROUTE_PATHS, TAB_ENTRIES } from '@/navigation/registry';
import { selectIsPremium, useSessionStore } from '@/stores/session';
import { bodyFont, radius } from '@/theme';

const ICON_BY_LABEL: Record<string, IconName> = {
  Главная: 'home',
  Вузы: 'compass',
  'ИИ-ментор': 'chat',
  Задачи: 'check-square',
  Профиль: 'user',
};

const BAR_PAD = 9;
const TAB_GAP = 4;
const TAB_H = 46;

const PICKUP = { damping: 18, stiffness: 260 };
const SNAP = { damping: 20, stiffness: 240, mass: 0.6 };

/**
 * Высота самой плашки бара (padding 9×2 + высота таба 46). Экраны с
 * фиксированным нижним элементом (`<Composer>` на AI_CHAT) добавляют это в
 * свой нижний отступ, чтобы плавающий бар не перекрывал контент.
 */
export const TAB_BAR_BAR_HEIGHT = 64;

/** Хост: решает, показывать ли таб-бар на текущем роуте. */
export function TabBarHost() {
  const pathname = usePathname();
  if (!TAB_BAR_ROUTE_PATHS.has(pathname)) return null;
  return <TabBar activePath={pathname} />;
}

function pickupHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
function settleHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

export function TabBar({ activePath }: { activePath: string }) {
  const insets = useSafeAreaInsets();
  const isPremium = useSessionStore(selectIsPremium);

  const entries = useMemo(() => TAB_ENTRIES.filter((e) => !e.premium || isPremium), [isPremium]);
  const n = entries.length;

  const rawIndex = entries.findIndex((e) => e.routePath === activePath);
  const activeIndex = rawIndex < 0 ? 0 : rawIndex;

  const [barW, setBarW] = useState(0);
  const slotW = barW > 0 ? (barW - BAR_PAD * 2 - TAB_GAP * (n - 1)) / n : 0;
  const offsets = useMemo(
    () => Array.from({ length: n }, (_, i) => BAR_PAD + i * (slotW + TAB_GAP)),
    [n, slotW],
  );

  const tx = useSharedValue(0);
  const drag = useSharedValue(0);

  /** Позиция пилюли под точкой `x` (относительно бара) с клампом по краям. */
  const clampToBar = useCallback(
    (x: number) => {
      'worklet';
      const lo = offsets[0] ?? 0;
      const hi = offsets[n - 1] ?? 0;
      return Math.min(hi, Math.max(lo, x - slotW / 2));
    },
    [offsets, n, slotW],
  );

  // Пока пилюлю не тащат — держим её под активной вкладкой.
  useEffect(() => {
    if (slotW <= 0) return;
    tx.value = withSpring(offsets[activeIndex] ?? 0, SNAP);
  }, [activeIndex, slotW, offsets, tx]);

  const commit = useCallback(
    (i: number) => {
      const target = entries[i];
      if (target && i !== activeIndex) router.navigate(target.href);
    },
    [entries, activeIndex],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(slotW > 0)
        .activateAfterLongPress(120)
        .onStart((e) => {
          drag.value = withSpring(1, PICKUP);
          tx.value = withSpring(clampToBar(e.x), SNAP); // пилюля прибегает под палец
          runOnJS(pickupHaptic)();
        })
        .onUpdate((e) => {
          tx.value = clampToBar(e.x); // и дальше едет за ним
        })
        .onEnd(() => {
          let nearest = 0;
          let best = Infinity;
          for (let i = 0; i < offsets.length; i++) {
            const o = offsets[i] ?? 0;
            const d = Math.abs(tx.value - o);
            if (d < best) {
              best = d;
              nearest = i;
            }
          }
          tx.value = withSpring(offsets[nearest] ?? 0, SNAP);
          drag.value = withSpring(0, PICKUP);
          runOnJS(settleHaptic)();
          runOnJS(commit)(nearest);
        }),
    [offsets, slotW, tx, drag, commit, clampToBar],
  );

  const pillStyle = useAnimatedStyle(() => ({
    width: slotW,
    opacity: 0.12 + drag.value * 0.07,
    transform: [{ translateX: tx.value }, { scale: 1 + drag.value * 0.06 }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}
    >
      <GestureDetector gesture={pan}>
        <View
          collapsable={false}
          style={styles.bar}
          onLayout={(e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width)}
        >
          <LiquidGlass radius={radius.xl} style={StyleSheet.absoluteFill} />

          {slotW > 0 ? (
            <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
          ) : null}

          {entries.map((entry, i) => {
            const active = i === activeIndex;
            return (
              <Pressable
                key={entry.routePath}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => router.navigate(entry.href)}
                style={styles.tab}
              >
                <Icon
                  name={ICON_BY_LABEL[entry.label] ?? 'dot'}
                  size={19}
                  color={active ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                />
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
      </GestureDetector>
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
    position: 'relative',
    flexDirection: 'row',
    gap: TAB_GAP,
    padding: BAR_PAD,
    borderRadius: radius.xl,
    // Фон/тень/скругление-клип даёт <LiquidGlass> (абсолютная заливка).
  },
  tab: {
    flex: 1,
    height: TAB_H,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  // Перетаскиваемая подсветка активной вкладки — поверх ряда, полупрозрачная,
  // так что иконка/подпись под ней остаются читаемыми.
  pill: {
    position: 'absolute',
    left: 0,
    top: BAR_PAD,
    height: TAB_H,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.45)',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
