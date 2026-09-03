import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** ACTIVE_TASKS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ActiveTasksScreen() {
  return <ScreenStub id="ACTIVE_TASKS" />;
}

export default withGuard(ActiveTasksScreen, { auth: true, premium: true });
