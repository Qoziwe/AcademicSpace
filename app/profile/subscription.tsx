import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { HeaderBar } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { useSessionStore } from '@/stores/session';
import { bodyFont, radius, spacing } from '@/theme';

/**
 * PROFILE_SUBSCRIPTION (`/profile/subscription`, `subCard` прототипа).
 * Управление подпиской. Premium → смена тарифа (PLAN_SELECTION) + отмена;
 * Free → апселл (PAYWALL). Назад → PROFILE.
 */
function ProfileSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const profileQ = useProfile();
  const setPlan = useSessionStore((s) => s.setPlan);

  const isPremium = profileQ.data?.plan === 'premium';

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
                Месяц · 1 900 тг · продлится 12 мая. Отмена в любой момент.
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

            <Button
              label="Отменить подписку"
              variant="ghost"
              size="md"
              color={palette.sub}
              borderColor={palette.border}
              onPress={() => setPlan('free')}
            />
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
});

export default withGuard(ProfileSubscriptionScreen, { auth: true });
