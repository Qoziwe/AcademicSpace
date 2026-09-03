/**
 * Адаптер-seam ресурса «tasks» (интерактивные модули). Развилка мок/HTTP —
 * по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/tasks';

import * as http from './http/tasks';

export type ApiTask = mock.ApiTask;
export type ToggleTaskItemResponse = mock.ToggleTaskItemResponse;

export interface TasksApi {
  getTasks(): Promise<ApiTask[]>;
  getTask(taskId: string): Promise<ApiTask | null>;
  toggleTaskItem(taskId: string, itemIndex: number): Promise<ToggleTaskItemResponse>;
  createChatModule(messageId: string): Promise<{ created: true }>;
}

export const tasksApi: TasksApi = {
  getTasks: ENV.useMocks ? mock.getTasks : http.getTasks,
  getTask: ENV.useMocks ? mock.getTask : http.getTask,
  toggleTaskItem: ENV.useMocks ? mock.toggleTaskItem : http.toggleTaskItem,
  createChatModule: ENV.useMocks ? mock.createChatModule : http.createChatModule,
};
