/**
 * `<ResultsGroupedList>` — сгруппированный список результатов подбора
 * (`design-reference.html:411`, `resultGroups`): заголовок группы
 * (цветная точка + название + счётчик) и карточки `<UniversityCard>`.
 *
 * Рендерится внутри `ScrollView` экрана RESULTS — поэтому это `View`, а не
 * `FlatList`.
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { UniversityCard, type UniCategory } from '@/components/molecules';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, spacing } from '@/theme';

export interface ResultUniversity {
  id: string;
  name: string;
  city: string;
  chance: string;
  tags: string[];
}

export interface ResultGroup {
  key: string;
  title: string;
  sub: string;
  category: UniCategory;
  items: ResultUniversity[];
}

const CATEGORY_COLOR: Record<UniCategory, string> = {
  safety: accent.green,
  match: accent.blue,
  reach: accent.rose,
};

interface Props {
  groups: ResultGroup[];
  onOpenUniversity: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function ResultsGroupedList({ groups, onOpenUniversity, style }: Props) {
  const { palette } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={[styles.dot, { backgroundColor: CATEGORY_COLOR[group.category] }]} />
            <Text style={[bodyFont('800'), styles.groupTitle, { color: palette.ink }]}>
              {group.title}
            </Text>
            <Text style={[bodyFont('500'), styles.groupSub, { color: palette.sub }]}>
              {group.sub}
            </Text>
          </View>

          {group.items.map((u) => (
            <UniversityCard
              key={u.id}
              name={u.name}
              city={u.city}
              chance={u.chance}
              category={group.category}
              tags={u.tags}
              onPress={() => onOpenUniversity(u.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  group: {
    gap: 9,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 3,
  },
  groupTitle: { fontSize: 13.5 },
  groupSub: { fontSize: 11 },
});
