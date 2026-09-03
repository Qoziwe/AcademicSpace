import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_COST — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FilterCostScreen() {
  return <ScreenStub id="FILTER_COST" />;
}

export default withGuard(FilterCostScreen, { auth: true });
