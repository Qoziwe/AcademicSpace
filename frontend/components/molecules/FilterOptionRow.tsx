/**
 * `<FilterOptionRow>` — строка выбора на шагах FILTER_* (`row(on)` +
 * `mark(on)` helpers, `design-reference.html:377`). Отметка 22×22 r8:
 * выбрано — заливка `accent.blue` + белая галочка, иначе белый квадрат
 * с обводкой `#D3D7E6`. Справа — необязательная плашка-бейдж (напр. «14 вузов»).
 *
 * Экраны фильтров в дизайне theme-aware только по внешнему фону — здесь
 * доводим карточку до 7-токенного паттерна (`CLAUDE.md` §8).
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CheckIcon } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius, spacing } from '@/theme';

const MARK_BORDER_IDLE = '#D3D7E6'; // ref: design-reference.html mark()

interface Props {
  title: string;
  sub?: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FilterOptionRow({ title, sub, badge, selected, onPress, style }: Props) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: palette.card,
          borderColor: selected ? accent.blue : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.mark,
            {
              backgroundColor: selected ? accent.blue : palette.card,
              borderColor: selected ? accent.blue : MARK_BORDER_IDLE,
            },
          ]}
        >
          {selected ? <CheckIcon size={11} /> : null}
        </View>
        <View style={styles.textCol}>
          <Text numberOfLines={1} style={[bodyFont('700'), styles.title, { color: palette.ink }]}>
            {title}
          </Text>
          {sub ? (
            <Text style={[bodyFont('500'), styles.sub, { color: palette.sub }]}>{sub}</Text>
          ) : null}
        </View>
      </View>

      {badge ? (
        <View style={styles.badge}>
          <Text style={[bodyFont('700'), styles.badgeText]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 13.5 },
  sub: { fontSize: 11, marginTop: 2 },
  badge: {
    backgroundColor: 'rgba(46,107,255,0.10)',
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeText: { fontSize: 10.5, color: accent.blue },
});
