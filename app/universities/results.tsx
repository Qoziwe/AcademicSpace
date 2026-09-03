import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** RESULTS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ResultsScreen() {
  return <ScreenStub id="RESULTS" />;
}

export default withGuard(ResultsScreen, { auth: true });
