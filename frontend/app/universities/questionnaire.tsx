import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Icon, IconTile } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { FilterStepper, HeaderBar } from '@/components/organisms';
import { useQuestionnaireStatus } from '@/hooks/api/useQuestionnaire';
import { useTheme } from '@/hooks/useTheme';
import { INTERESTS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * QUESTIONNAIRE (`/universities/questionnaire`, `design-reference.html:321`).
 * Шаг 1 из 6 мастера подбора (тот же `<FilterStepper>`, что и на 5 шагах
 * фильтров — визуально одна лента прогресса). Назад → DASHBOARD.
 * Далее → FILTER_COUNTRY.
 */
const GROUP_ICON: Record<string, 'check-square' | 'compass'> = {
  'Академические результаты': 'check-square',
  'Предпочтения по вузам': 'compass',
};

function QuestionnaireScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const statusQ = useQuestionnaireStatus();
  const interests = useMockStore((s) => s.interests);
  const toggleInterest = useMockStore((s) => s.toggleInterest);

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Базовая анкета"
        sub="шаг 1 из 6 · академические данные"
        onBack={backOr('/dashboard')}
        below={<FilterStepper total={6} current={0} />}
      />

      {statusQ.data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        >
          {statusQ.data.groups.map((group, gi) => (
            <SlideUp key={group.title} delayMs={gi * 60}>
              <View
                style={[
                  styles.card,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <View style={styles.groupHead}>
                  <IconTile size={34} radius={11} tone="blueSoft">
                    <Icon
                      name={GROUP_ICON[group.title] ?? 'check-square'}
                      size={16}
                      color={accent.blue}
                      strokeWidth={1.7}
                    />
                  </IconTile>
                  <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
                    {group.title}
                  </Text>
                </View>
                <View style={styles.rows}>
                  {group.fields.map((f) => (
                    <View
                      key={f.label}
                      style={[styles.fieldRow, { backgroundColor: palette.chip }]}
                    >
                      <Text style={[bodyFont('500'), styles.fieldLabel, { color: palette.sub }]}>
                        {f.label}
                      </Text>
                      <Text style={[bodyFont('800'), styles.fieldValue, { color: accent.blue }]}>
                        {f.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </SlideUp>
          ))}

          <SlideUp delayMs={statusQ.data.groups.length * 60}>
            <View
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={styles.groupHead}>
                <IconTile size={34} radius={11} tone="blueSoft" background="rgba(243,194,75,0.16)">
                  <Icon name="sparkles" size={16} color={accent.gold} strokeWidth={1.7} />
                </IconTile>
                <View style={styles.interestsHeadText}>
                  <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
                    Интересы
                  </Text>
                </View>
                <View style={[styles.countPill, { backgroundColor: palette.chip }]}>
                  <Text style={[bodyFont('700'), styles.countPillText, { color: palette.sub }]}>
                    {interests.length}
                  </Text>
                </View>
              </View>
              <Text style={[bodyFont('500'), styles.interestsHint, { color: palette.sub }]}>
                Выберите направления, которые вам интересны — это влияет на подбор программ
              </Text>
              <View style={styles.chips}>
                {INTERESTS.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    selected={interests.includes(label)}
                    onPress={() => toggleInterest(label)}
                  />
                ))}
              </View>
            </View>
          </SlideUp>
        </ScrollView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}

      <View pointerEvents="none" style={[styles.fadeWrap, { bottom: 90 + insets.bottom }]}>
        <LinearGradient colors={[`${palette.screen}00`, palette.screen]} style={styles.fade} />
      </View>
      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Button
          label="Далее: настроить фильтры"
          tone="navy"
          elevated
          iconRight={<Icon name="arrow-right" size={15} color="#FFFFFF" />}
          onPress={() => router.push('/universities/filters/country')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, gap: spacing.md },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  interestsHeadText: { flex: 1, minWidth: 0 },
  groupTitle: { fontSize: 13.5 },
  countPill: { borderRadius: radius.xs, paddingHorizontal: 9, paddingVertical: 4 },
  countPillText: { fontSize: 11.5 },
  interestsHint: { fontSize: 11.5, lineHeight: 16, marginTop: 10 },
  rows: { gap: 9, marginTop: 14 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  fieldLabel: { fontSize: 12 },
  fieldValue: { fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  fadeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 28,
  },
  fade: { flex: 1 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
});

export default withGuard(QuestionnaireScreen, { auth: true });
