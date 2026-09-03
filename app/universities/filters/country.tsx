import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_COUNTRY — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FilterCountryScreen() {
  return <ScreenStub id="FILTER_COUNTRY" />;
}

export default withGuard(FilterCountryScreen, { auth: true });
