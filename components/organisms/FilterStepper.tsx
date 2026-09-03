/**
 * `<FilterStepper>` — индикатор прогресса мастера фильтров
 * (`design-reference.html:371`, `filterDots`): ряд сегментов-полосок
 * `flex:1;height:4px`, пройденные — `navy.primary`, остальные — `#E3E5EF`.
 */

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { navy } from '@/theme';

const INACTIVE = '#E3E5EF'; // ref: design-reference.html filterDots

interface Props {
  total: number;
  /** 0-based индекс текущего шага (включительно закрашивается). */
  current: number;
  activeColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function FilterStepper({ total, current, activeColor = navy.primary, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: Math.max(0, total) }, (_, i) => (
        <View
          key={i}
          style={[styles.seg, { backgroundColor: i <= current ? activeColor : INACTIVE }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
