/**
 * `<Divider>` — тонкая разделительная линия (`design-reference.html`:
 * `height:1px;background:#EEEFF5` в сайдбаре, `border-top:1px solid #F0F1F7`
 * в карточках). Цвет по умолчанию — `palette.border` активной темы.
 */

import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface Props {
  /** Отступ сверху и снизу (marginVertical). */
  spacing?: number;
  /** Переопределить цвет (для навy-контекста и т.п.). */
  color?: string;
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export function Divider({ spacing = 0, color, orientation = 'horizontal', style }: Props) {
  const { palette } = useTheme();
  const line = color ?? palette.border;

  return (
    <View
      style={[
        orientation === 'horizontal'
          ? { height: 1, alignSelf: 'stretch', marginVertical: spacing }
          : { width: 1, alignSelf: 'stretch', marginHorizontal: spacing },
        { backgroundColor: line },
        style,
      ]}
    />
  );
}
