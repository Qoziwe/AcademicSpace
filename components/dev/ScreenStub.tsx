/**
 * Экран-заглушка Фазы 1 (скелет навигации).
 *
 * Показывает метаданные роута из реестра и делает КАЖДЫЙ переход
 * (`destinations`) и «назад» рабочей кнопкой — «ни одна кнопка не ведёт в
 * никуда» (роадмап, Фаза 1 DoD). Реальная вёрстка экрана приходит на Фазе 3
 * и заменяет `<ScreenStub>` на настоящий компонент.
 */

import { Link, router, useNavigation } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES, type RouteId } from '@/navigation/registry';
import { accent, fontFamily, lightPalette, radius, spacing } from '@/theme';

interface Props {
  id: RouteId;
}

const NAV_TYPE_LABEL: Record<string, string> = {
  stack: 'Stack',
  'stack-no-back': 'Stack · без «назад»',
  tab: 'Tab',
  'tab-conditional': 'Tab · условный',
  modal: 'Modal',
};

export function ScreenStub({ id }: Props) {
  const meta = ROUTES[id];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const backMeta = meta.back !== 'disabled' && meta.back !== 'none' ? ROUTES[meta.back] : null;

  const goBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else if (backMeta) {
      router.replace(backMeta.demoHref);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 120 },
      ]}
    >
      <Text style={styles.kicker}>PHASE 1 · STUB</Text>
      <Text style={styles.routeId}>{meta.id}</Text>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.path}>{meta.path}</Text>

      <View style={styles.badges}>
        <Badge label={NAV_TYPE_LABEL[meta.navType] ?? meta.navType} />
        <Badge
          label={meta.auth ? 'Auth: required' : 'Auth: —'}
          tone={meta.auth ? 'blue' : 'muted'}
        />
        <Badge
          label={meta.premium ? 'Premium: true' : 'Premium: false'}
          tone={meta.premium ? 'gold' : 'muted'}
        />
      </View>

      {meta.note ? <Text style={styles.note}>{meta.note}</Text> : null}

      <Section title="Переходы (Destinations)">
        {meta.destinations.length === 0 ? (
          <Text style={styles.empty}>— конечный экран, исходящих переходов нет</Text>
        ) : (
          meta.destinations.map((destId) => {
            const dest = ROUTES[destId];
            return (
              <Link key={destId} href={dest.demoHref} asChild>
                <Pressable style={({ pressed }) => [styles.destBtn, pressed && styles.pressed]}>
                  <View style={styles.destText}>
                    <Text style={styles.destTitle}>{dest.title}</Text>
                    <Text style={styles.destMeta}>
                      {dest.id} · {dest.path}
                      {dest.premium ? ' · 🔒 premium' : ''}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>→</Text>
                </Pressable>
              </Link>
            );
          })
        )}
      </Section>

      <Section title="Назад (Back behavior)">
        {meta.back === 'disabled' ? (
          <Text style={styles.empty}>назад запрещён (disabled)</Text>
        ) : meta.back === 'none' ? (
          <Text style={styles.empty}>точки входа только программные / таб-switch</Text>
        ) : (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={styles.chevron}>←</Text>
            <View style={styles.destText}>
              <Text style={styles.destTitle}>Назад</Text>
              <Text style={styles.destMeta}>
                ожидаемо → {backMeta?.id} ({backMeta?.path})
              </Text>
            </View>
          </Pressable>
        )}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Badge({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'blue' | 'gold' }) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'blue' && styles.badgeBlue,
        tone === 'gold' && styles.badgeGold,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === 'blue' && styles.badgeTextBlue,
          tone === 'gold' && styles.badgeTextGold,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightPalette.screen,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: fontFamily.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: lightPalette.sub,
  },
  routeId: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: lightPalette.ink,
    marginTop: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    fontWeight: '600',
    color: lightPalette.ink,
  },
  path: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    color: accent.blue,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  badge: {
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: lightPalette.chip,
  },
  badgeBlue: { backgroundColor: 'rgba(46,107,255,0.12)' },
  badgeGold: { backgroundColor: 'rgba(243,194,75,0.18)' },
  badgeText: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    fontWeight: '700',
    color: lightPalette.sub,
  },
  badgeTextBlue: { color: accent.blue },
  badgeTextGold: { color: '#9A7B1E' },
  note: {
    fontFamily: fontFamily.text,
    fontSize: 12,
    lineHeight: 17,
    color: lightPalette.sub,
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: lightPalette.sub,
  },
  empty: {
    fontFamily: fontFamily.text,
    fontSize: 12.5,
    color: lightPalette.sub,
    fontStyle: 'italic',
  },
  destBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: lightPalette.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: lightPalette.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: lightPalette.chip,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.6 },
  destText: { flex: 1 },
  destTitle: {
    fontFamily: fontFamily.text,
    fontSize: 13.5,
    fontWeight: '600',
    color: lightPalette.ink,
  },
  destMeta: {
    fontFamily: fontFamily.text,
    fontSize: 11,
    color: lightPalette.sub,
    marginTop: 1,
  },
  chevron: {
    fontFamily: fontFamily.text,
    fontSize: 16,
    fontWeight: '700',
    color: accent.blue,
  },
});
