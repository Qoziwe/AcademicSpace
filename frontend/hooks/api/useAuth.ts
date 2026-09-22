/**
 * `useSignUp()` / `useSignIn()` — мутации авторизации
 * (`POST /api/v1/auth/signup|signin`). Мок-сессия (`isAuthed`) ставится
 * на экране AUTH_LOADING; здесь — «запрос» + сохранение реального JWT
 * (на моках `token` — заглушка `'mock-token'`, но пишем его всё равно,
 * чтобы `apiFetch` вело себя одинаково на обеих ветках).
 */

import { useMutation } from '@tanstack/react-query';

import { authApi, type SignInBody, type SignUpBody } from '@/services/api/auth';
import { useSessionStore } from '@/stores/session';

export function useSignUp() {
  const setToken = useSessionStore((s) => s.setToken);
  return useMutation({
    mutationFn: (body: SignUpBody) => authApi.signUp(body),
    onSuccess: (data) => setToken(data.token),
  });
}

export function useSignIn() {
  const setToken = useSessionStore((s) => s.setToken);
  return useMutation({
    mutationFn: (body: SignInBody) => authApi.signIn(body),
    onSuccess: (data) => setToken(data.token),
  });
}
