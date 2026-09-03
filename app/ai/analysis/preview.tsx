import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** ANALYSIS_PREVIEW — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function AnalysisPreviewScreen() {
  return <ScreenStub id="ANALYSIS_PREVIEW" />;
}

export default withGuard(AnalysisPreviewScreen, { auth: true });
