/**
 * `<ModuleConfirmationCard>` — карточка-подтверждение создания модуля,
 * которую ассистент присылает в чат (`design-reference.html:640`,
 * `messages[].module`). Остаётся в переписке; `created` → кнопка
 * превращается в зелёный статус «Вынесено на главный экран ✓».
 * Появление — `<SlideUp>` .3s (CSS `animation:up`, `:640`).
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconTile } from '@/components/atoms';
import { SlideUp } from '@/components/motion';
import { useTheme } from '@/hooks/useTheme';
import { accent, bodyFont, radius, spacing } from '@/theme';

interface Props {
  title: string;
  sub: string;
  desc: string;
  created: boolean;
  onCreate: () => void;
  createLabel?: string;
  createdLabel?: string;
}

export function ModuleConfirmationCard({
  title,
  sub,
  desc,
  created,
  onCreate,
  createLabel = 'Создать дорожную карту',
  createdLabel = 'Вынесено на главный экран ✓',
}: Props) {
  const { palette } = useTheme();

  return (
    <SlideUp style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.header}>
        <IconTile size={26} radius={9} tone="blueSoft">
          <View style={styles.diamond} />
        </IconTile>
        <View style={styles.headText}>
          <Text style={[bodyFont('800'), styles.title, { color: palette.ink }]}>{title}</Text>
          <Text style={[bodyFont('500'), styles.sub, { color: palette.sub }]}>{sub}</Text>
        </View>
      </View>

      <Text style={[bodyFont('500'), styles.desc, { color: palette.sub }]}>{desc}</Text>

      <Pressable
        accessibilityRole="button"
        disabled={created}
        onPress={onCreate}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: created ? 'rgba(31,181,116,0.14)' : accent.blue,
            opacity: pressed && !created ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[bodyFont('700'), styles.btnText, { color: created ? '#128A55' : '#FFFFFF' }]}>
          {created ? createdLabel : createLabel}
        </Text>
      </Pressable>
    </SlideUp>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 270,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 15,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: accent.blue,
    transform: [{ rotate: '45deg' }],
  },
  headText: { flex: 1, minWidth: 0 },
  title: { fontSize: 12.5 },
  sub: { fontSize: 10.5, marginTop: 1 },
  desc: { fontSize: 11.5, lineHeight: 17, marginTop: spacing.sm },
  btn: {
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  btnText: { fontSize: 12.5 },
});
