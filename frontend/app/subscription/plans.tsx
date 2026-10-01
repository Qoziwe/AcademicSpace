import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms';
import { CloseButton, PlanCard } from '@/components/molecules';
import { NavyModalFrame } from '@/components/organisms';
import { useProfile } from '@/hooks/api/useProfile';
import { usePlans } from '@/hooks/api/useSubscription';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { bodyFont, displayFont, navy, spacing } from '@/theme';

/**
 * PLAN_SELECTION (`/subscription/plans`). Лёгкий выбор тарифа без
 * маркетинга (`CLAUDE.md` §7) — вход из PAYWALL и PROFILE_SUBSCRIPTION.
 * «Оформить» → PAYMENT_FLOW. Назад → PAYWALL.
 *
 * Даунгрейд на более дешёвый тариф, пока действует уже оплаченный дорогой
 * (напр. купили «Месяц», пытаются перейти на «Неделя» до его окончания) —
 * запрещён бекендом (`POST /subscription/subscribe` → 409); карточка здесь
 * дополнительно блокируется проактивно, чтобы не гонять пользователя на
 * оплату за гарантированной ошибкой.
 *
 * Закрывается крестиком (`<CloseButton>`).
 */
function PlanSelectionScreen() {
  const insets = useSafeAreaInsets();
  const plansQ = usePlans();
  const profileQ = useProfile();
  const planChoice = useMockStore((s) => s.planChoice);
  const setPlanChoice = useMockStore((s) => s.setPlanChoice);

  const plans = plansQ.data ?? [];
  const chosen = plans.find((p) => p.id === planChoice);

  const activePlan =
    profileQ.data?.plan === 'premium'
      ? plans.find((p) => p.id === profileQ.data?.subscription?.period)
      : undefined;
  const isLocked = (planAmount: number) => !!activePlan && planAmount < activePlan.amount;
  const chosenLocked = !!chosen && isLocked(chosen.amount);

  return (
    <NavyModalFrame backgroundColor={navy.deep}>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={styles.closeRow}>
          <CloseButton onPress={backOr('/subscription/offer')} />
        </View>

        <View style={styles.body}>
          <View style={styles.headings}>
            <Text style={[displayFont('600'), styles.title]}>Выбор тарифа</Text>
            <Text style={[bodyFont('400'), styles.sub]}>
              {activePlan
                ? `Более дешёвый тариф станет доступен после ${profileQ.data?.subscription?.renewsAt}`
                : 'Сменить можно в любой момент в управлении подпиской'}
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
                disabled={isLocked(p.amount)}
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
            disabled={chosenLocked}
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
    </NavyModalFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep, paddingHorizontal: 22 },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  body: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  headings: { gap: 8 },
  title: { fontSize: 22, color: '#FFFFFF', letterSpacing: -0.6 },
  sub: { fontSize: 12.5, lineHeight: 19, color: 'rgba(255,255,255,0.55)' },
  plans: { flexDirection: 'row', gap: 10 },
  footer: { paddingTop: 14, gap: 10 },
});

export default withGuard(PlanSelectionScreen, { auth: true });
