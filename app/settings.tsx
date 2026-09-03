import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Switch } from '@/components/atoms';
import { SettingsRow } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { SETTINGS_GROUPS } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, radius } from '@/theme';

/**
 * SETTINGS (`/settings`, `design-reference.html:911`). Карточка подписки +
 * переключатель темы (theme store) + 3 группы строк. Назад → PROFILE.
 */
function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { palette, isDark, toggle } = useTheme();
  const profileQ = useProfile();

  const isPremium = profileQ.data?.plan === 'premium';

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar title="Настройки" sub="аккаунт, подписка, о нас" onBack={backOr('/profile')} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {isPremium ? (
          <LinearGradient
            colors={['#1F2360', '#2C317A']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.subCard}
          >
            <Text style={[bodyFont('800'), styles.subTagGold]}>ПОДПИСКА АКТИВНА</Text>
            <Text style={[bodyFont('800'), styles.subTitle]}>AcademicSpace Premium</Text>
            <Text style={[bodyFont('500'), styles.subText]}>
              Месяц · 1 900 тг · продлится 12 мая. Отмена в любой момент.
            </Text>
            <Button
              label="Управлять подпиской"
              variant="ghost"
              size="md"
              color="#FFFFFF"
              borderColor="rgba(255,255,255,0.2)"
              onPress={() => router.push('/profile/subscription')}
              style={styles.subBtn}
            />
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.subCard,
              { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 },
            ]}
          >
            <Text style={[bodyFont('800'), styles.subTagMuted, { color: palette.sub }]}>
              БАЗОВЫЙ ДОСТУП
            </Text>
            <Text style={[bodyFont('800'), styles.subTitle, { color: palette.ink }]}>
              Открыть Premium
            </Text>
            <Text style={[bodyFont('500'), styles.subText, { color: palette.sub }]}>
              ИИ-ментор, модули, копилки документов и инструменты фокусировки.
            </Text>
            <Button
              label="Смотреть тарифы"
              tone="navy"
              size="md"
              onPress={() => router.push('/subscription/offer')}
              style={styles.subBtn}
            />
          </View>
        )}

        <View
          style={[styles.themeCard, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <View style={styles.themeRow}>
            <View>
              <Text style={[bodyFont('600'), styles.themeTitle, { color: palette.ink }]}>
                Тема оформления
              </Text>
              <Text style={[bodyFont('500'), styles.themeLabel, { color: palette.sub }]}>
                {isDark ? 'Тёмная' : 'Светлая'}
              </Text>
            </View>
            <Switch value={isDark} onValueChange={toggle} />
          </View>
        </View>

        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[bodyFont('700'), styles.groupTitle, { color: palette.sub }]}>
              {group.title.toUpperCase()}
            </Text>
            <View
              style={[
                styles.groupCard,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
            >
              {group.rows.map((r, i) => (
                <SettingsRow
                  key={r.title}
                  title={r.title}
                  value={r.value}
                  last={i === group.rows.length - 1}
                  onPress={r.go === 'profile' ? () => router.push('/profile') : undefined}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, gap: 16 },
  subCard: { borderRadius: radius.xl, padding: 18 },
  subTagGold: { fontSize: 10, letterSpacing: 0.6, color: '#F3C24B' },
  subTagMuted: { fontSize: 10, letterSpacing: 0.6 },
  subTitle: { fontSize: 16, color: '#FFFFFF', marginTop: 9 },
  subText: { fontSize: 11.5, lineHeight: 17.25, color: 'rgba(255,255,255,0.6)', marginTop: 7 },
  subBtn: { marginTop: 15 },
  themeCard: { borderWidth: 1, borderRadius: radius.lg, padding: 16 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeTitle: { fontSize: 13 },
  themeLabel: { fontSize: 11, marginTop: 3 },
  group: { gap: 0 },
  groupTitle: { fontSize: 11, letterSpacing: 0.55, paddingHorizontal: 4, paddingBottom: 9 },
  groupCard: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
});

export default withGuard(SettingsScreen, { auth: true });
