/**
 * Глобальный офлайн-баннер (прототип, строки 1064–1072).
 * Показывается поверх любого контентного экрана при `ui.offline`,
 * кроме системных экранов (там своё полноэкранное состояние).
 *
 * Фаза 1: рабочий показ/скрытие через `useUiStore`. Реальное определение
 * сети (NetInfo) и авто-dismiss при реконнекте — Фаза 5.
 */

import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '@/stores/ui';

const SYSTEM_PREFIX = '/system';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const offline = useUiStore((s) => s.offline);
  const setOffline = useUiStore((s) => s.setOffline);

  if (!offline || pathname.startsWith(SYSTEM_PREFIX)) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <View style={styles.banner}>
        <View style={styles.dot} />
        <View style={styles.text}>
          <Text style={styles.title}>Нет соединения</Text>
          <Text style={styles.sub}>Данные подтянутся автоматически</Text>
        </View>
        <Pressable onPress={() => setOffline(false)} hitSlop={8}>
          <Text style={styles.hide}>Скрыть</Text>
        </Pressable>
      </View>
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
    borderRadius: 16,
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
    backgroundColor: '#F3C24B',
  },
  text: { flex: 1 },
  title: { fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' },
  sub: { fontSize: 10.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  hide: { fontSize: 11, fontWeight: '700', color: '#8FA6FF' },
});
