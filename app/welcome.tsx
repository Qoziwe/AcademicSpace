import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** WELCOME — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function WelcomeScreen() {
  return <ScreenStub id="WELCOME" />;
}

export default withGuard(WelcomeScreen);
