import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckIcon } from '@/components/atoms';
import { SettingsRow } from '@/components/molecules';
import { HeaderBar } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { useCancelSubscription } from '@/hooks/api/useSubscription';
import { useTheme } from '@/hooks/useTheme';
import { PREMIUM_PERKS } from '@/mocks/fixtures';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, radius, spacing } from '@/theme';

/**
 * PROFILE_SUBSCRIPTION (`/profile/subscription`, `subCard` прототипа).
 * Управление подпиской. Premium → смена тарифа (PLAN_SELECTION) + отмена;
 * Free → апселл (PAYWALL). Назад → PROFILE.
 *
 * Для Premium раньше это была одна карточка на голом экране — добавлены
 * детали подписки (строки-факты) и напоминание, что входит в тариф, чтобы
 * экран не выглядел пустым под хедером.
 */
function ProfileSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const profileQ = useProfile();
  const cancelSubscription = useCancelSubscription();

  const isPremium = profileQ.data?.plan === 'premium';
  const cancelAtPeriodEnd = profileQ.data?.subscription?.cancelAtPeriodEnd ?? false;

  return (
    <View style={[styles.root, { backgroundColor: palette.screen }]}>
      <HeaderBar
        title="Управление подпиской"
        sub="тариф, оплата, отмена"
        onBack={backOr('/profile')}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {isPremium ? (
          <>
            <LinearGradient
              colors={['#1F2360', '#2C317A']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.card}
            >
              <Text style={[bodyFont('800'), styles.tagGold]}>ПОДПИСКА АКТИВНА</Text>
              <Text style={[bodyFont('800'), styles.title]}>AcademicSpace Premium</Text>
              <Text style={[bodyFont('500'), styles.text]}>
                {profileQ.data?.subscription?.summary}
                {cancelAtPeriodEnd ? ' · автопродление отключено' : '. Отмена в любой момент'}
              </Text>
              <Button
                label="Сменить тариф"
                variant="ghost"
                size="md"
                color="#FFFFFF"
                borderColor="rgba(255,255,255,0.2)"
                onPress={() => router.push('/subscription/plans')}
                style={styles.btn}
              />
            </LinearGradient>

            {cancelAtPeriodEnd ? (
              <Text style={[bodyFont('500'), styles.cancelNote, { color: palette.sub }]}>
                Автопродление выключено — Premium остаётся доступен до конца оплаченного периода.
              </Text>
            ) : (
              <Button
                label="Отменить подписку"
                variant="ghost"
                size="md"
                color={palette.sub}
                borderColor={palette.border}
                loading={cancelSubscription.isPending}
                onPress={() => cancelSubscription.mutate()}
              />
            )}

            <View style={styles.group}>
              <Text style={[bodyFont('700'), styles.groupTitle, { color: palette.sub }]}>
                ДЕТАЛИ ПОДПИСКИ
              </Text>
              <View
                style={[
                  styles.groupCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                <SettingsRow title="Тариф" value={profileQ.data?.subscription?.periodLabel} />
                <SettingsRow title="Стоимость" value={profileQ.data?.subscription?.price} />
                <SettingsRow
                  title="Автопродление"
                  value={cancelAtPeriodEnd ? 'Отключено' : 'Включено'}
                />
                <SettingsRow
                  title={cancelAtPeriodEnd ? 'Доступ до' : 'Продлится'}
                  value={profileQ.data?.subscription?.renewsAt}
                  last
                />
              </View>
            </View>

            <View style={styles.group}>
              <Text style={[bodyFont('700'), styles.groupTitle, { color: palette.sub }]}>
                ВКЛЮЧЕНО В PREMIUM
              </Text>
              <View
                style={[
                  styles.groupCard,
                  styles.perksCard,
                  { backgroundColor: palette.card, borderColor: palette.border },
                ]}
              >
                {PREMIUM_PERKS.map((perk) => (
                  <View key={perk} style={styles.perk}>
                    <View style={styles.perkIcon}>
                      <CheckIcon size={9} color={accent.gold} />
                    </View>
                    <Text style={[bodyFont('500'), styles.perkText, { color: palette.ink }]}>
                      {perk}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 },
            ]}
          >
            <Text style={[bodyFont('800'), styles.tagMuted, { color: palette.sub }]}>
              БАЗОВЫЙ ДОСТУП
            </Text>
            <Text style={[bodyFont('800'), styles.title, { color: palette.ink }]}>
              Открыть Premium
            </Text>
            <Text style={[bodyFont('500'), styles.text, { color: palette.sub }]}>
              ИИ-ментор, модули, копилки документов и инструменты фокусировки.
            </Text>
            <Button
              label="Смотреть тарифы"
              tone="navy"
              size="md"
              onPress={() => router.push('/subscription/offer')}
              style={styles.btn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, gap: spacing.md },
  card: { borderRadius: radius.xl, padding: 18 },
  tagGold: { fontSize: 10, letterSpacing: 0.6, color: '#F3C24B' },
  tagMuted: { fontSize: 10, letterSpacing: 0.6 },
  title: { fontSize: 16, color: '#FFFFFF', marginTop: 9 },
  text: { fontSize: 11.5, lineHeight: 17.25, color: 'rgba(255,255,255,0.6)', marginTop: 7 },
  btn: { marginTop: 15 },
  cancelNote: { fontSize: 11.5, lineHeight: 17, textAlign: 'center', paddingHorizontal: 8 },
  group: { gap: 0 },
  groupTitle: { fontSize: 11, letterSpacing: 0.55, paddingHorizontal: 4, paddingBottom: 9 },
  groupCard: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  perksCard: { padding: spacing.lg, gap: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(243,194,75,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: { flex: 1, fontSize: 12.5 },
});

export default withGuard(ProfileSubscriptionScreen, { auth: true });
