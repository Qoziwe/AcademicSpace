import { MutationCache, QueryClient } from '@tanstack/react-query';

import { toastMessage, useToastStore } from '@/stores/toast';

/**
 * Единый QueryClient приложения. Весь «серверный» стейт (пока за мок-адаптером
 * из `mocks/`, интерфейс хуков — как с реальным Flask API) идёт через него.
 *
 * `MutationCache.onError` — единая точка показа ошибки мутации тостом
 * (`components/organisms/Toast.tsx`) вместо тихого провала запроса.
 * Срабатывает для ЛЮБОЙ мутации автоматически (включая будущие — новый
 * `useMutation` ничего специально подключать не должен), в т.ч. тех,
 * что дожидаются через `mutateAsync` в `try/catch`. Экран с собственным
 * более точным UI под ошибку (например `AuthScreen` — текст рядом с
 * кнопкой) опускает тост через `meta: { skipErrorToast: true }`
 * (`hooks/api/useAuth.ts`), чтобы не показывать одно и то же дважды.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipErrorToast) return;
      useToastStore.getState().show(toastMessage(error));
    },
  }),
});
