import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, TileIcon } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { HeaderBar, ResultsGroupedList } from '@/components/organisms';
import { useUniversitySearch } from '@/hooks/api/useUniversitySearch';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius } from '@/theme';

/**
 * RESULTS (`/universities/results`, `design-reference.html:397`). Открывается
 * как таб «Вузы». Назад → DASHBOARD. «Сменить страну» → FILTER_COUNTRY.
 *
 * Подбор — статичные записи (`UniversityMatch`), не живой алгоритм — у
 * свежего аккаунта их всегда 0. Раньше это рисовало три пустых заголовка
 * групп («· 0») и голую навy-пустоту без единой подсказки — добавлен
 * настоящий empty-state (тот же паттерн, что уже в `flashcards/index.tsx`)
 * с переходом на анкету.
 */
function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const searchQ = useUniversitySearch();
  const data = searchQ.data;
  const isEmpty = data != null && data.matchesCount === 0;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Мои университеты"
        sub={
          data
            ? `${data.country} · ${data.matchesCount} совпадений · рейтинг ${data.rating}`
            : 'подбор…'
        }
        onBack={backOr('/dashboard')}
        rightSlot={
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/universities/filters/country')}
          >
            <Text style={[bodyFont('700'), styles.change]}>Сменить{'\n'}страну</Text>
          </Pressable>
        }
      />

      {data ? (
        isEmpty ? (
          <ScrollView
            contentContainerStyle={[styles.emptyContent, { paddingBottom: insets.bottom + 40 }]}
          >
            <SlideUp style={styles.emptyWrap}>
              <View style={styles.emptyIconOuter}>
                <View style={styles.emptyIcon}>
                  <TileIcon name="universities" />
                </View>
              </View>
              <Text style={[bodyFont('800'), styles.emptyTitle, { color: palette.ink }]}>
                Пока нет подбора
              </Text>
              <Text style={[bodyFont('500'), styles.emptySub, { color: palette.sub }]}>
                Заполните анкету об успеваемости и предпочтениях — алгоритм подберёт вузы по
                категориям Safety / Match / Reach
              </Text>
              <Button
                label="Заполнить анкету"
                tone="navy"
                onPress={() => router.push('/universities/questionnaire')}
                style={styles.emptyBtn}
              />
            </SlideUp>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          >
            <ResultsGroupedList
              groups={data.groups.map((g) => ({
                key: g.category,
                title: g.title,
                sub: g.sub,
                category: g.category,
                items: g.items,
              }))}
              onOpenUniversity={(id) =>
                router.push({ pathname: '/universities/[id]', params: { id } })
              }
            />
          </ScrollView>
        )
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
  content: { paddingHorizontal: 18, paddingTop: 14 },
  emptyContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  change: { fontSize: 11, color: accent.blue, textAlign: 'right' },
  emptyWrap: { alignItems: 'center', gap: 8, paddingHorizontal: 8 },
  emptyIconOuter: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: '#E8ECFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.lg, overflow: 'hidden' },
  emptyTitle: { fontSize: 16, textAlign: 'center' },
  emptySub: { fontSize: 12.5, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
  emptyBtn: { marginTop: 12, alignSelf: 'stretch' },
});

export default withGuard(ResultsScreen, { auth: true });
