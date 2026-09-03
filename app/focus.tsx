import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { FocusSoundTile } from '@/components/molecules';
import { FOCUS_SOUNDS, FOCUS_TRACKERS } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { formatClock, useFocusStore } from '@/stores/focus';
import { bodyFont, displayFont, navy, radius, spacing } from '@/theme';

/**
 * FOCUS_TOOLS (`/focus`, `design-reference.html:776`). Premium-only.
 * Сознательно вне темы — фиксированный навy `navy.deep`. Таймер и звук —
 * общий `stores/focus`. Назад → PROFILE.
 */
function FocusToolsScreen() {
  const insets = useSafeAreaInsets();
  const seconds = useFocusStore((s) => s.seconds);
  const running = useFocusStore((s) => s.running);
  const activeSound = useFocusStore((s) => s.activeSound);
  const toggleRunning = useFocusStore((s) => s.toggleRunning);
  const reset = useFocusStore((s) => s.reset);
  const setSound = useFocusStore((s) => s.setSound);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityLabel="Назад"
          hitSlop={8}
          onPress={backOr('/profile')}
          style={styles.backChip}
        >
          <Feather name="chevron-left" size={16} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={[bodyFont('800'), styles.headerTitle]}>Фокус и продуктивность</Text>
          <Text style={[bodyFont('500'), styles.headerSub]}>фоновые звуки и трекеры привычек</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <View style={styles.sessionCard}>
          <Text style={[bodyFont('600'), styles.sessionLabel]}>Сессия фокуса</Text>
          <Text style={[displayFont('600'), styles.clock]}>{formatClock(seconds)}</Text>
          <View style={styles.sessionBtns}>
            <Button
              label={running ? 'Пауза' : 'Начать 25 минут'}
              tone="contrast"
              size="md"
              onPress={toggleRunning}
              style={styles.sessionBtn}
            />
            <Pressable accessibilityLabel="Сбросить" onPress={reset} style={styles.resetBtn}>
              <Feather name="square" size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
        </View>

        <Text style={[bodyFont('800'), styles.sectionTitle]}>Фоновые звуки</Text>
        <View style={styles.soundsGrid}>
          {FOCUS_SOUNDS.map((s, i) => (
            <View key={s.name} style={styles.soundCell}>
              <FocusSoundTile
                name={s.name}
                sub={s.sub}
                active={activeSound === i}
                onPress={() => setSound(activeSound === i ? null : i)}
              />
            </View>
          ))}
        </View>

        <Text style={[bodyFont('800'), styles.sectionTitle]}>Трекеры недели</Text>
        {FOCUS_TRACKERS.map((t) => (
          <View key={t.name} style={styles.trackerCard}>
            <View style={styles.trackerHead}>
              <Text style={[bodyFont('700'), styles.trackerName]}>{t.name}</Text>
              <Text style={[bodyFont('500'), styles.trackerValue]}>{t.value}</Text>
            </View>
            <View style={styles.trackerDays}>
              {Array.from({ length: 7 }, (_, d) => (
                <View
                  key={d}
                  style={[
                    styles.trackerDay,
                    { backgroundColor: d < t.days ? '#7C93FF' : 'rgba(255,255,255,0.1)' },
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: 10,
  },
  backChip: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15.5, color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  content: { paddingHorizontal: 18, paddingTop: 14, gap: 16 },
  sessionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  clock: { fontSize: 44, color: '#FFFFFF', letterSpacing: -0.6, marginTop: 10 },
  sessionBtns: { flexDirection: 'row', gap: 9, marginTop: 16, alignSelf: 'stretch' },
  sessionBtn: { flex: 1 },
  resetBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', paddingHorizontal: 2 },
  soundsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  soundCell: { width: '48%', flexGrow: 1 },
  trackerCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  trackerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trackerName: { fontSize: 12.5, color: '#FFFFFF' },
  trackerValue: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  trackerDays: { flexDirection: 'row', gap: 5, marginTop: 11 },
  trackerDay: { flex: 1, height: 22, borderRadius: 7 },
});

export default withGuard(FocusToolsScreen, { auth: true, premium: true });
