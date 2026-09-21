/**
 * Задачи/модули (`GET /api/v1/tasks`,
 * `PATCH /api/v1/tasks/:taskId/items/:itemIndex`).
 *  - `useTasks()` — список активных модулей;
 *  - `useTask(id)` — один модуль (экран MODULE_DETAIL);
 *  - `useToggleTaskItem()` — отметить/снять пункт чек-листа. Если модуль
 *    закрылся этим тапом (`completed`), инвалидируем ещё профиль (XP) и
 *    журнал — начисление уже произошло в мок-сторе.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { tasksApi } from '@/services/api/tasks';

export function useTasks() {
  return useQuery({ queryKey: qk.tasks(), queryFn: tasksApi.getTasks });
}

export function useTask(taskId: string) {
  return useQuery({ queryKey: qk.task(taskId), queryFn: () => tasksApi.getTask(taskId) });
}

export function useToggleTaskItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemIndex }: { taskId: string; itemIndex: number }) =>
      tasksApi.toggleTaskItem(taskId, itemIndex),
    onSuccess: (data, { taskId }) => {
      void qc.invalidateQueries({ queryKey: qk.tasks() });
      void qc.invalidateQueries({ queryKey: qk.task(taskId) });
      if (data.completed) {
        void qc.invalidateQueries({ queryKey: ['profile'] });
        void qc.invalidateQueries({ queryKey: qk.achievementLog() });
      }
    },
  });
}
