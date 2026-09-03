/**
 * Адаптер-seam ресурса «chat». Развилка мок/HTTP — по `ENV.useMocks`.
 * Создание модуля из карточки-предложения — в `services/api/tasks.ts`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/chat';

import * as http from './http/chat';

export type ChatMeta = mock.ChatMeta;

export interface ChatApi {
  getChatMeta(): Promise<ChatMeta>;
  sendMessage(text: string): Promise<void>;
}

export const chatApi: ChatApi = {
  getChatMeta: ENV.useMocks ? mock.getChatMeta : http.getChatMeta,
  sendMessage: ENV.useMocks ? mock.sendMessage : http.sendMessage,
};
