import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Icon, IconTile, Select, TextField } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { FilterStepper, HeaderBar } from '@/components/organisms';
import { useQuestionnaireStatus } from '@/hooks/api/useQuestionnaire';
import { useTheme } from '@/hooks/useTheme';
import { EXAM_SUBJECT_OPTIONS, INTERESTS, LANGUAGE_TEST_OPTIONS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * QUESTIONNAIRE (`/universities/questionnaire`, `design-reference.html:321`).
 * Шаг 1 из 6 мастера подбора (тот же `<FilterStepper>`, что и на 5 шагах
 * фильтров — визуально одна лента прогресса). Назад → DASHBOARD.
 * Далее → FILTER_COUNTRY.
 *
 * Реальный ввод академических данных — вход алгоритма подбора
 * (`backend/app/services/matching`), не статичная витрина демо-цифр:
 * черновик живёт в `mocks/store.ts.academics` (переживает переходы между
 * шагами 1–6), на последнем шаге фильтров уходит в `POST /questionnaire`
 * вместе с `interests`/`preferences` (`FilterStepScreen`).
 */
function QuestionnaireScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const statusQ = useQuestionnaireStatus();
  const academics = useMockStore((s) => s.academics);
  const setAcademicsField = useMockStore((s) => s.setAcademicsField);
  const interests = useMockStore((s) => s.interests);
  const toggleInterest = useMockStore((s) => s.toggleInterest);

  // Подхватываем ранее сохранённые на бэкенде ответы (повторный визит на
  // этот экран — "редактировать анкету"), но не затираем уже начатый в
  // этой сессии черновик: только недостающие поля.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !statusQ.data?.academics) return;
    hydrated.current = true;
    const saved = statusQ.data.academics;
    if (academics.gpaPercent == null && saved.gpaPercent != null) {
      setAcademicsField('gpaPercent', saved.gpaPercent);
    }
    if (!academics.examSubject && saved.examSubject) {
      setAcademicsField('examSubject', saved.examSubject);
    }
    if (academics.examScore == null && saved.examScore != null) {
      setAcademicsField('examScore', saved.examScore);
    }
    if (!academics.languageTest && saved.languageTest) {
      setAcademicsField('languageTest', saved.languageTest);
    }
    if (academics.languageScore == null && saved.languageScore != null) {
      setAcademicsField('languageScore', saved.languageScore);
    }
    if (!academics.achievementsCount && saved.achievementsCount) {
      setAcademicsField('achievementsCount', saved.achievementsCount);
    }
    // Намеренно только [statusQ.data] — `hydrated` гарантирует одноразовое
    // применение, остальные зависимости переисполняли бы эффект на каждое
    // изменение поля пользователем.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusQ.data]);

  const languageDisabled = academics.languageTest === 'Не сдавал' || academics.languageTest === '';
  const canProceed =
    academics.gpaPercent != null &&
    academics.examSubject !== '' &&
    academics.examScore != null &&
    academics.languageTest !== '' &&
    (academics.languageTest === 'Не сдавал' || academics.languageScore != null);

  const parseNumber = (text: string): number | null => {
    const normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
    if (normalized === '') return null;
    const value = Number(normalized);
    return Number.isNaN(value) ? null : value;
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Базовая анкета"
        sub="шаг 1 из 6 · академические данные"
        onBack={backOr('/dashboard')}
        below={<FilterStepper total={6} current={0} />}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
        <SlideUp>
          <View
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={styles.groupHead}>
              <IconTile size={34} radius={11} tone="blueSoft">
                <Icon name="check-square" size={16} color={accent.blue} strokeWidth={1.7} />
              </IconTile>
              <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
                Академические результаты
              </Text>
            </View>
            <Text style={[bodyFont('500'), styles.groupHint, { color: palette.sub }]}>
              Эти данные сравниваются с требованиями вузов — чем точнее, тем честнее подбор.
            </Text>

            <View style={styles.fields}>
              <TextField
                label="Средний балл аттестата, % от максимума"
                value={academics.gpaPercent != null ? String(academics.gpaPercent) : ''}
                onChangeText={(text) => setAcademicsField('gpaPercent', parseNumber(text))}
                placeholder="Например, 85"
                keyboardType="decimal-pad"
              />
              <Select
                label="Профильный экзамен"
                value={academics.examSubject}
                options={EXAM_SUBJECT_OPTIONS}
                onChange={(value) => setAcademicsField('examSubject', value)}
              />
              <TextField
                label="Балл профильного экзамена, из 100"
                value={academics.examScore != null ? String(academics.examScore) : ''}
                onChangeText={(text) => setAcademicsField('examScore', parseNumber(text))}
                placeholder="Например, 78"
                keyboardType="decimal-pad"
              />
              <Select
                label="Языковой сертификат"
                value={academics.languageTest}
                options={LANGUAGE_TEST_OPTIONS}
                onChange={(value) => {
                  setAcademicsField('languageTest', value);
                  if (value === 'Не сдавал') setAcademicsField('languageScore', null);
                }}
              />
              {languageDisabled ? null : (
                <TextField
                  label={`Балл (${academics.languageTest})`}
                  value={academics.languageScore != null ? String(academics.languageScore) : ''}
                  onChangeText={(text) => setAcademicsField('languageScore', parseNumber(text))}
                  placeholder={academics.languageTest === 'IELTS' ? 'Например, 6.5' : 'Балл'}
                  keyboardType="decimal-pad"
                />
              )}
              <TextField
                label="Олимпиады, гранты, публикации — сколько"
                value={String(academics.achievementsCount)}
                onChangeText={(text) =>
                  setAcademicsField(
                    'achievementsCount',
                    Math.max(0, Math.round(parseNumber(text) ?? 0)),
                  )
                }
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>
          </View>
        </SlideUp>

        <SlideUp delayMs={60}>
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
          disabled={!canProceed}
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
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  interestsHeadText: { flex: 1, minWidth: 0 },
  groupTitle: { fontSize: 13.5 },
  groupHint: { fontSize: 11.5, lineHeight: 16, marginTop: 10 },
  countPill: { borderRadius: radius.xs, paddingHorizontal: 9, paddingVertical: 4 },
  countPillText: { fontSize: 11.5 },
  interestsHint: { fontSize: 11.5, lineHeight: 16, marginTop: 10 },
  fields: { gap: 10, marginTop: 14 },
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
