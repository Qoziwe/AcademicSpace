import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckIcon } from '@/components/atoms';
import { PlanCard } from '@/components/molecules';
import { usePlans } from '@/hooks/api/useSubscription';
import { PREMIUM_PERKS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, spacing } from '@/theme';

/**
 * PAYWALL (`/subscription/offer`, `design-reference.html:589`). Модалка,
 * навy `navy.deep` (вне темы). Маркетинг + inline выбор тарифа
 * (`<PlanCard>`), «Оформить» → PAYMENT_FLOW (`CLAUDE.md` §7). Свайп-вниз /
 * тап по ручке — dismiss.
 */
function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const plansQ = usePlans();
  const planChoice = useMockStore((s) => s.planChoice);
  const setPlanChoice = useMockStore((s) => s.setPlanChoice);

  const plans = plansQ.data ?? [];
  const chosen = plans.find((p) => p.id === planChoice);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Pressable
        accessibilityLabel="Закрыть"
        onPress={() => router.back()}
        hitSlop={10}
        style={styles.grabWrap}
      >
        <View style={styles.grab} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[displayFont('600'), styles.title]}>AcademicSpace{'\n'}Premium</Text>
        <Text style={[bodyFont('400'), styles.desc]}>
          Полный ИИ-разбор, интерактивные модули, копилки документов и инструменты фокусировки.
        </Text>

        <View style={styles.perks}>
          {PREMIUM_PERKS.map((perk) => (
            <View key={perk} style={styles.perk}>
              <View style={styles.perkIcon}>
                <CheckIcon size={10} color={accent.gold} />
              </View>
              <Text style={[bodyFont('500'), styles.perkText]}>{perk}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              period={p.period}
              price={p.price}
              sub={p.sub}
              best={p.best}
              selected={planChoice === p.id}
              onPress={() => setPlanChoice(p.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label={`Оформить · ${chosen?.price ?? ''}`}
          tone="gold"
          elevated
          onPress={() => router.push('/subscription/payment')}
        />
        <Text style={[bodyFont('400'), styles.fine]}>Отмена в любой момент · оплата картой</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep, paddingHorizontal: 22 },
  grabWrap: { alignItems: 'center', paddingVertical: 10 },
  grab: { width: 52, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  content: { flexGrow: 1, justifyContent: 'center', gap: 20, paddingVertical: spacing.xl },
  title: { fontSize: 25, lineHeight: 30, color: '#FFFFFF', letterSpacing: -0.7 },
  desc: { fontSize: 13, lineHeight: 20.8, color: 'rgba(255,255,255,0.6)' },
  perks: { gap: 8 },
  perk: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  perkIcon: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(243,194,75,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  perkText: { flex: 1, fontSize: 12.5, lineHeight: 18.75, color: 'rgba(255,255,255,0.85)' },
  plans: { flexDirection: 'row', gap: 10 },
  footer: { paddingTop: 14, gap: 12 },
  fine: { fontSize: 10.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});

export default withGuard(PaywallScreen, { auth: true });
