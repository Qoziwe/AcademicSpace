/**
 * HTTP-адаптер к Flask-бекенду. Активируется, когда
 * `EXPO_PUBLIC_USE_MOCKS=false` (см. `services/api/index.ts` и
 * `constants/env.ts`). Эндпоинты — по `docs/api-contract.md`; мок-ветка
 * (`mocks/handlers/*`) не трогается.
 */

import { ENV } from '@/constants/env';
import { useSessionStore } from '@/stores/session';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * Единая точка реального запроса. JWT из `stores/session.ts` (полученный от
 * `POST /auth/signup|signin`, Фаза 8.3) подставляется в `Authorization`,
 * если сессия уже есть. `body` как `FormData` уходит multipart'ом (файлы —
 * загрузка в копилку/умные карточки), без ручного `Content-Type` — его
 * с правильным boundary проставляет сам `fetch`.
 */
export async function apiFetch<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const { token } = useSessionStore.getState();
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${ENV.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body == null ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await errorMessage(method, path, res));
  }
  return (await res.json()) as T;
}

/**
 * Бекенд отвечает на ошибки `{"error": {"code", "message"}}` (`app/errors.py`)
 * с уже готовым русским текстом для пользователя — вытаскиваем его, а не
 * заменяем на голый статус-код. Падает на дефолт, если тело не JSON
 * (сеть легла, прокси вернул html и т.п.).
 */
async function errorMessage(method: HttpMethod, path: string, res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body.error?.message) return body.error.message;
  } catch {
    // тело не JSON — используем дефолт ниже
  }
  return `${method} ${path} → HTTP ${res.status}`;
}
