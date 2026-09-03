import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** DASHBOARD — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function DashboardScreen() {
  return <ScreenStub id="DASHBOARD" />;
}

export default withGuard(DashboardScreen, { auth: true });
