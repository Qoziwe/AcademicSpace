import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsRow } from '@/components/molecules';
import { ProfileHeaderWidget } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { useTheme } from '@/hooks/useTheme';
import { PROFILE_STATS } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';
import { accent } from '@/theme';

/**
 * PROFILE (`/profile`, `design-reference.html:826`). Таб-рут. Навy-шапка
 * (`<ProfileHeaderWidget>`) + строки-разделы. Premium-разделы для Free —
 * lock-тизер → PAYWALL (`CLAUDE.md` §6, паттерн 2).
 */
function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const profileQ = useProfile();
  const { isPremium, resolveHref } = usePremiumGate();

  const profile = profileQ.data;

  const rows = [
    {
      title: 'Глубокое портфолио',
      sub: 'резюме, письма, активности, достижения',
      lock: false,
      href: '/ai/portfolio' as const,
    },
    {
      title: 'Журнал выполненных заданий',
      sub: 'полный архив чек-листов, таймеров и ачивок',
      lock: false,
      href: '/profile/history' as const,
    },
    {
      title: 'Копилки документов',
      sub: isPremium ? '2 копилки · Bologna, Padova' : 'откроется с подпиской',
      lock: !isPremium,
      href: '/documents' as const,
    },
    {
      title: 'Активные модули',
      sub: isPremium ? 'в работе' : 'откроется с подпиской',
      lock: !isPremium,
      href: '/tasks' as const,
    },
    {
      title: 'Фокус и продуктивность',
      sub: isPremium ? 'звуки и трекеры привычек' : 'откроется с подпиской',
      lock: !isPremium,
      href: '/focus' as const,
    },
    {
      title: 'Подписка',
      sub: isPremium ? 'Premium · продлится 12 мая' : 'Базовый доступ · 500 тг / неделя',
      lock: false,
      href: '/profile/subscription' as const,
    },
    {
      title: 'Настройки аккаунта',
      sub: 'уведомления, о нас, документы',
      lock: false,
      href: '/settings' as const,
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

          <View style={styles.rows}>
            {rows.map((r) => (
              <SettingsRow
                key={r.title}
                variant="card"
                title={r.title}
                sub={r.sub}
                badge={r.lock ? 'PREMIUM' : undefined}
                onPress={() => router.push(resolveHref(r.href, { locked: r.lock }))}
              />
            ))}
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rows: { paddingHorizontal: 18, paddingTop: 16, gap: 9 },
});

export default withGuard(ProfileScreen, { auth: true });
