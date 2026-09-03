import { QueryClient } from '@tanstack/react-query';

/**
 * Единый QueryClient приложения. Весь «серверный» стейт (пока за мок-адаптером
 * из `mocks/`, интерфейс хуков — как с реальным Flask API) идёт через него.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
