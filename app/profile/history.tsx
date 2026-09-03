import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBar } from '@/components/organisms';
import { useAchievementLog } from '@/hooks/api/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import type { LogDotColor } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * ACHIEVEMENT_LOG (`/profile/history`, `design-reference.html:880`).
 * Полный архив выполненного, группировка по датам. Назад → PROFILE.
 */
const DOT_COLOR: Record<LogDotColor, string> = {
  blue: accent.blue,
  blueLight: accent.blueLight,
  green: accent.green,
  gold: accent.gold,
  rose: accent.rose,
};

function AchievementLogScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const logQ = useAchievementLog();

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
          {logQ.data.days.map((day) => (
            <View key={day.date} style={styles.day}>
              <Text style={[bodyFont('700'), styles.date, { color: palette.sub }]}>
                {day.date.toUpperCase()}
              </Text>
              <View style={styles.entries}>
                {day.items.map((e) => (
                  <View
                    key={e.title}
                    style={[
                      styles.entry,
                      { backgroundColor: palette.card, borderColor: palette.border },
                    ]}
                  >
                    <View style={[styles.dot, { backgroundColor: DOT_COLOR[e.dot] }]} />
                    <View style={styles.entryText}>
                      <Text style={[bodyFont('700'), styles.entryTitle, { color: palette.ink }]}>
                        {e.title}
                      </Text>
                      <Text style={[bodyFont('500'), styles.entryKind, { color: palette.sub }]}>
                        {e.kind}
                      </Text>
                    </View>
                    <Text style={[bodyFont('800'), styles.entryXp]}>+{e.xp} XP</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
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
  content: { paddingHorizontal: 18, paddingTop: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  day: { marginBottom: 18 },
  date: {
    fontSize: 11,
    letterSpacing: 0.55,
    paddingHorizontal: 2,
    paddingBottom: 9,
  },
  entries: { gap: 8 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  dot: { width: 9, height: 9, borderRadius: 3, flexShrink: 0 },
  entryText: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: 12.5 },
  entryKind: { fontSize: 10.5, marginTop: 2 },
  entryXp: { fontSize: 11, color: accent.green, flexShrink: 0 },
});

export default withGuard(AchievementLogScreen, { auth: true });
