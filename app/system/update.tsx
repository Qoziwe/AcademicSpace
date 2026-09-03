import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** UPDATE_REQUIRED — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function UpdateRequiredScreen() {
  return <ScreenStub id="UPDATE_REQUIRED" />;
}

export default withGuard(UpdateRequiredScreen);
