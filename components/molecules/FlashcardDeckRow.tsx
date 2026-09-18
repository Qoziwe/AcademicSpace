/**
 * `<FlashcardDeckRow>` — строка колоды на FLASHCARDS_LIST. Тап по строке —
 * открыть колоду (FLASHCARDS_STUDY); тап по корзине — удалить (освобождает
 * слот квоты, `CLAUDE.md` §10 «ни одной нефункциональной кнопки»).
 *
 * Внешний Pressable намеренно без `accessibilityRole="button"`: на вебе это
 * рендерится в `<button>`, и вложенная кнопка-корзина (тоже `role="button"`)
 * даёт невалидный `<button>` внутри `<button>` — React ругается hydration-
 * warning'ом, а клики по вложенной кнопке становятся ненадёжными. Строка
 * всё равно кликабельна (`onPress` работает без роли), а корзина остаётся
 * единственным настоящим button-элементом внутри.
 */

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, IconTile } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius, spacing } from '@/theme';

interface Props {
  title: string;
  source: 'text' | 'image';
  cardsTotal: number;
  cardsRemaining: number;
  onPress: () => void;
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FlashcardDeckRow({
  title,
  source,
  cardsTotal,
  cardsRemaining,
  onPress,
  onDelete,
  style,
}: Props) {
  const { palette } = useTheme();
  const done = cardsRemaining === 0;

  return (
    <Pressable
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.card, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <IconTile size={40} radius={13} tone={done ? 'muted' : 'blueSoft'}>
        <Icon
          name={source === 'image' ? 'image' : 'file'}
          size={18}
          color={done ? palette.sub : accent.blue}
        />
      </IconTile>

      <View style={styles.textCol}>
        <Text numberOfLines={1} style={[bodyFont('700'), styles.title, { color: palette.ink }]}>
          {title}
        </Text>
        <Text style={[bodyFont('500'), styles.sub, { color: done ? accent.green : palette.sub }]}>
          {done ? 'пройдена ✓' : `${cardsRemaining} из ${cardsTotal} карточек`}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Удалить колоду"
        hitSlop={10}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={({ pressed }) => [
          styles.trash,
          { backgroundColor: palette.chip, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Icon name="trash" size={16} color={accent.rose} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 13.5 },
  sub: { fontSize: 11.5, marginTop: 3 },
  trash: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
