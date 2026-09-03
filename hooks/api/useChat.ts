/**
 * Чат ИИ-ментора (`POST /api/v1/ai/chat/messages`).
 *  - `useChatMeta()` — быстрые подсказки;
 *  - `useSendMessage()` — отправка (хендлер сам добавляет реплику + ответ
 *    ассистента в мок-стор, экран читает историю из `mocks/store.ts`);
 *  - `useCreateChatModule()` — «Создать дорожную карту» из карточки-модуля.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getChatMeta, sendMessage } from '@/mocks/handlers/chat';
import { createChatModule } from '@/mocks/handlers/tasks';

export function useChatMeta() {
  return useQuery({ queryKey: qk.chat(), queryFn: getChatMeta });
}

export function useSendMessage() {
  return useMutation({ mutationFn: (text: string) => sendMessage(text) });
}

export function useCreateChatModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => createChatModule(messageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks() }),
  });
}
