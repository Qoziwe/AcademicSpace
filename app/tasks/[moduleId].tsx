import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** MODULE_DETAIL — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ModuleDetailScreen() {
  return <ScreenStub id="MODULE_DETAIL" />;
}

export default withGuard(ModuleDetailScreen, { auth: true, premium: true });
