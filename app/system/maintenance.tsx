import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** MAINTENANCE — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function MaintenanceScreen() {
  return <ScreenStub id="MAINTENANCE" />;
}

export default withGuard(MaintenanceScreen);
