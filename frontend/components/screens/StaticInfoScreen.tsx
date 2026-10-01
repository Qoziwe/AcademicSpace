/**
 * `<StaticInfoScreen>` — общая вёрстка статичных информационных экранов
 * настроек (О нас / Условия использования / Политика конфиденциальности).
 * Ни один из них не описан отдельным ID в `docs/source/03-routes.md` —
 * в дизайн-референсе строки-триггеры были `go:()=>{}` (`CLAUDE.md` §5
 * запрещает нефункциональные кнопки, поэтому здесь честная навигация +
 * честный статичный контент вместо пункта-заглушки).
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBar } from '@/components/organisms';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { bodyFont, spacing } from '@/theme';

interface Section {
  heading?: string;
  paragraphs: string[];
}

interface Props {
  title: string;
  sub: string;
  sections: Section[];
}

export function StaticInfoScreen({ title, sub, sections }: Props) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar title={title} sub={sub} onBack={backOr('/settings')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {sections.map((section, i) => (
          <View key={section.heading ?? i} style={styles.section}>
            {section.heading ? (
              <Text style={[bodyFont('700'), styles.heading, { color: palette.ink }]}>
                {section.heading}
              </Text>
            ) : null}
            {section.paragraphs.map((p, j) => (
              <Text key={j} style={[bodyFont('500'), styles.paragraph, { color: palette.sub }]}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, gap: spacing.lg },
  section: { gap: 8 },
  heading: { fontSize: 13.5 },
  paragraph: { fontSize: 12.5, lineHeight: 19 },
});
