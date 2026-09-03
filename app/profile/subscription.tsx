import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PROFILE_SUBSCRIPTION — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function ProfileSubscriptionScreen() {
  return <ScreenStub id="PROFILE_SUBSCRIPTION" />;
}

export default withGuard(ProfileSubscriptionScreen, { auth: true });
