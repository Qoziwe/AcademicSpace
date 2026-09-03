import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip } from '@/components/atoms';
import { HeaderBar } from '@/components/organisms';
import { useQuestionnaireStatus } from '@/hooks/api/useQuestionnaire';
import { useTheme } from '@/hooks/useTheme';
import { INTERESTS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * QUESTIONNAIRE (`/universities/questionnaire`, `design-reference.html:321`).
 * Шаг 1 из 6 мастера подбора. Назад → DASHBOARD. Далее → FILTER_COUNTRY.
 */
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
      />

      {statusQ.data ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        >
          {statusQ.data.groups.map((group) => (
            <View
              key={group.title}
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
                {group.title}
              </Text>
              <View style={styles.rows}>
                {group.fields.map((f) => (
                  <View key={f.label} style={[styles.fieldRow, { backgroundColor: palette.chip }]}>
                    <Text style={[bodyFont('500'), styles.fieldLabel, { color: palette.sub }]}>
                      {f.label}
                    </Text>
                    <Text style={[bodyFont('700'), styles.fieldValue, { color: palette.ink }]}>
                      {f.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
              Интересы
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
        </ScrollView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}

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
  groupTitle: { fontSize: 12.5 },
  rows: { gap: 9, marginTop: 12 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  fieldLabel: { fontSize: 12 },
  fieldValue: { fontSize: 12.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
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
