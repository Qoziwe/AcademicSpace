/**
 * Общий экран шага фильтров (`design-reference.html:362`, `isFilters`).
 * В реестре — 5 honest-роутов (`FILTER_COUNTRY … FILTER_COST`,
 * `CLAUDE.md` §7); визуал общий, `stepIndex` выбирает набор опций из
 * `FILTER_STEPS`.
 *
 * Выбор «в моменте» пишется в `mocks/store.ts.filters`. На последнем шаге —
 * `submitQuestionnaire()` и переход на RESULTS.
 *
 * Экран theme-aware только по фону в прототипе — карточки доведены до
 * 7-токенного паттерна (`CLAUDE.md` §8).
 */

import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { FilterOptionRow } from '@/components/molecules';
import { FilterStepper, HeaderBar } from '@/components/organisms';
import { useSubmitQuestionnaire } from '@/hooks/api/useQuestionnaire';
import { useTheme } from '@/hooks/useTheme';
import { FILTER_STEPS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { bodyFont } from '@/theme';

const STEP_ROUTES: Href[] = [
  '/universities/filters/country',
  '/universities/filters/university',
  '/universities/filters/faculty',
  '/universities/filters/language',
  '/universities/filters/cost',
];

interface Props {
  stepIndex: number;
}

export function FilterStepScreen({ stepIndex }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const filters = useMockStore((s) => s.filters);
  const setFilter = useMockStore((s) => s.setFilter);
  const toggleUniversity = useMockStore((s) => s.toggleUniversity);
  const submit = useSubmitQuestionnaire();

  const def = FILTER_STEPS[stepIndex];
  if (!def) return null;

  const isLast = stepIndex === STEP_ROUTES.length - 1;
  const backHref: Href =
    stepIndex === 0 ? '/universities/questionnaire' : (STEP_ROUTES[stepIndex - 1] as Href);

  const isSelected = (title: string) =>
    def.multi ? filters.universities.includes(title) : filters[def.key] === title;

  const pick = (title: string) => {
    if (def.multi) toggleUniversity(title);
    else setFilter(def.key, title);
  };

  const next = () => {
    if (isLast) {
      submit.mutate(undefined, {
        onSuccess: () => router.replace('/universities/results'),
      });
    } else {
      router.push(STEP_ROUTES[stepIndex + 1] as Href);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title={def.title}
        sub={def.stepLabel}
        onBack={backOr(backHref)}
        below={<FilterStepper total={FILTER_STEPS.length} current={stepIndex} />}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <Text style={[bodyFont('500'), styles.hint, { color: palette.sub }]}>{def.hint}</Text>
        {def.options.map((o) => (
          <FilterOptionRow
            key={o.title}
            title={o.title}
            sub={o.sub}
            badge={'badge' in o ? o.badge : undefined}
            selected={isSelected(o.title)}
            onPress={() => pick(o.title)}
          />
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Button
          label={isLast ? 'Показать результаты' : 'Далее'}
          tone="navy"
          elevated
          loading={submit.isPending}
          onPress={next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, gap: 10 },
  hint: { fontSize: 12, lineHeight: 18.5, paddingHorizontal: 2 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
});
