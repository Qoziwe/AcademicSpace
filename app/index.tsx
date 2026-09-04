import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/atoms';
import { Spin } from '@/components/motion';
import { BRAND } from '@/constants/brand';
import { useSessionStore } from '@/stores/session';
import { bodyFont, displayFont } from '@/theme';

/**
 * SPLASH (`/`, `design-reference.html:76`). Брендовый навy-экран (вне темы).
 * Тап или авто-переход (после гидратации сессии) → WELCOME, либо DASHBOARD
 * при уже существующей мок-сессии. Акцент-кольцо — `<Spin>` 5s
 * (`design-reference.html:82`).
 */
export default function SplashScreen() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const isAuthed = useSessionStore((s) => s.isAuthed);
  const [minElapsed, setMinElapsed] = useState(false);

  const next = isAuthed ? '/dashboard' : '/welcome';

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated && minElapsed) router.replace(next);
  }, [hydrated, minElapsed, next]);

  return (
    <Pressable style={styles.root} onPress={() => hydrated && router.replace(next)}>
      <LinearGradient
        colors={['#3C43A8', '#2C317A', '#1D2159']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.rings}>
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />
        <Spin durationMs={5000} style={[styles.ring, styles.ringAccent]} />
        <BrandLogo size={46} />
      </View>

      <View style={styles.caption}>
        <Text style={[displayFont('600'), styles.brand]}>{BRAND.appName}</Text>
        <Text style={[bodyFont('400'), styles.tagline]}>
          Твой путь к идеальному вузу начинается здесь
        </Text>
      </View>

      <Text style={[bodyFont('500'), styles.hint]}>тап, чтобы продолжить</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
    backgroundColor: '#2C317A',
  },
  rings: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: { inset: 0, borderColor: 'rgba(255,255,255,0.14)' },
  ring2: { inset: 26, borderColor: 'rgba(255,255,255,0.12)' },
  ring3: { inset: 52, borderColor: 'rgba(255,255,255,0.1)' },
  ringAccent: {
    inset: 0,
    borderColor: 'transparent',
    borderTopColor: '#7C93FF',
    borderWidth: 2,
  },
  caption: { alignItems: 'center', paddingHorizontal: 44, gap: 12 },
  brand: { fontSize: 27, letterSpacing: -0.8, color: '#FFFFFF', textAlign: 'center' },
  tagline: {
    fontSize: 14.5,
    lineHeight: 22.5,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
  },
});
