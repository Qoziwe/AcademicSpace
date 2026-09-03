/**
 * Dev-оверлей (только `__DEV__`) для ручного клик-теста Фазы 1:
 * переключить Free/Premium, сбросить сессию, включить офлайн-баннер,
 * быстро прыгнуть на системные экраны и точки входа.
 *
 * Это НЕ продуктовый UI — аналог левой панели-переключателей из
 * дизайн-прототипа. Полноценный dev-Playground с UI-китом — Фаза 2.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES } from '@/navigation/registry';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { accent } from '@/theme';

export function DevMenu() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const { isAuthed, plan, signIn, signOut, setPlan, reset } = useSessionStore();
  const { offline, setOffline } = useUiStore();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 96 }]}>
      {open ? (
        <View style={styles.panel}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.heading}>DEV · Phase 1</Text>

            <Text style={styles.group}>Сессия</Text>
            <Row
              label={`isAuthed: ${isAuthed}`}
              onPress={isAuthed ? signOut : signIn}
              action={isAuthed ? 'sign out' : 'sign in'}
            />
            <Row
              label={`plan: ${plan}`}
              onPress={() => setPlan(plan === 'premium' ? 'free' : 'premium')}
              action={plan === 'premium' ? '→ free' : '→ premium'}
            />
            <Row label="полный сброс" onPress={reset} action="reset" />

            <Text style={styles.group}>UI</Text>
            <Row
              label={`offline banner: ${offline}`}
              onPress={() => setOffline(!offline)}
              action="toggle"
            />

            <Text style={styles.group}>Прыжки</Text>
            <Row
              label="SPLASH"
              onPress={() => router.replace(ROUTES.SPLASH.demoHref)}
              action="go"
            />
            <Row
              label="WELCOME"
              onPress={() => router.replace(ROUTES.WELCOME.demoHref)}
              action="go"
            />
            <Row
              label="DASHBOARD"
              onPress={() => router.replace(ROUTES.DASHBOARD.demoHref)}
              action="go"
            />
            <Row label="ERROR" onPress={() => router.push(ROUTES.ERROR.demoHref)} action="go" />
            <Row label="OFFLINE" onPress={() => router.push(ROUTES.OFFLINE.demoHref)} action="go" />
            <Row
              label="MAINTENANCE"
              onPress={() => router.push(ROUTES.MAINTENANCE.demoHref)}
              action="go"
            />
            <Row
              label="UPDATE_REQUIRED"
              onPress={() => router.push(ROUTES.UPDATE_REQUIRED.demoHref)}
              action="go"
            />
          </ScrollView>
        </View>
      ) : null}

      <Pressable style={styles.fab} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.fabText}>{open ? '×' : 'DEV'}</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, action, onPress }: { label: string; action: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.rowAction}>{action}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 12,
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 60,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  panel: {
    width: 240,
    maxHeight: 380,
    borderRadius: 18,
    backgroundColor: 'rgba(15,18,48,0.97)',
    padding: 12,
  },
  scroll: { flexGrow: 0 },
  scrollContent: { gap: 6 },
  heading: {
    color: '#8FA6FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  group: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rowPressed: { opacity: 0.6 },
  rowLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', flex: 1 },
  rowAction: { color: '#8FA6FF', fontSize: 10, fontWeight: '700' },
});
