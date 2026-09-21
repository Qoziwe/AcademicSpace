/**
 * Глобальный офлайн-баннер (`design-reference.html:1074`, `showOfflineBanner`).
 * Поверх любого контентного экрана при `ui.offline`, кроме системных
 * (`/system/*` — там своё полноэкранное состояние).
 *
 * Фиксированный тёмный фон (как в прототипе) — вне темы. Появление —
 * `<SlideUp>` .3s, точка статуса — `<Blink>` 1.4s
 * (`design-reference.html:1075–1076`). Реальное определение сети (NetInfo)
 * — с приходом бекенда (Фаза 8); сейчас переключается вручную.
 */

import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Blink, SlideUp } from '@/components/motion';
import { useMockStore } from '@/mocks/store';
import { accent, bodyFont, radius } from '@/theme';

const SYSTEM_PREFIX = '/system';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const offline = useMockStore((s) => s.offline);
  const setOffline = useMockStore((s) => s.setOffline);

  if (!offline || pathname.startsWith(SYSTEM_PREFIX)) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <SlideUp style={styles.banner}>
        <Blink durationMs={1400} style={styles.dot} />
        <View style={styles.text}>
          <Text style={[bodyFont('700'), styles.title]}>Нет соединения</Text>
          <Text style={[bodyFont('400'), styles.sub]}>Данные подтянутся автоматически</Text>
        </View>
        <Pressable onPress={() => setOffline(false)} hitSlop={8}>
          <Text style={[bodyFont('700'), styles.hide]}>Скрыть</Text>
        </Pressable>
      </SlideUp>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(21,24,67,0.95)',
    shadowColor: 'rgba(10,13,40,1)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accent.gold,
  },
  text: { flex: 1 },
  title: { fontSize: 12.5, color: '#FFFFFF' },
  sub: { fontSize: 10.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  hide: { fontSize: 11, color: '#8FA6FF' },
});
