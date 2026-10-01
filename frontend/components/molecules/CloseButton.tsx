/**
 * `<CloseButton>` — крестик-дизмисс модальных навy-экранов (PAYWALL /
 * PLAN_SELECTION / PAYMENT_FLOW). Пришёл на замену «ручке»-полоске
 * (`design-reference.html` рисовал её похожей на свайп-хендл нижнего
 * шторки, но свайп-вниз не работает на вебе, а тап по узкой полоске
 * читался как нерабочая декорация) — обычная кликабельная кнопка честнее.
 */

import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/atoms';

interface Props {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CloseButton({ onPress, disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Закрыть"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={[styles.btn, disabled && styles.btnDisabled, style]}
    >
      <Icon name="x" size={16} color={disabled ? 'rgba(255,255,255,0.3)' : '#FFFFFF'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
});
