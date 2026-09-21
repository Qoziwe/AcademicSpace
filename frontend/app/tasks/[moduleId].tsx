import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Checkbox, Icon, ProgressBar } from '@/components/atoms';
import { useTask, useToggleTaskItem } from '@/hooks/api/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { FOCUS_START_LABEL, MODULE_OUTCOME_COPY } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { formatClock, useFocusStore } from '@/stores/focus';
import { accent, bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * MODULE_DETAIL (`/tasks/:moduleId`, `design-reference.html:1005`). Навy-шапка
 * + theme-aware тело. `kind=ТАЙМЕР` показывает таймер (общий `stores/focus`).
 * Назад → ACTIVE_TASKS. «Обсудить» → AI_CHAT.
 */
function ModuleDetailScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const taskQ = useTask(moduleId ?? 'r1');
  const toggleItem = useToggleTaskItem();

  const seconds = useFocusStore((s) => s.seconds);
  const running = useFocusStore((s) => s.running);
  const toggleTimer = useFocusStore((s) => s.toggleRunning);

  const task = taskQ.data;
  const done = task ? task.items.filter((i) => i.done).length : 0;
  const total = task?.items.length ?? 0;
  const complete = total > 0 && done === total;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityLabel="Назад"
          hitSlop={8}
          onPress={backOr('/tasks')}
          style={styles.backChip}
        >
          <Icon name="chevron-left" size={18} color="#FFFFFF" />
        </Pressable>

        {task ? (
          <>
            <Badge label={task.kind} tone="onNavy" style={styles.kindBadge} />
            <Text style={[bodyFont('800'), styles.title]}>{task.title}</Text>
            <Text style={[bodyFont('500'), styles.meta]}>{task.meta}</Text>
            <View style={styles.progressRow}>
              <ProgressBar
                value={total > 0 ? done / total : 0}
                height={6}
                trackColor="rgba(255,255,255,0.16)"
                fillColor="#7C93FF"
                style={styles.bar}
              />
              <Text style={[displayFont('600'), styles.progressText]}>
                {done}/{total}
              </Text>
            </View>
          </>
        ) : taskQ.isLoading ? (
          <ActivityIndicator color="#FFFFFF" style={styles.heroLoading} />
        ) : (
          <Text style={[bodyFont('800'), styles.title]}>Модуль завершён</Text>
        )}
      </View>

      {task ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        >
          {task.isTimer ? (
            <View style={styles.timerCard}>
              <Text style={[bodyFont('700'), styles.timerLabel]}>Таймер модуля</Text>
              <Text style={[displayFont('600'), styles.timerClock]}>{formatClock(seconds)}</Text>
              <Button
                label={running ? 'Пауза' : FOCUS_START_LABEL}
                tone="contrast"
                size="md"
                onPress={toggleTimer}
                style={styles.timerBtn}
              />
            </View>
          ) : null}

          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>Этапы</Text>
            {task.items.map((it, i) => (
              <Pressable
                key={it.label}
                onPress={() => toggleItem.mutate({ taskId: task.id, itemIndex: i })}
                style={[styles.stageRow, { borderBottomColor: palette.border }]}
              >
                <Checkbox
                  checked={it.done}
                  onChange={() => toggleItem.mutate({ taskId: task.id, itemIndex: i })}
                />
                <Text
                  style={[
                    bodyFont('500'),
                    styles.stageLabel,
                    {
                      color: it.done ? palette.sub : palette.ink,
                      textDecorationLine: it.done ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {it.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>
              Что дальше
            </Text>
            <Text style={[bodyFont('500'), styles.outcome, { color: palette.sub }]}>
              {complete ? MODULE_OUTCOME_COPY.complete : MODULE_OUTCOME_COPY.pending}
            </Text>
            <View style={[styles.rewardRow, { borderTopColor: palette.border }]}>
              <Text style={[bodyFont('500'), styles.rewardLabel, { color: palette.sub }]}>
                {MODULE_OUTCOME_COPY.rewardLabel}
              </Text>
              <Text style={[bodyFont('800'), styles.rewardXp]}>+{task.xp} XP</Text>
            </View>
          </View>

          <Button
            label="Обсудить с ИИ-ментором"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/ai/chat')}
          />
        </ScrollView>
      ) : taskQ.isLoading ? (
        <View style={styles.bodyLoading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      ) : (
        <View style={styles.done}>
          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>
              Модуль завершён
            </Text>
            <Text style={[bodyFont('500'), styles.outcome, { color: palette.sub }]}>
              {MODULE_OUTCOME_COPY.complete}
            </Text>
          </View>
          <Button
            label="Открыть журнал"
            tone="navy"
            size="md"
            onPress={() => router.replace('/profile/history')}
          />
          <Button
            label="К активным задачам"
            variant="secondary"
            size="sm"
            onPress={() => router.replace('/tasks')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    backgroundColor: navy.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: 22,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLoading: { marginTop: 24 },
  kindBadge: { marginTop: 16 },
  title: { fontSize: 20, lineHeight: 25, color: '#FFFFFF', letterSpacing: -0.4, marginTop: 11 },
  meta: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 7 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 16 },
  bar: { flex: 1 },
  progressText: { fontSize: 12, color: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  bodyLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  done: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  timerCard: {
    backgroundColor: navy.deep,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  timerClock: { fontSize: 42, color: '#FFFFFF', letterSpacing: -0.6, marginTop: 10 },
  timerBtn: { marginTop: 16, alignSelf: 'stretch' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  cardTitle: { fontSize: 12.5 },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  stageLabel: { flex: 1, fontSize: 13 },
  outcome: { fontSize: 12, lineHeight: 19.2, marginTop: 9 },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
  },
  rewardLabel: { fontSize: 11.5 },
  rewardXp: { fontSize: 12.5, color: accent.green },
});

export default withGuard(ModuleDetailScreen, { auth: true, premium: true });
