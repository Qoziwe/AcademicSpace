import type { ChatMeta } from '@/mocks/handlers/chat';

import { apiFetch, notImplemented } from './client';

export function getChatMeta(): Promise<ChatMeta> {
  return apiFetch<ChatMeta>('GET', '/ai/chat/meta');
}

export function sendMessage(): Promise<void> {
  // Стриминг ответа ассистента и запись истории проектирует Фаза 8.
  return notImplemented('POST /ai/chat/messages');
}
