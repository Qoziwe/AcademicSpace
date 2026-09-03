import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** AUTH_SIGNUP — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function AuthSignupScreen() {
  return <ScreenStub id="AUTH_SIGNUP" />;
}

export default withGuard(AuthSignupScreen);
