import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button } from '@/components/atoms';
import { HeaderBar } from '@/components/organisms';
import { useAnalysis } from '@/hooks/api/useAnalysis';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy, radius } from '@/theme';

/**
 * ANALYSIS_PREVIEW (`/ai/analysis/preview`, `design-reference.html:551`).
 * Первая монетизация: превью-блоки уходят под градиент-фейд, поверх —
 * карточка подписки → PAYWALL. Настоящий blur — Фаза 5 (`expo-blur`).
 */
function AnalysisPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const analysisQ = useAnalysis('a_demo');
  const blocks = analysisQ.data?.previewBlocks ?? [];

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Стратегия поступления"
        sub="превью · сгенерировано ИИ"
        onBack={backOr('/dashboard')}
      />

      {analysisQ.data ? (
        <View style={styles.body}>
          <ScrollView contentContainerStyle={styles.scroll} scrollEnabled={false}>
            {blocks.map((b) => (
              <View
                key={b.title}
                style={[
                  styles.card,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <Text style={[bodyFont('800'), styles.cardTitle, { color: palette.ink }]}>
                  {b.title}
                </Text>
                <Text style={[bodyFont('500'), styles.cardText, { color: palette.sub }]}>
                  {b.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0)', palette.screen]}
            locations={[0, 0.55]}
            style={styles.fade}
          />

          <View style={[styles.offer, { paddingBottom: insets.bottom + 22 }]}>
            <View style={styles.offerCard}>
              <Badge label="ACADEMICSPACE PREMIUM" tone="gold" dot />
              <Text style={[bodyFont('800'), styles.offerTitle]}>
                Готово! Осталось разблокировать полную стратегию
              </Text>
              <Text style={[bodyFont('500'), styles.offerText]}>
                Полный разбор, список рекомендаций и безлимитный чат с ИИ-ментором.
              </Text>
              <Button
                label="Оформить подписку"
                tone="gold"
                onPress={() => router.push('/subscription/offer')}
                style={styles.offerBtn}
              />
            </View>
          </View>
        </View>
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
  body: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radius.xl, padding: 16 },
  cardTitle: { fontSize: 12.5 },
  cardText: { fontSize: 12.5, lineHeight: 20.5, marginTop: 9 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%' },
  offer: { position: 'absolute', left: 16, right: 16, bottom: 0 },
  offerCard: {
    backgroundColor: navy.deep,
    borderRadius: 26,
    padding: 20,
    gap: 10,
    shadowColor: 'rgba(16,20,55,1)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 18,
  },
  offerTitle: { fontSize: 17, lineHeight: 22, color: '#FFFFFF' },
  offerText: { fontSize: 12, lineHeight: 18.5, color: 'rgba(255,255,255,0.6)' },
  offerBtn: { marginTop: 6 },
});

export default withGuard(AnalysisPreviewScreen, { auth: true });
