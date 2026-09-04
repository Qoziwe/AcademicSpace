/**
 * `<SlideUp>` — разовое появление снизу вверх при монтировании (CSS
 * `@keyframes up` из `design-reference.html:20`:
 * `from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1}`,
 * `.3s ease both`).
 *
 * Точки применения (`design-reference.html`):
 *  - ChatThread → `<ModuleConfirmationCard>` (`:640`);
 *  - `<TaskModuleCard>` — `taskCardWrapStyle` (`:1328`);
 *  - OfflineBanner — появление баннера (`:1075`).
 *
 * `both` = начинается уже в состоянии `from` (без вспышки контента).
 * При «уменьшить движение» — сразу в конечном состоянии.
 */

import { useEffect, type PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  /** Длительность появления, мс. */
  durationMs?: number;
  /** Смещение старта, мс. */
  delayMs?: number;
  /** Дистанция подъёма, px. */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export function SlideUp({
  durationMs = 300,
  delayMs = 0,
  distance = 14,
  style,
  children,
}: PropsWithChildren<Props>) {
  const reducedMotion = useReducedMotion();
  const t = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      t.value = 1;
      return;
    }
    t.value = withDelay(
      delayMs,
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.ease) }),
    );
  }, [t, durationMs, delayMs, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * distance }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
