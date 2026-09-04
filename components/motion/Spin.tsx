/**
 * `<Spin>` — бесконечное линейное вращение обёртки (CSS `@keyframes spin`
 * из `design-reference.html:22`: `to{transform:rotate(360deg)}`).
 *
 * Точки применения и длительности берутся 1:1 из прототипа:
 *  - Splash — акцент-кольцо, 5000 мс (`design-reference.html:82`);
 *  - AuthLoading (`<BrandLoading>`) — кольцо, 1100 мс (`:153`);
 *  - ANALYSIS_LOADING — синее 1400 мс + золотое 2100 мс `reverse` (`:531–532`);
 *  - PAYMENT_FLOW (processing) — золотое кольцо, 1000 мс (`:985`).
 *
 * `reverse` = CSS `animation-direction: reverse` (вращение против часовой).
 * При системном «уменьшить движение» — статичная обёртка без анимации.
 */

import { useEffect, type PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  /** Полный оборот, мс. */
  durationMs: number;
  /** Вращать против часовой стрелки (CSS `reverse`). */
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Spin({ durationMs, reverse = false, style, children }: PropsWithChildren<Props>) {
  const deg = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      deg.value = 0;
      return;
    }
    deg.value = withRepeat(
      withTiming(reverse ? -360 : 360, { duration: durationMs, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(deg);
  }, [deg, durationMs, reverse, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${deg.value}deg` }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
