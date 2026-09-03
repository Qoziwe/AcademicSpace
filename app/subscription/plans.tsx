import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PLAN_SELECTION — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function PlanSelectionScreen() {
  return <ScreenStub id="PLAN_SELECTION" />;
}

export default withGuard(PlanSelectionScreen, { auth: true });
