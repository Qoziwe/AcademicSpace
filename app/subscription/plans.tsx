import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { PlanCard } from '@/components/molecules';
import { usePlans } from '@/hooks/api/useSubscription';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, displayFont, navy, spacing } from '@/theme';

/**
 * PLAN_SELECTION (`/subscription/plans`). Лёгкий выбор тарифа без
 * маркетинга (`CLAUDE.md` §7) — вход из PAYWALL и PROFILE_SUBSCRIPTION.
 * «Оформить» → PAYMENT_FLOW. Назад → PAYWALL.
 */
function PlanSelectionScreen() {
  const insets = useSafeAreaInsets();
  const plansQ = usePlans();
  const planChoice = useMockStore((s) => s.planChoice);
  const setPlanChoice = useMockStore((s) => s.setPlanChoice);

  const plans = plansQ.data ?? [];
  const chosen = plans.find((p) => p.id === planChoice);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.grabWrap}>
        <View style={styles.grab} />
      </View>

      <View style={styles.body}>
        <View style={styles.headings}>
          <Text style={[displayFont('600'), styles.title]}>Выбор тарифа</Text>
          <Text style={[bodyFont('400'), styles.sub]}>
            Сменить можно в любой момент в управлении подпиской
          </Text>
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
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label={`Оформить · ${chosen?.price ?? ''}`}
          tone="gold"
          elevated
          onPress={() => router.push('/subscription/payment')}
        />
        <Button
          label="Назад"
          variant="ghost"
          size="md"
          color="rgba(255,255,255,0.8)"
          borderColor="rgba(255,255,255,0.18)"
          onPress={backOr('/subscription/offer')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep, paddingHorizontal: 22 },
  grabWrap: { alignItems: 'center', paddingVertical: 10 },
  grab: { width: 52, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  body: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  headings: { gap: 8 },
  title: { fontSize: 22, color: '#FFFFFF', letterSpacing: -0.6 },
  sub: { fontSize: 12.5, lineHeight: 19, color: 'rgba(255,255,255,0.55)' },
  plans: { flexDirection: 'row', gap: 10 },
  footer: { paddingTop: 14, gap: 10 },
});

export default withGuard(PlanSelectionScreen, { auth: true });
