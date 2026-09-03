import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** FOCUS_TOOLS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function FocusToolsScreen() {
  return <ScreenStub id="FOCUS_TOOLS" />;
}

export default withGuard(FocusToolsScreen, { auth: true, premium: true });
