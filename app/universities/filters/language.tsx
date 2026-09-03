import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FILTER_LANGUAGE — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FilterLanguageScreen() {
  return <ScreenStub id="FILTER_LANGUAGE" />;
}

export default withGuard(FilterLanguageScreen, { auth: true });
