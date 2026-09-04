/**
 * `<Blink>` — бесконечное мигание прозрачностью (CSS `@keyframes blink` из
 * `design-reference.html:23`: `0%,100%{opacity:.25}50%{opacity:1}`).
 *
 * Точки применения (`design-reference.html`):
 *  - ChatThread — три точки индикатора набора, 1000 мс, задержки 0/200/400 (`:653–655`);
 *  - OfflineBanner — точка статуса, 1400 мс (`:1076`);
 *  - ANALYSIS_LOADING — точка активного шага, 1200 мс (`:1448`).
 *
 * `durationMs` — полный цикл; `delayMs` — старт со сдвигом (для «волны»
 * из нескольких точек). При «уменьшить движение» — статично на opacity 1.
 */

import { useEffect, type PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  /** Полный цикл мигания, мс. */
  durationMs: number;
  /** Задержка старта, мс. */
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
}

export function Blink({ durationMs, delayMs = 0, style, children }: PropsWithChildren<Props>) {
  const v = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      v.value = 1;
      return;
    }
    v.value = 0;
    v.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1, { duration: durationMs / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(v);
  }, [v, durationMs, delayMs, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 1], [0.25, 1]),
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
