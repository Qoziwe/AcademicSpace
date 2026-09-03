/**
 * `<SettingsRow>` — строка списка настроек / профиля.
 *  - `variant="inCard"` — строка внутри общей карточки-группы
 *    (`settingsRowStyle`: нижняя граница `palette.border`), экран SETTINGS.
 *  - `variant="card"` — самостоятельная карточка со скруглением
 *    (`profileRowCardStyle`), экран PROFILE.
 *
 * Справа: `rightSlot` (напр. `<Switch>`) → значение-текст → шеврон.
 * `badge` — плашка `PREMIUM` для строк-гейтов (`CLAUDE.md` §6, lock-тизер).
 */

import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { bodyFont, radius, spacing } from '@/theme';

type Variant = 'inCard' | 'card';

interface Props {
  title: string;
  value?: string;
  sub?: string;
  badge?: string;
  onPress?: () => void;
  rightSlot?: ReactNode;
  showChevron?: boolean;
  variant?: Variant;
  /** inCard: не рисовать нижнюю границу (последняя строка группы). */
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SettingsRow({
  title,
  value,
  sub,
  badge,
  onPress,
  rightSlot,
  showChevron,
  variant = 'inCard',
  last = false,
  style,
}: Props) {
  const { palette } = useTheme();
  const chevron = showChevron ?? (onPress != null && value == null && rightSlot == null);

  const containerStyle: StyleProp<ViewStyle> =
    variant === 'card'
      ? {
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: radius.lg,
          paddingVertical: 15,
          paddingHorizontal: spacing.lg,
        }
      : {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.lg,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: palette.border,
        };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        containerStyle,
        onPress && pressed ? styles.pressed : null,
        style,
      ]}
    >
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={[bodyFont('600'), styles.title, { color: palette.ink }]}>{title}</Text>
          {badge ? <Badge label={badge} tone="gold" size="sm" /> : null}
        </View>
        {sub ? (
          <Text style={[bodyFont('500'), styles.sub, { color: palette.sub }]}>{sub}</Text>
        ) : null}
      </View>

      {rightSlot ??
        (value != null ? (
          <Text style={[bodyFont('500'), styles.value, { color: palette.sub }]}>{value}</Text>
        ) : chevron ? (
          <Feather name="chevron-right" size={16} color="#C2C7DC" />
        ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pressed: { opacity: 0.6 },
  textCol: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 13 },
  sub: { fontSize: 11, marginTop: 3 },
  value: { fontSize: 11.5 },
});
