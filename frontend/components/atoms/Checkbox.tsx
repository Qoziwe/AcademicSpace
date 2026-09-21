/**
 * `<Checkbox>` — box-паттерн из прототипа (`box(done)` helper): 20×20 r7,
 * checked — фон/обводка `accent.green`, белая галочка; idle — белый фон,
 * обводка `#D3D7E6`. Пункты чек-листов задач, ячейки анкеты, этапы модуля.
 */

import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CheckIcon } from '@/components/atoms/CheckIcon';
import { accent } from '@/theme';

const BORDER_IDLE = '#D3D7E6'; // ref: design-reference.html box()

interface Props {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({ checked, onChange, size = 20, disabled = false, style }: Props) {
  const body = (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.35),
          backgroundColor: checked ? accent.green : '#FFFFFF',
          borderColor: checked ? accent.green : BORDER_IDLE,
        },
        style,
      ]}
    >
      {checked ? <CheckIcon size={size * 0.5} /> : null}
    </View>
  );

  if (!onChange) return body;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onChange(!checked)}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.6,
  },
});
