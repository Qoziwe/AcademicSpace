import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAnalysis } from '@/hooks/api/useAnalysis';
import { ANALYSIS_STEPS } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy } from '@/theme';

/**
 * ANALYSIS_LOADING (`/ai/analysis/loading`, `design-reference.html:527`).
 * Навy `navy.deep`, вне темы. Авто-переход на ANALYSIS_PREVIEW; back
 * отключён (`gestureEnabled: false` в root `_layout`, здесь `replace`).
 * Кольца spin/blur — статичны до Фазы 5.
 */
function AnalysisLoadingScreen() {
  // Прогреваем кэш анализа, чтобы ANALYSIS_PREVIEW открылся без спиннера.
  useAnalysis('a_demo');

  useEffect(() => {
    const t = setTimeout(() => router.replace('/ai/analysis/preview'), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.rings}>
        <View style={[styles.ring, styles.ringOuter]} />
        <View style={[styles.ring, styles.ringBlue]} />
        <View style={[styles.ring, styles.ringGold]} />
        <View style={styles.diamond} />
      </View>

      <View style={styles.caption}>
        <Text style={[bodyFont('700'), styles.title]}>ИИ анализирует ваш профиль</Text>
        <Text style={[bodyFont('400'), styles.sub]}>и составляет рекомендации…</Text>
      </View>

      <View style={styles.steps}>
        {ANALYSIS_STEPS.map((label, i) => {
          const active = i === ANALYSIS_STEPS.length - 1;
          return (
            <View key={label} style={styles.step}>
              <View
                style={[styles.stepDot, { backgroundColor: active ? accent.gold : accent.green }]}
              />
              <Text
                style={[
                  bodyFont('500'),
                  styles.stepLabel,
                  { color: active ? '#FFFFFF' : 'rgba(255,255,255,0.8)' },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: navy.deep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 44,
  },
  rings: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999 },
  ringOuter: { inset: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ringBlue: {
    inset: 0,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: accent.blue,
  },
  ringGold: {
    inset: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: accent.gold,
  },
  diamond: {
    width: 16,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  caption: { alignItems: 'center', gap: 8 },
  title: { fontSize: 15.5, color: '#FFFFFF' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  steps: { alignSelf: 'stretch', gap: 8 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
  stepLabel: { fontSize: 12 },
});

export default withGuard(AnalysisLoadingScreen, { auth: true });
