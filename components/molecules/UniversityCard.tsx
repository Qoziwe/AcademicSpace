/**
 * `<UniversityCard>` — карточка вуза в результатах подбора
 * (`design-reference.html:418`). `category` (Safety / Match / Reach) задаёт
 * цвет «вероятности»: зелёный / синий / розовый (`resultGroups[].color`).
 *
 * Экран RESULTS в дизайне theme-aware только по фону — карточку доводим до
 * 7-токенного паттерна (`CLAUDE.md` §8).
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, displayFont, radius, shadow, spacing } from '@/theme';

export type UniCategory = 'safety' | 'match' | 'reach';

const CATEGORY_COLOR: Record<UniCategory, string> = {
  safety: accent.green,
  match: accent.blue,
  reach: accent.rose,
};

interface Props {
  name: string;
  city: string;
  chance: string;
  category: UniCategory;
  tags: string[];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function UniversityCard({ name, city, chance, category, tags, onPress, style }: Props) {
  const { palette } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.card,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <View style={styles.top}>
        <View style={styles.nameCol}>
          <Text style={[bodyFont('800'), styles.name, { color: palette.ink }]}>{name}</Text>
          <Text style={[bodyFont('500'), styles.city, { color: palette.sub }]}>{city}</Text>
        </View>
        <View style={styles.chanceCol}>
          <Text style={[displayFont('600'), styles.chance, { color: CATEGORY_COLOR[category] }]}>
            {chance}
          </Text>
          <Text style={[bodyFont('500'), styles.chanceLabel, { color: palette.sub }]}>
            вероятность
          </Text>
        </View>
      </View>

      {tags.length > 0 ? (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: palette.chip }]}>
              <Text style={[bodyFont('600'), styles.tagText, { color: palette.sub }]}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 15,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nameCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, lineHeight: 17.5 },
  city: { fontSize: 11.5, marginTop: 4 },
  chanceCol: { alignItems: 'flex-end', flexShrink: 0 },
  chance: { fontSize: 15 },
  chanceLabel: { fontSize: 9.5, marginTop: 2 },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    borderRadius: radius.xs,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: { fontSize: 10.5 },
});
