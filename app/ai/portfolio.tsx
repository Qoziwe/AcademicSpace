import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** PORTFOLIO_UPLOAD — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function PortfolioUploadScreen() {
  return <ScreenStub id="PORTFOLIO_UPLOAD" />;
}

export default withGuard(PortfolioUploadScreen, { auth: true });
