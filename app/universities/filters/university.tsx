import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_UNIVERSITY — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FilterUniversityScreen() {
  return <ScreenStub id="FILTER_UNIVERSITY" />;
}

export default withGuard(FilterUniversityScreen, { auth: true });
