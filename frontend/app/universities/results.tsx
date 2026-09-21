import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBar, ResultsGroupedList } from '@/components/organisms';
import { useUniversitySearch } from '@/hooks/api/useUniversitySearch';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont } from '@/theme';

/**
 * RESULTS (`/universities/results`, `design-reference.html:397`). Открывается
 * как таб «Вузы». Назад → DASHBOARD. «Сменить страну» → FILTER_COUNTRY.
 */
function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const searchQ = useUniversitySearch();
  const data = searchQ.data;

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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  change: { fontSize: 11, color: accent.blue, textAlign: 'right' },
});

export default withGuard(ResultsScreen, { auth: true });
