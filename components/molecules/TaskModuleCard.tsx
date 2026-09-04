/**
 * `<TaskModuleCard>` — карточка интерактивного модуля (дорожная карта /
 * чек-лист / таймер).
 *  - `variant="compact"` — блок «Активные задачи» на дашборде
 *    (`taskCardWrapStyle`, `design-reference.html:258`);
 *  - `variant="full"` — экран ACTIVE_TASKS (`:686`) с мета-строкой, XP и
 *    статусом.
 *
 * Пункты переключаются на месте (`onToggleItem`) — как `toggleItem` в
 * прототипе. Экраны theme-aware только по фону — карточку доводим до
 * 7-токенного паттерна (`CLAUDE.md` §8). Появление — `<SlideUp>` .3s
 * (`taskCardWrapStyle`, `animation:up`).
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Checkbox, ProgressBar } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius, spacing } from '@/theme';

export interface TaskModuleItem {
  id: string;
  label: string;
  done: boolean;
}

interface Props {
  kind: string;
  title: string;
  items: TaskModuleItem[];
  onToggleItem: (id: string) => void;
  onOpen: () => void;
  variant?: 'compact' | 'full';
  meta?: string;
  xp?: number;
  style?: StyleProp<ViewStyle>;
}

export function TaskModuleCard({
  kind,
  title,
  items,
  onToggleItem,
  onOpen,
  variant = 'compact',
  meta,
  xp,
  style,
}: Props) {
  const { palette } = useTheme();

  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const ratio = total > 0 ? done / total : 0;
  const complete = total > 0 && done === total;

  const isRoadmap = kind === 'КАРТА';
  const chipColor = isRoadmap ? accent.blue : accent.green;
  const chipBg = isRoadmap ? 'rgba(46,107,255,0.10)' : 'rgba(31,181,116,0.12)';
  const full = variant === 'full';

  return (
    <SlideUp
      style={[
        styles.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderRadius: full ? radius.xl : radius.lg,
          padding: full ? spacing.lg : 15,
        },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.kind, { backgroundColor: chipBg }]}>
            <Text style={[bodyFont('800'), styles.kindText, { color: chipColor }]}>{kind}</Text>
          </View>
          <Text
            numberOfLines={1}
            style={[
              bodyFont(full ? '800' : '700'),
              styles.title,
              { color: palette.ink, fontSize: full ? 14 : 13.5 },
            ]}
          >
            {title}
          </Text>
        </View>
        {full ? (
          <Text style={[bodyFont('700'), styles.progressText, { color: palette.sub }]}>
            {done}/{total}
          </Text>
        ) : (
          <Pressable onPress={onOpen} hitSlop={8}>
            <Text style={[bodyFont('600'), styles.openLink, { color: palette.sub }]}>открыть</Text>
          </Pressable>
        )}
      </View>

      {full && meta ? (
        <Text style={[bodyFont('500'), styles.meta, { color: palette.sub }]}>{meta}</Text>
      ) : null}

      <View style={[styles.items, full && { marginTop: spacing.sm }]}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onToggleItem(item.id)}
            style={[
              styles.itemRow,
              full && {
                borderBottomWidth: 1,
                borderBottomColor: palette.border,
                paddingVertical: 9,
              },
            ]}
          >
            <Checkbox checked={item.done} onChange={() => onToggleItem(item.id)} />
            <Text
              style={[
                bodyFont('500'),
                styles.itemLabel,
                {
                  color: item.done ? palette.sub : palette.ink,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                  fontSize: full ? 13 : 12.5,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {full ? (
        <View style={styles.footerRow}>
          <Text style={[bodyFont('500'), styles.footerXp, { color: palette.sub }]}>
            {xp != null ? `Завершение принесёт ${xp} XP` : ''}
          </Text>
          <Pressable onPress={onOpen} hitSlop={8}>
            <Text style={[bodyFont('700'), styles.footerOpen]}>
              {complete ? 'готово → в журнал' : 'в работе'} · открыть ›
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.progressRow}>
          <ProgressBar value={ratio} height={4} trackColor={palette.chip} style={styles.bar} />
          <Text style={[bodyFont('700'), styles.progressText, { color: palette.sub }]}>
            {done}/{total}
          </Text>
        </View>
      )}
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  kind: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexShrink: 0,
  },
  kindText: {
    fontSize: 8.5,
    letterSpacing: 0.5,
  },
  title: { flex: 1, minWidth: 0 },
  progressText: { fontSize: 10.5, flexShrink: 0 },
  openLink: { fontSize: 11 },
  meta: { fontSize: 11.5, marginTop: 7 },
  items: { marginTop: spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 7,
  },
  itemLabel: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: spacing.sm,
  },
  bar: { flex: 1 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  footerXp: { fontSize: 10.5, flex: 1 },
  footerOpen: { fontSize: 11, color: accent.blue, flexShrink: 0 },
});
