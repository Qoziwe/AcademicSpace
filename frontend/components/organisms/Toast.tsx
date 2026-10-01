/**
 * Глобальный тост ошибок (`stores/toast.ts`) — тот же навy-стиль вне темы,
 * что у `<OfflineBanner>` (`CLAUDE.md` §8, оба сознательно вне темы), но
 * снизу и с автоскрытием. Единая точка показа для всех мутаций, у которых
 * нет собственного inline-места под ошибку (тумблер задачи, загрузка файла,
 * отправка сообщения и т. д. — формы вроде `AuthScreen` показывают ошибку
 * рядом с кнопкой, тост им не нужен).
 */

import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SlideUp } from '@/components/motion';
import { useToastStore } from '@/stores/toast';
import { bodyFont, radius } from '@/theme';

const AUTO_HIDE_MS = 5000;

export function Toast() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (message) timer.current = setTimeout(hide, AUTO_HIDE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, hide]);

  if (!message) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 16 }]}>
      <SlideUp style={styles.banner}>
        <Text numberOfLines={4} style={[bodyFont('600'), styles.text]}>
          {message}
        </Text>
        <Pressable accessibilityRole="button" onPress={hide} hitSlop={8}>
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
    zIndex: 50,
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
  text: { flex: 1, fontSize: 12.5, color: '#FFFFFF' },
  hide: { fontSize: 11, color: '#8FA6FF', flexShrink: 0 },
});
