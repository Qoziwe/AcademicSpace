import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** VAULTS_LIST — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function VaultsListScreen() {
  return <ScreenStub id="VAULTS_LIST" />;
}

export default withGuard(VaultsListScreen, { auth: true, premium: true });
