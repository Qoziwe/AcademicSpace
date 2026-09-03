import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { TaskModuleCard } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useTasks, useToggleTaskItem } from '@/hooks/api/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * ACTIVE_TASKS (`/tasks`, `design-reference.html:676`). Таб-рут (скрыт для
 * Free — hard-hide в TabBar). Выполненные модули «уходят в журнал»
 * (ACHIEVEMENT_LOG). Открыть модуль → MODULE_DETAIL.
 */
function ActiveTasksScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const tasksQ = useTasks();
  const toggleItem = useToggleTaskItem();

  const tasks = tasksQ.data ?? [];

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Активные задачи"
        sub={`${tasks.length} модуля · выполненные уходят в журнал`}
        onBack={() => router.push('/dashboard')}
      />

      {tasksQ.data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        >
          {tasks.length === 0 ? (
            <View
              style={[styles.empty, { borderColor: palette.border, backgroundColor: palette.card }]}
            >
              <Text style={[bodyFont('700'), styles.emptyTitle, { color: palette.ink }]}>
                Активных модулей нет
              </Text>
              <Text style={[bodyFont('500'), styles.emptyText, { color: palette.sub }]}>
                Всё выполненное переехало в «Журнал» в профиле. Попросите ИИ-ментора собрать новый
                чек-лист или дорожную карту.
              </Text>
              <Button
                label="Открыть чат"
                variant="secondary"
                size="sm"
                onPress={() => router.push('/ai/chat')}
                style={styles.emptyBtn}
              />
            </View>
          ) : (
            tasks.map((t) => (
              <TaskModuleCard
                key={t.id}
                variant="full"
                kind={t.kind}
                title={t.title}
                meta={t.meta}
                xp={t.xp}
                items={t.items.map((it, i) => ({
                  id: `${t.id}:${i}`,
                  label: it.label,
                  done: it.done,
                }))}
                onToggleItem={(itemId) =>
                  toggleItem.mutate({ taskId: t.id, itemIndex: Number(itemId.split(':')[1]) })
                }
                onOpen={() =>
                  router.push({ pathname: '/tasks/[moduleId]', params: { moduleId: t.id } })
                }
              />
            ))
          )}
        </ScrollView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: 26,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: 13.5 },
  emptyText: { fontSize: 12, lineHeight: 18.5, textAlign: 'center' },
  emptyBtn: { marginTop: 6 },
});

export default withGuard(ActiveTasksScreen, { auth: true, premium: true });
