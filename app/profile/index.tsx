import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconTile, TileIcon } from '@/components/atoms';
import { SettingsRow } from '@/components/molecules';
import { SlideUp } from '@/components/motion';
import { ProfileHeaderWidget } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { useVaults } from '@/hooks/api/useVaults';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useTheme } from '@/hooks/useTheme';
import { PROFILE_STATS } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius } from '@/theme';

/**
 * PROFILE (`/profile`, `design-reference.html:826`). Таб-рут. Навy-шапка
 * (`<ProfileHeaderWidget>`) + строки-разделы, теперь сгруппированные по
 * смыслу и с ведущей цветной иконкой-плиткой на каждой (переиспользует
 * `<TileIcon>` бенто-плиток дашборда — визуальная рифма с главным экраном).
 * Premium-разделы для Free — lock-тизер → PAYWALL (`CLAUDE.md` §6, паттерн 2).
 */
function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const profileQ = useProfile();
  const vaultsQ = useVaults();
  const { isPremium, resolveHref } = usePremiumGate();

  const profile = profileQ.data;
  const vaults = vaultsQ.data ?? [];

  const learningRows = [
    {
      title: 'Глубокое портфолио',
      sub: 'резюме, письма, активности, достижения',
      lock: false,
      href: '/ai/portfolio' as const,
      icon: <RowIcon tone="blueSoft" glyph="file" />,
    },
    {
      title: 'Журнал выполненных заданий',
      sub: 'полный архив чек-листов, таймеров и ачивок',
      lock: false,
      href: '/profile/history' as const,
      icon: <RowTile name="journal" />,
    },
    {
      title: 'Копилки документов',
      sub:
        isPremium && vaults.length > 0
          ? `${vaults.length} копилки · ${vaults.map((v) => v.shortName).join(', ')}`
          : isPremium
            ? 'копилки по выбранным вузам'
            : 'откроется с подпиской',
      lock: !isPremium,
      href: '/documents' as const,
      icon: <RowTile name="vault" />,
    },
    {
      title: 'Активные модули',
      sub: isPremium ? 'в работе' : 'откроется с подпиской',
      lock: !isPremium,
      href: '/tasks' as const,
      icon: <RowTile name="tasks" />,
    },
    {
      title: 'Фокус и продуктивность',
      sub: isPremium ? 'звуки и трекеры привычек' : 'откроется с подпиской',
      lock: !isPremium,
      href: '/focus' as const,
      icon: <RowTile name="focus" />,
    },
  ];

  const accountRows = [
    {
      title: 'Подписка',
      sub: profile?.subscriptionRowSub ?? '',
      lock: false,
      href: '/profile/subscription' as const,
      icon: <RowIcon tone="gold" glyph="sparkles" />,
    },
    {
      title: 'Настройки аккаунта',
      sub: 'уведомления, о нас, документы',
      lock: false,
      href: '/settings' as const,
      icon: <RowIcon tone="muted" glyph="settings" />,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      {profile ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
          <ProfileHeaderWidget
            variant="profile"
            name={profile.name}
            planLabel={isPremium ? 'Premium' : 'Базовый доступ'}
            grade={`${profile.grade} · ${isPremium ? 'Premium' : 'Базовый'}`}
            isPremium={isPremium}
            level={profile.level}
            xpCurrent={profile.xp}
            xpTarget={profile.xpToNextLevel}
            stats={PROFILE_STATS.map((s) => ({ value: s.v, label: s.k }))}
            onBack={() => router.push('/dashboard')}
            onSettings={() => router.push('/settings')}
          />

          <View style={styles.sections}>
            <Section title="Обучение" palette={palette}>
              {learningRows.map((r, i) => (
                <SlideUp key={r.title} delayMs={i * 40}>
                  <SettingsRow
                    variant="card"
                    title={r.title}
                    sub={r.sub}
                    icon={r.icon}
                    badge={r.lock ? 'PREMIUM' : undefined}
                    onPress={() => router.push(resolveHref(r.href, { locked: r.lock }))}
                  />
                </SlideUp>
              ))}
            </Section>

            <Section title="Аккаунт" palette={palette}>
              {accountRows.map((r, i) => (
                <SlideUp key={r.title} delayMs={(learningRows.length + i) * 40}>
                  <SettingsRow
                    variant="card"
                    title={r.title}
                    sub={r.sub}
                    icon={r.icon}
                    onPress={() => router.push(resolveHref(r.href, { locked: r.lock }))}
                  />
                </SlideUp>
              ))}
            </Section>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={accent.blue} />
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  palette,
  children,
}: {
  title: string;
  palette: { sub: string };
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[bodyFont('700'), styles.sectionTitle, { color: palette.sub }]}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function RowTile({ name }: { name: Parameters<typeof TileIcon>[0]['name'] }) {
  return (
    <View style={styles.tileWrap}>
      <TileIcon name={name} />
    </View>
  );
}

function RowIcon({
  tone,
  glyph,
}: {
  tone: 'blueSoft' | 'muted' | 'gold';
  glyph: 'file' | 'settings' | 'sparkles';
}) {
  const bg = tone === 'gold' ? 'rgba(243,194,75,0.16)' : undefined;
  const color = tone === 'gold' ? accent.gold : undefined;
  return (
    <IconTile size={40} radius={13} tone={tone === 'gold' ? 'blueSoft' : tone} background={bg}>
      <Icon name={glyph} size={18} color={color ?? accent.blue} strokeWidth={1.7} />
    </IconTile>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sections: { paddingHorizontal: 18, paddingTop: 20, gap: 22 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 11, letterSpacing: 0.7, paddingHorizontal: 2 },
  rows: { gap: 9 },
  tileWrap: { width: 40, height: 40, borderRadius: radius.sm, overflow: 'hidden' },
});

export default withGuard(ProfileScreen, { auth: true });
