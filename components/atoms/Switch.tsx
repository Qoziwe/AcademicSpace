/**
 * `<Switch>` — тумблер по прототипу (`sw(on)` / `knob(on)` helpers):
 * трек 44×26 r14, knob 20×20, ход 18px, фон `accent.blue` / `#DDE0EC`.
 * Используется для «Тема оформления» (Settings) и тумблеров уведомлений.
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { accent, radius } from '@/theme';

const TRACK_OFF = '#DDE0EC'; // ref: design-reference.html sw()
const TRAVEL = 18;

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Switch({ value, onValueChange, disabled = false, style }: Props) {
  const t = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [value, t]);

  const trackColor = t.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_OFF, accent.blue],
  });
  const knobX = t.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: knobX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: radius.md,
    padding: 3,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
