import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckIcon, TextField } from '@/components/atoms';
import { Spin } from '@/components/motion';
import { useSubscribe } from '@/hooks/api/useSubscription';
import { PAYMENT_FIELDS, PLANS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, radius } from '@/theme';

/**
 * PAYMENT_FLOW (`/subscription/payment`, `design-reference.html:953`).
 * Модалка, навy `navy.deep`. Стейт-машина `payState` (idle → processing →
 * success) из `mocks/store.ts`. Back заблокирован (`gestureEnabled: false`
 * в root `_layout`). Success → AI_CHAT.
 */
function PaymentFlowScreen() {
  const insets = useSafeAreaInsets();
  const payState = useMockStore((s) => s.payState);
  const setPayState = useMockStore((s) => s.setPayState);
  const planChoice = useMockStore((s) => s.planChoice);
  const subscribe = useSubscribe();

  const plan = PLANS.find((p) => p.id === planChoice);

  // Свежий вход всегда начинается с idle (сбрасываем возможный залипший стейт).
  useEffect(() => {
    setPayState('idle');
  }, [setPayState]);

  const pay = () => {
    setPayState('processing');
    subscribe.mutate(planChoice, {
      onSuccess: () => setPayState('success'),
      onError: () => setPayState('idle'),
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.grabWrap}>
        <View style={styles.grab} />
      </View>

      {payState === 'idle' ? (
        <>
          <View style={styles.idleBody}>
            <View style={styles.headings}>
              <Text style={[displayFont('600'), styles.title]}>Оплата</Text>
              <Text style={[bodyFont('400'), styles.sub]}>
                Шаг назад недоступен во время обработки платежа
              </Text>
            </View>

            <View style={styles.orderCard}>
              <View style={styles.orderRow}>
                <View>
                  <Text style={[bodyFont('700'), styles.orderName]}>AcademicSpace Premium</Text>
                  <Text style={[bodyFont('400'), styles.orderMeta]}>
                    {plan?.period ?? 'Месяц'} · автопродление
                  </Text>
                </View>
                <Text style={[displayFont('600'), styles.orderPrice]}>{plan?.price ?? ''}</Text>
              </View>
            </View>

            <View style={styles.fields}>
              {PAYMENT_FIELDS.map((f) => (
                <TextField key={f.label} label={f.label} value={f.value} tone="onNavy" readOnly />
              ))}
            </View>

            <View style={styles.spacer} />
            <Text style={[bodyFont('400'), styles.secure]}>
              Платёж защищён · списание {plan?.price ?? ''} сегодня
            </Text>
          </View>

          <Button label={`Оплатить ${plan?.price ?? ''}`} tone="gold" elevated onPress={pay} />
        </>
      ) : payState === 'processing' ? (
        <View style={styles.centered}>
          <View style={styles.payRing}>
            <View style={styles.payRingBase} />
            <Spin durationMs={1000} style={styles.payRingSpin} />
          </View>
          <View style={styles.centeredText}>
            <Text style={[bodyFont('700'), styles.centeredTitle]}>Обрабатываем платёж</Text>
            <Text style={[bodyFont('400'), styles.centeredSub]}>Не закрывайте экран</Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.centered}>
            <View style={styles.successIcon}>
              <CheckIcon size={34} color={accent.green} strokeWidth={1.6} />
            </View>
            <View style={styles.centeredText}>
              <Text style={[displayFont('600'), styles.successTitle]}>Premium активирован</Text>
              <Text style={[bodyFont('400'), styles.centeredSub]}>
                Чат с ИИ-ментором разблокирован, копилки и инструменты фокусировки доступны.
              </Text>
            </View>
          </View>
          <Button
            label="Перейти в чат"
            tone="contrast"
            onPress={() => router.replace('/ai/chat')}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep, paddingHorizontal: 22 },
  grabWrap: { alignItems: 'center', paddingVertical: 10 },
  grab: { width: 52, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.16)' },
  idleBody: { flex: 1, gap: 16, paddingTop: 16 },
  headings: { gap: 8 },
  title: { fontSize: 22, color: '#FFFFFF', letterSpacing: -0.6 },
  sub: { fontSize: 12.5, color: 'rgba(255,255,255,0.55)' },
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.xl,
    padding: 16,
  },
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderName: { fontSize: 13.5, color: '#FFFFFF' },
  orderMeta: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  orderPrice: { fontSize: 18, color: '#FFFFFF' },
  fields: { gap: 9 },
  spacer: { flex: 1 },
  secure: { fontSize: 10.5, lineHeight: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  payRing: { width: 88, height: 88 },
  payRingBase: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  payRingSpin: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: accent.gold,
  },
  centeredText: { alignItems: 'center', gap: 10, paddingHorizontal: 20 },
  centeredTitle: { fontSize: 15, color: '#FFFFFF' },
  centeredSub: {
    fontSize: 12.5,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(31,181,116,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 20, color: '#FFFFFF', letterSpacing: -0.4 },
});

export default withGuard(PaymentFlowScreen, { auth: true });
