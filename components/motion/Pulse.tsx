/**
 * `<Pulse>` — бесконечная «дышащая» пульсация (CSS `@keyframes pulse` из
 * `design-reference.html:21`:
 * `0%,100%{opacity:.35;transform:scale(.9)} 50%{opacity:1;transform:scale(1.05)}`).
 *
 * Точки применения (`design-reference.html`):
 *  - AuthLoading / ANALYSIS_LOADING — центральный ромб, 1600 мс (`:154`);
 *  - FocusSoundTile — активные бары эквалайзера, `700 + i*130` мс (`:1511`).
 *
 * `durationMs` — полный цикл (как в CSS); внутри делится пополам на прямой
 * и обратный проход. При «уменьшить движение» рендерится в конечном
 * (видимом) состоянии без анимации.
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
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  /** Полный цикл пульсации, мс. */
  durationMs: number;
  style?: StyleProp<ViewStyle>;
}

export function Pulse({ durationMs, style, children }: PropsWithChildren<Props>) {
  const p = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      p.value = 1;
      return;
    }
    p.value = 0;
    p.value = withRepeat(
      withTiming(1, { duration: durationMs / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(p);
  }, [p, durationMs, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 1], [0.35, 1]),
    transform: [{ scale: interpolate(p.value, [0, 1], [0.9, 1.05]) }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
