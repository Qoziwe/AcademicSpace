/**
 * Мок-хендлер чата ИИ-ментора. Контракт — `docs/api-contract.md`
 * §AI Mentor (`POST /api/v1/ai/chat/messages`).
 *
 * История сообщений и флаг набора — «стейт в моменте», живёт в
 * `mocks/store.ts` и читается экраном напрямую (`CLAUDE.md` §5).
 * `sendMessage` кладёт реплику пользователя + `typing`, через паузу —
 * фиксированный ответ ассистента (`send` прототипа). Создание модуля —
 * `mocks/handlers/tasks.ts → createChatModule`.
 */

import { delay } from '@/mocks/delay';
import { CHAT_ASSISTANT_REPLY, CHAT_QUICK_PROMPTS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface ChatMeta {
  quickPrompts: string[];
}

export function getChatMeta(): Promise<ChatMeta> {
  return delay({ quickPrompts: [...CHAT_QUICK_PROMPTS] });
}

export async function sendMessage(text: string): Promise<void> {
  const store = useMockStore.getState();
  store.appendMessage({ id: `me-${Date.now()}`, fromMe: true, text });
  store.setChatTyping(true);

  await delay(null, 1200);

  store.setChatTyping(false);
  store.appendMessage({
    id: `ai-${Date.now()}`,
    fromMe: false,
    text: CHAT_ASSISTANT_REPLY,
  });
}
