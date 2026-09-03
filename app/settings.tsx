import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** SETTINGS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function SettingsScreen() {
  return <ScreenStub id="SETTINGS" />;
}

export default withGuard(SettingsScreen, { auth: true });
