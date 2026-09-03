/**
 * Мок-хендлер задач/модулей. Контракт — `docs/api-contract.md`
 * §Tasks / Modules (`GET /api/v1/tasks`,
 * `PATCH /api/v1/tasks/:taskId/items/:itemIndex`).
 */

import { delay } from '@/mocks/delay';
import type { TaskSeed } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface ApiTask {
  id: string;
  kind: string;
  title: string;
  meta: string;
  xp: number;
  isTimer: boolean;
  items: { label: string; done: boolean }[];
}

const toApi = (t: TaskSeed): ApiTask => ({
  id: t.id,
  kind: t.kind,
  title: t.title,
  meta: t.meta,
  xp: t.xp,
  isTimer: Boolean(t.isTimer),
  items: t.items.map((it) => ({ label: it.label, done: it.done })),
});

export function getTasks(): Promise<ApiTask[]> {
  return delay(useMockStore.getState().tasks.map(toApi));
}

export function getTask(taskId: string): Promise<ApiTask | null> {
  const found = useMockStore.getState().tasks.find((t) => t.id === taskId);
  return delay(found ? toApi(found) : null);
}

export interface ToggleTaskItemResponse {
  task: ApiTask | null;
  /** Модуль закрыт этим тапом (все пункты отмечены) — ушёл из активных. */
  completed: boolean;
  /** Сколько XP начислено (0, если модуль ещё в работе). */
  xpAwarded: number;
}

export function toggleTaskItem(taskId: string, itemIndex: number): Promise<ToggleTaskItemResponse> {
  const before = useMockStore.getState().tasks.find((t) => t.id === taskId);
  useMockStore.getState().toggleTaskItem(taskId, itemIndex);
  const after = useMockStore.getState().tasks.find((t) => t.id === taskId);

  const completed = Boolean(before) && !after;
  return delay({
    task: after ? toApi(after) : null,
    completed,
    xpAwarded: completed ? (before?.xp ?? 0) : 0,
  });
}

/** Создание модуля из чата (`createModule` прототипа) — добавляет задачу и помечает карточку. */
export function createChatModule(messageId: string): Promise<{ created: true }> {
  const store = useMockStore.getState();
  store.addChatModuleTask();
  store.markModuleCreated(messageId);
  return delay({ created: true });
}
