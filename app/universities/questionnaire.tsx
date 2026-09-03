import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** QUESTIONNAIRE — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function QuestionnaireScreen() {
  return <ScreenStub id="QUESTIONNAIRE" />;
}

export default withGuard(QuestionnaireScreen, { auth: true });
