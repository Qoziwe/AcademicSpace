import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckIcon, TextField } from '@/components/atoms';
import { CloseButton } from '@/components/molecules';
import { Spin } from '@/components/motion';
import { NavyModalFrame } from '@/components/organisms';
import { useSubscribe } from '@/hooks/api/useSubscription';
import { PLANS, PREMIUM_PERKS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import { backOr } from '@/navigation/back';
import { withGuard } from '@/navigation/withGuard';
import { accent, bodyFont, displayFont, navy, radius } from '@/theme';

/** «4400123412341265» → «4400 1234 1234 1265». */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** «0928» → «09/28», не даёт ввести месяц вне 01–12. */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 2) return digits;
  const month = Math.min(Math.max(parseInt(digits.slice(0, 2), 10), 1), 12)
    .toString()
    .padStart(2, '0');
  return `${month}/${digits.slice(2)}`;
}

/**
 * PAYMENT_FLOW (`/subscription/payment`, `design-reference.html:953`).
 * Модалка, навy `navy.deep`. Стейт-машина `payState` (idle → processing →
 * success) из `mocks/store.ts`. Закрывается крестиком (`<CloseButton>`) —
 * доступен в `idle`/`success`, неактивен в `processing` (подпись под
 * заголовком честно предупреждает именно про это). Success → AI_CHAT.
 *
 * Поля карты — настоящий ввод (раньше были захардкожены `readOnly` под
 * демо-карту прототипа): «Оплатить» неактивна, пока не введён похожий на
 * настоящий номер карты, срок и CVV — платёж всё равно мок (`CLAUDE.md`
 * §11, реальный провайдер для Кыргызстана не выбран), но данные для него
 * теперь настоящие пользовательские, а не подставленные.
 */
function PaymentFlowScreen() {
  const insets = useSafeAreaInsets();
  const payState = useMockStore((s) => s.payState);
  const setPayState = useMockStore((s) => s.setPayState);
  const planChoice = useMockStore((s) => s.planChoice);
  const subscribe = useSubscribe();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');

  const plan = PLANS.find((p) => p.id === planChoice);

  const cardValid = cardNumber.replace(/\D/g, '').length === 16;
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
  const cvvValid = cvv.length === 3;
  const holderValid = holder.trim().length > 1;
  const canPay = cardValid && expiryValid && cvvValid && holderValid;

  // Свежий вход всегда начинается с idle (сбрасываем возможный залипший стейт).
  useEffect(() => {
    setPayState('idle');
  }, [setPayState]);

  const pay = () => {
    if (!canPay) return;
    setPayState('processing');
    subscribe.mutate(planChoice, {
      onSuccess: () => setPayState('success'),
      // Тост об ошибке — глобально, `providers/query-client.ts` (MutationCache.onError).
      onError: () => setPayState('idle'),
    });
  };

  return (
    <NavyModalFrame backgroundColor={navy.deep}>
      <View
        style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.closeRow}>
          <CloseButton
            onPress={backOr('/subscription/plans')}
            disabled={payState === 'processing'}
          />
        </View>

        {payState === 'idle' ? (
          <>
            <ScrollView
              style={styles.idleScrollOuter}
              contentContainerStyle={styles.idleScroll}
              showsVerticalScrollIndicator={false}
            >
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
                <TextField
                  label="Номер карты"
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="number-pad"
                  tone="onNavy"
                />
                <View style={styles.fieldsRow}>
                  <TextField
                    label="Срок"
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    placeholder="ММ/ГГ"
                    keyboardType="number-pad"
                    tone="onNavy"
                    style={styles.fieldHalf}
                  />
                  <TextField
                    label="CVV"
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    keyboardType="number-pad"
                    secureTextEntry
                    tone="onNavy"
                    style={styles.fieldHalf}
                  />
                </View>
                <TextField
                  label="Держатель карты"
                  value={holder}
                  onChangeText={(v) => setHolder(v.toUpperCase())}
                  placeholder="IVAN IVANOV"
                  autoCapitalize="characters"
                  tone="onNavy"
                />
              </View>

              <View style={styles.perks}>
                {PREMIUM_PERKS.slice(0, 3).map((perk) => (
                  <View key={perk} style={styles.perk}>
                    <View style={styles.perkIcon}>
                      <CheckIcon size={9} color={accent.gold} />
                    </View>
                    <Text style={[bodyFont('500'), styles.perkText]}>{perk}</Text>
                  </View>
                ))}
              </View>

              <Text style={[bodyFont('400'), styles.secure]}>
                Платёж защищён · списание {plan?.price ?? ''} сегодня
              </Text>
            </ScrollView>

            <Button
              label={`Оплатить ${plan?.price ?? ''}`}
              tone="gold"
              elevated
              disabled={!canPay}
              onPress={pay}
            />
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
    </NavyModalFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: navy.deep, paddingHorizontal: 22 },
  closeRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  idleScrollOuter: { flex: 1 },
  idleScroll: { flexGrow: 1, justifyContent: 'center', gap: 16, paddingVertical: 16 },
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
  fieldsRow: { flexDirection: 'row', gap: 9 },
  fieldHalf: { flex: 1 },
  perks: { gap: 8 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  perkIcon: {
    width: 16,
    height: 16,
    borderRadius: 5,
    backgroundColor: 'rgba(243,194,75,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: { flex: 1, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' },
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
