import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_FACULTY — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FilterFacultyScreen() {
  return <ScreenStub id="FILTER_FACULTY" />;
}

export default withGuard(FilterFacultyScreen, { auth: true });
