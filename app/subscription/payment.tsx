import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PAYMENT_FLOW — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function PaymentFlowScreen() {
  return <ScreenStub id="PAYMENT_FLOW" />;
}

export default withGuard(PaymentFlowScreen, { auth: true });
