import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PROFILE — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ProfileScreen() {
  return <ScreenStub id="PROFILE" />;
}

export default withGuard(ProfileScreen, { auth: true });
