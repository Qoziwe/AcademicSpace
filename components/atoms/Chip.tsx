/**
 * `<Chip>` — выбираемая «таблетка» (`design-reference.html` `chip(on)` helper,
 * экран QUESTIONNAIRE → «Интересы»). Selected: фон `ink`, текст `card`;
 * idle: фон `chip`, текст `sub`. Theme-aware по 7-токенному паттерну.
 */

import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { bodyFont, radius } from '@/theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected = false, onPress, disabled = false, style }: Props) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? palette.ink : palette.chip,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[bodyFont('600'), styles.label, { color: selected ? palette.card : palette.sub }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 11.5,
  },
});
