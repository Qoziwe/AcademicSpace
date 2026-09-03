/**
 * Чат ИИ-ментора (`POST /api/v1/ai/chat/messages`).
 *  - `useChatMeta()` — быстрые подсказки;
 *  - `useSendMessage()` — отправка (адаптер сам добавляет реплику + ответ
 *    ассистента в мок-стор, экран читает историю из `mocks/store.ts`);
 *  - `useCreateChatModule()` — «Создать дорожную карту» из карточки-модуля.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { chatApi } from '@/services/api/chat';
import { tasksApi } from '@/services/api/tasks';

export function useChatMeta() {
  return useQuery({ queryKey: qk.chat(), queryFn: chatApi.getChatMeta });
}

export function useSendMessage() {
  return useMutation({ mutationFn: (text: string) => chatApi.sendMessage(text) });
}

export function useCreateChatModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => tasksApi.createChatModule(messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks() }),
  });
}
