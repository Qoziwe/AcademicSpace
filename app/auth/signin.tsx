import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** AUTH_SIGNIN — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function AuthSigninScreen() {
  return <ScreenStub id="AUTH_SIGNIN" />;
}

export default withGuard(AuthSigninScreen);
