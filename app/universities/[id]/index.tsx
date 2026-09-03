import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** UNIVERSITY_DETAILS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function UniversityDetailsScreen() {
  return <ScreenStub id="UNIVERSITY_DETAILS" />;
}

export default withGuard(UniversityDetailsScreen, { auth: true });
