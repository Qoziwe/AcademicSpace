import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PAYWALL — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function PaywallScreen() {
  return <ScreenStub id="PAYWALL" />;
}

export default withGuard(PaywallScreen, { auth: true });
