import type { ApiTask, ToggleTaskItemResponse } from '@/mocks/handlers/tasks';

import { apiFetch, notImplemented } from './client';

export function getTasks(): Promise<ApiTask[]> {
  return apiFetch<ApiTask[]>('GET', '/tasks');
}

export function getTask(taskId: string): Promise<ApiTask | null> {
  return apiFetch<ApiTask | null>('GET', `/tasks/${taskId}`);
}

export function toggleTaskItem(): Promise<ToggleTaskItemResponse> {
  // Начисление XP и запись в журнал на стороне бекенда — Фаза 8.
  return notImplemented('PATCH /tasks/:taskId/items/:itemIndex');
}

export function createChatModule(): Promise<{ created: true }> {
  return notImplemented('POST /ai/chat/modules');
}
