/**
 * `<DocumentCell>` — строка-слот документа (`row(on)` + `IconTile`,
 * `design-reference.html:500` слоты портфолио, `:757` ячейки копилки).
 * Заполнено — иконка/акцент активны, справа «загружено»/«заменить»;
 * пусто — приглушено, справа «добавить»/«загрузить».
 *
 * `onPress` = мок file-picker (реальный `expo-document-picker` — Фаза 3/9).
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, IconTile } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius, spacing } from '@/theme';

interface Props {
  title: string;
  sub: string;
  filled: boolean;
  onPress: () => void;
  actionFilledLabel?: string;
  actionEmptyLabel?: string;
  emptySub?: string;
  style?: StyleProp<ViewStyle>;
}

export function DocumentCell({
  title,
  sub,
  filled,
  onPress,
  actionFilledLabel = 'заменить',
  actionEmptyLabel = 'загрузить',
  emptySub = 'ячейка пустая',
  style,
}: Props) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: palette.card,
          borderColor: filled ? accent.blue : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.left}>
        <IconTile size={36} radius={12} tone={filled ? 'blueSoft' : 'muted'}>
          <Icon name="file" size={17} color={filled ? accent.blue : '#A7ABC4'} />
        </IconTile>
        <View style={styles.textCol}>
          <Text numberOfLines={1} style={[bodyFont('700'), styles.title, { color: palette.ink }]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={[bodyFont('500'), styles.sub, { color: palette.sub }]}>
            {filled ? sub : emptySub}
          </Text>
        </View>
      </View>

      <Text style={[bodyFont('700'), styles.action, { color: filled ? palette.sub : accent.blue }]}>
        {filled ? actionFilledLabel : actionEmptyLabel}
      </Text>
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
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 13.5 },
  sub: { fontSize: 11, marginTop: 2 },
  action: { fontSize: 11, flexShrink: 0 },
});
