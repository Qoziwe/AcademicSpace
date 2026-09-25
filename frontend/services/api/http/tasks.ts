import type { ApiTask, ToggleTaskItemResponse } from '@/mocks/handlers/tasks';
import { useMockStore } from '@/mocks/store';

import { apiFetch } from './client';

export function getTasks(): Promise<ApiTask[]> {
  return apiFetch<ApiTask[]>('GET', '/tasks');
}

export function getTask(taskId: string): Promise<ApiTask | null> {
  return apiFetch<ApiTask | null>('GET', `/tasks/${taskId}`);
}

export function toggleTaskItem(taskId: string, itemIndex: number): Promise<ToggleTaskItemResponse> {
  return apiFetch<ToggleTaskItemResponse>('PATCH', `/tasks/${taskId}/items/${itemIndex}`);
}

/**
 * `messageId` — реальный id `ChatMessage` (`services/api/http/chat.ts`
 * подставляет его при добавлении реплики в мок-стор). Бекенд сам знает
 * title/kind/items предложенного модуля (лежат в `message.module` с
 * момента ответа нейронки) — тут нечего передавать, кроме адреса.
 * После успеха отмечаем карточку в локальной истории чата созданной —
 * тем же мок-стором, что и `sendMessage`, история живёт только там.
 */
export async function createChatModule(messageId: string): Promise<{ created: true }> {
  await apiFetch('POST', '/ai/chat/modules', { messageId });
  useMockStore.getState().markModuleCreated(messageId);
  return { created: true };
}
