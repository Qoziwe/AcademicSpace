/**
 * HTTP-адаптер к будущему Flask-бекенду. Активируется, когда
 * `EXPO_PUBLIC_USE_MOCKS=false` (см. `services/api/index.ts` и
 * `constants/env.ts`).
 *
 * На Фазах 0–7 бекенда физически нет: GET-чтения тут собраны «по форме»
 * (готовый `apiFetch` к `ENV.apiBaseUrl`, эндпоинты — из
 * `docs/api-contract.md`), а мутации с побочными эффектами помечены
 * `notImplemented()` — их семантику проектирует Фаза 8. Мок-ветка
 * (`mocks/handlers/*`) при этом не трогается.
 */

import { ENV } from '@/constants/env';
import { useSessionStore } from '@/stores/session';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(
      `Реальный бекенд ещё не подключён: ${what}. ` +
        `Оставьте EXPO_PUBLIC_USE_MOCKS=true до Фазы 8.`,
    );
    this.name = 'NotImplementedError';
  }
}

/** Заглушка для эндпоинтов, которые Фаза 8 будет проектировать заново. */
export function notImplemented(what: string): never {
  throw new NotImplementedError(what);
}

/**
 * Единая точка реального запроса. JWT из `stores/session.ts` (полученный от
 * `POST /auth/signup|signin`, Фаза 8.3) подставляется в `Authorization`,
 * если сессия уже есть.
 */
export async function apiFetch<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const { token } = useSessionStore.getState();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${ENV.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`${method} ${path} → HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
