import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** ACHIEVEMENT_LOG — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function AchievementLogScreen() {
  return <ScreenStub id="ACHIEVEMENT_LOG" />;
}

export default withGuard(AchievementLogScreen, { auth: true });
