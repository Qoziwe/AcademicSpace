/**
 * Глобальный тост для ошибок мутаций (`components/organisms/Toast.tsx`) —
 * единая точка показа сетевых/валидационных ошибок вместо тихого провала
 * запроса (см. `hooks/api/*` — `onError` во всех мутациях зовёт `show()`).
 * Не персистится — состояние в моменте, как `stores/focus.ts`.
 */

import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));

/** `unknown` → человекочитаемое сообщение. `apiFetch` кладёт в `Error.message`
 * уже готовый текст с бекенда (`services/api/http/client.ts`). */
export function toastMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
