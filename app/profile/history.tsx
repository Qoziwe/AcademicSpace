import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconTile, type IconName } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { HeaderBar } from '@/components/organisms';
import { useAchievementLog } from '@/hooks/api/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import type { LogDotColor } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, radius, spacing } from '@/theme';

/**
 * ACHIEVEMENT_LOG (`/profile/history`, `design-reference.html:880`).
 * Полный архив выполненного, группировка по датам. Назад → PROFILE.
 *
 * Редизайн: сводная плашка (всего XP / заданий / дней активности) сверху,
 * каждый день — одна карточка-группа со строками-разделителями (паттерн
 * `SettingsRow variant="inCard"`) вместо отдельной карточки на запись —
 * плотнее, меньше пустоты, ведущая цветная иконка вместо точки.
 */
const DOT_COLOR: Record<LogDotColor, string> = {
  blue: accent.blue,
  blueLight: accent.blueLight,
  green: accent.green,
  gold: accent.gold,
  rose: accent.rose,
};

const DOT_ICON: Record<LogDotColor, IconName> = {
  blue: 'compass',
  blueLight: 'clock',
  green: 'check-square',
  gold: 'sparkles',
  rose: 'user',
};

function AchievementLogScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const logQ = useAchievementLog();

  const days = logQ.data?.days ?? [];
  const totalEntries = days.reduce((n, d) => n + d.items.length, 0);

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Журнал выполненных заданий"
        sub={logQ.data ? `полный архив · ${logQ.data.totalXp} XP всего` : 'архив'}
        onBack={backOr('/profile')}
      />

      {logQ.data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        >
          <View style={styles.summaryRow}>
            <SummaryStat
              value={String(logQ.data.totalXp)}
              label="XP всего"
              color={accent.green}
              palette={palette}
            />
            <SummaryStat
              value={String(totalEntries)}
              label="заданий"
              color={accent.blue}
              palette={palette}
            />
            <SummaryStat
              value={String(days.length)}
              label={days.length === 1 ? 'день' : 'дней'}
              color={accent.gold}
              palette={palette}
            />
          </View>

          {days.length === 0 ? (
            <View
              style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text style={[bodyFont('700'), styles.emptyTitle, { color: palette.ink }]}>
                Журнал пока пуст
              </Text>
              <Text style={[bodyFont('500'), styles.emptySub, { color: palette.sub }]}>
                Выполняйте задания и модули — здесь появится вся история
              </Text>
            </View>
          ) : (
            days.map((day, di) => {
              const dayXp = day.items.reduce((n, e) => n + e.xp, 0);
              return (
                <SlideUp key={day.date} delayMs={di * 60} style={styles.day}>
                  <View style={styles.dayHead}>
                    <View style={[styles.datePill, { backgroundColor: palette.chip }]}>
                      <Text style={[bodyFont('700'), styles.date, { color: palette.sub }]}>
                        {day.date.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[bodyFont('700'), styles.dayXp]}>+{dayXp} XP</Text>
                  </View>
                  <View
                    style={[
                      styles.dayCard,
                      { backgroundColor: palette.card, borderColor: palette.border },
                    ]}
                  >
                    {day.items.map((e, i) => (
                      <View
                        key={e.title}
                        style={[
                          styles.entry,
                          i < day.items.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: palette.border,
                          },
                        ]}
                      >
                        <IconTile
                          size={38}
                          radius={12}
                          background={`${DOT_COLOR[e.dot]}1E`}
                          color={DOT_COLOR[e.dot]}
                        >
                          <Icon name={DOT_ICON[e.dot]} size={17} color={DOT_COLOR[e.dot]} />
                        </IconTile>
                        <View style={styles.entryText}>
                          <Text
                            numberOfLines={1}
                            style={[bodyFont('700'), styles.entryTitle, { color: palette.ink }]}
                          >
                            {e.title}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[bodyFont('500'), styles.entryKind, { color: palette.sub }]}
                          >
                            {e.kind}
                          </Text>
                        </View>
                        <Text style={[bodyFont('800'), styles.entryXp]}>+{e.xp}</Text>
                      </View>
                    ))}
                  </View>
                </SlideUp>
              );
            })
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

function SummaryStat({
  value,
  label,
  color,
  palette,
}: {
  value: string;
  label: string;
  color: string;
  palette: { card: string; border: string; sub: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[displayFont('600'), styles.statValue, { color }]}>{value}</Text>
      <Text style={[bodyFont('600'), styles.statLabel, { color: palette.sub }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: 9, marginBottom: 20 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
  },
  statValue: { fontSize: 17 },
  statLabel: { fontSize: 10, marginTop: 3 },
  empty: { borderWidth: 1, borderRadius: radius.xl, padding: 22, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 14 },
  emptySub: { fontSize: 12.5, textAlign: 'center' },
  day: { marginBottom: 18 },
  dayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingBottom: 9,
  },
  datePill: { borderRadius: radius.xs, paddingHorizontal: 9, paddingVertical: 4 },
  date: { fontSize: 10.5, letterSpacing: 0.5 },
  dayXp: { fontSize: 11, color: accent.green },
  dayCard: { borderWidth: 1, borderRadius: radius.xl, overflow: 'hidden' },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  entryText: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: 12.5 },
  entryKind: { fontSize: 10.5, marginTop: 2 },
  entryXp: { fontSize: 12, color: accent.green, flexShrink: 0 },
});

export default withGuard(AchievementLogScreen, { auth: true });
