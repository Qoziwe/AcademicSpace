/**
 * Задачи/модули (`GET /api/v1/tasks`,
 * `PATCH /api/v1/tasks/:taskId/items/:itemIndex`).
 *  - `useTasks()` — список активных модулей;
 *  - `useTask(id)` — один модуль (экран MODULE_DETAIL);
 *  - `useToggleTaskItem()` — отметить/снять пункт чек-листа.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getTask, getTasks, toggleTaskItem } from '@/mocks/handlers/tasks';

export function useTasks() {
  return useQuery({ queryKey: qk.tasks(), queryFn: getTasks });
}

export function useTask(taskId: string) {
  return useQuery({ queryKey: qk.task(taskId), queryFn: () => getTask(taskId) });
}

export function useToggleTaskItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemIndex }: { taskId: string; itemIndex: number }) =>
      toggleTaskItem(taskId, itemIndex),
    onSuccess: (_data, { taskId }) => {
      void qc.invalidateQueries({ queryKey: qk.tasks() });
      void qc.invalidateQueries({ queryKey: qk.task(taskId) });
    },
  });
}
