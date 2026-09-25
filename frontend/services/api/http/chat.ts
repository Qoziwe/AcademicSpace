import type { ChatModule } from '@/components/organisms/ChatThread';
import type { ChatMeta } from '@/mocks/handlers/chat';
import { useMockStore } from '@/mocks/store';

import { apiFetch } from './client';

export function getChatMeta(): Promise<ChatMeta> {
  return apiFetch<ChatMeta>('GET', '/ai/chat/meta');
}

interface ChatReplyResponse {
  reply: { id: string; text: string; module: ChatModule | null };
}

/**
 * История чата — «состояние в моменте» в `mocks/store.ts` (как
 * interests/filters, `CLAUDE.md` §5) даже на реальном бекенде: экран читает
 * её напрямую, а не через TanStack Query. Здесь она же используется как
 * единственное хранилище истории — совпадает с мок-веткой построчно.
 *
 * `reply.id` — настоящий id `ChatMessage` на бекенде (не клиентский
 * `Date.now()`, как у эхо-реплики пользователя) — по нему `createChatModule`
 * (`./tasks.ts`) находит на сервере, какой именно модуль подтверждать.
 */
export async function sendMessage(text: string): Promise<void> {
  const store = useMockStore.getState();
  store.appendMessage({ id: `me-${Date.now()}`, fromMe: true, text });
  store.setChatTyping(true);

  try {
    const { reply } = await apiFetch<ChatReplyResponse>('POST', '/ai/chat/messages', { text });
    store.appendMessage({
      id: reply.id,
      fromMe: false,
      text: reply.text,
      module: reply.module ?? undefined,
    });
  } finally {
    store.setChatTyping(false);
  }
}
