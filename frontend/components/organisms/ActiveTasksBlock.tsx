/**
 * `<ActiveTasksBlock>` — блок «Активные задачи» на дашборде
 * (`design-reference.html:248`, `showTasks`). Реализует hard-hide из
 * `CLAUDE.md` §6 (паттерн 1): для Free блок физически не рендерится
 * (`usePremiumGate().isPremium` → `null`), места не занимает.
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { TaskModuleCard, type TaskModuleItem } from '@/components/molecules';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont } from '@/theme';

export interface ActiveTask {
  id: string;
  kind: string;
  title: string;
  items: TaskModuleItem[];
}

interface Props {
  tasks: ActiveTask[];
  onToggleItem: (taskId: string, itemId: string) => void;
  onOpenTask: (taskId: string) => void;
  onSeeAll: () => void;
  /** Обойти premium-гейт (Playground). */
  forceVisible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ActiveTasksBlock({
  tasks,
  onToggleItem,
  onOpenTask,
  onSeeAll,
  forceVisible = false,
  style,
}: Props) {
  const { isPremium } = usePremiumGate();
  const { palette } = useTheme();

  if (!isPremium && !forceVisible) return null;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.greenDot} />
          <Text style={[bodyFont('800'), styles.headerTitle, { color: palette.ink }]}>
            Активные задачи
          </Text>
        </View>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={[bodyFont('600'), styles.count]}>{tasks.length} активных</Text>
        </Pressable>
      </View>

      {tasks.map((task) => (
        <TaskModuleCard
          key={task.id}
          variant="compact"
          kind={task.kind}
          title={task.title}
          items={task.items}
          onToggleItem={(itemId) => onToggleItem(task.id, itemId)}
          onOpen={() => onOpenTask(task.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: accent.green,
  },
  headerTitle: {
    fontSize: 13,
  },
  count: {
    fontSize: 11.5,
    color: accent.blue,
  },
});
