import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** VAULT_DETAIL — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function VaultDetailScreen() {
  return <ScreenStub id="VAULT_DETAIL" />;
}

export default withGuard(VaultDetailScreen, { auth: true, premium: true });
