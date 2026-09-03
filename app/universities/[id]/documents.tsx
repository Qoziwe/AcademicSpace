import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** REQUIRED_DOCUMENTS — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function RequiredDocumentsScreen() {
  return <ScreenStub id="REQUIRED_DOCUMENTS" />;
}

export default withGuard(RequiredDocumentsScreen, { auth: true, premium: true });
