import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Blink, Spin } from '@/components/motion';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, navy } from '@/theme';

/**
 * FLASHCARDS_GENERATING (`/flashcards/generating`). Чисто декоративный,
 * навy, back отключён (как ANALYSIS_LOADING) — реальный переход на
 * созданную колоду делает вызывающий экран (`flashcards/create.tsx`),
 * т.к. id колоды известен только после ответа мутации. Таймаут-фолбэк на
 * случай прямого захода/сбоя — не тупик даже без submit-контекста.
 */
function FlashcardsGeneratingScreen() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/flashcards'), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.rings}>
        <View style={[styles.ring, styles.ringOuter]} />
        <Spin durationMs={1400} style={[styles.ring, styles.ringBlue]} />
        <Spin durationMs={2100} reverse style={[styles.ring, styles.ringGold]} />
        <View style={styles.diamond} />
      </View>

      <View style={styles.caption}>
        <Text style={[bodyFont('700'), styles.title]}>ИИ собирает карточки</Text>
        <Text style={[bodyFont('400'), styles.sub]}>разбираем материал и формулируем вопросы…</Text>
      </View>

      <View style={styles.step}>
        <Blink durationMs={1200} style={[styles.stepDot, { backgroundColor: accent.gold }]} />
        <Text style={[bodyFont('500'), styles.stepLabel]}>Формулируем вопрос → ответ</Text>
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
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignSelf: 'stretch',
  },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
  stepLabel: { fontSize: 12, color: '#FFFFFF' },
});

export default withGuard(FlashcardsGeneratingScreen, { auth: true });
