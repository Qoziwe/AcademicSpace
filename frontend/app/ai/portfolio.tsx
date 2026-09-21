import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentCell } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useStartAnalysis } from '@/hooks/api/useAnalysis';
import { useTheme } from '@/hooks/useTheme';
import { PORTFOLIO_SLOTS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, navy, radius } from '@/theme';

/**
 * PORTFOLIO_UPLOAD (`/ai/portfolio`, `design-reference.html:491`).
 * Funnel-вход, доступен Free. Слоты — мок file-picker
 * (`mocks/store.ts.uploadSlots`). «Запустить ИИ-анализ» → ANALYSIS_LOADING.
 */
function PortfolioUploadScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const slots = useMockStore((s) => s.uploadSlots);
  const toggleSlot = useMockStore((s) => s.toggleUploadSlot);
  const start = useStartAnalysis();

  const run = () => {
    if (start.isPending) return;
    start.mutate(undefined, { onSuccess: () => router.push('/ai/analysis/loading') });
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="ИИ-портфолио"
        sub="свободные данные · чем больше, тем точнее"
        onBack={backOr('/dashboard')}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        {PORTFOLIO_SLOTS.map((slot, i) => (
          <DocumentCell
            key={slot.title}
            title={slot.title}
            sub={slot.filledSub}
            filled={slots[i] ?? false}
            onPress={() => toggleSlot(i)}
            actionFilledLabel="загружено"
            actionEmptyLabel="добавить"
          />
        ))}

        <View
          style={[styles.dashed, { borderColor: palette.border, backgroundColor: palette.card }]}
        >
          <Text style={[bodyFont('700'), styles.dashedTitle, { color: palette.ink }]}>
            Достижения в свободной форме
          </Text>
          <Text style={[bodyFont('500'), styles.dashedSub, { color: palette.sub }]}>
            Олимпиады, проекты, работа, волонтёрство — текстом или файлами
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: palette.screen, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Pressable accessibilityRole="button" onPress={run} disabled={start.isPending}>
          <LinearGradient
            colors={[navy.deep, '#2E6BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, { opacity: start.isPending ? 0.6 : 1 }]}
          >
            <View style={styles.ctaDiamond} />
            <Text style={[bodyFont('800'), styles.ctaText]}>Запустить ИИ-анализ</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 10 },
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    padding: 18,
    alignItems: 'center',
  },
  dashedTitle: { fontSize: 12.5 },
  dashedSub: { fontSize: 11.5, lineHeight: 17, marginTop: 6, textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  cta: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#F3C24B',
    transform: [{ rotate: '45deg' }],
  },
  ctaText: { fontSize: 15, color: '#FFFFFF' },
});

export default withGuard(PortfolioUploadScreen, { auth: true });
