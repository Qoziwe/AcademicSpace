import { ScreenStub } from '@/components/dev/ScreenStub';
import { withGuard } from '@/navigation/withGuard';

/** AI_CHAT — заглушка Фазы 1. Реальная вёрстка — Фаза 3 (см. docs/screen-inventory.md). */
function AiChatScreen() {
  return <ScreenStub id="AI_CHAT" />;
}

export default withGuard(AiChatScreen, { auth: true, premium: true });
