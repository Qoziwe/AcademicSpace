import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** ERROR — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ErrorScreen() {
  return <ScreenStub id="ERROR" />;
}

export default withGuard(ErrorScreen);
