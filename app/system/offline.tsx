import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** OFFLINE — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function OfflineScreen() {
  return <ScreenStub id="OFFLINE" />;
}

export default withGuard(OfflineScreen);
