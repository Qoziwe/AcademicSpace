/**
 * `useSignUp()` / `useSignIn()` — мутации авторизации
 * (`POST /api/v1/auth/signup|signin`). Мок-сессия (`isAuthed`) ставится
 * на экране AUTH_LOADING; здесь — только «запрос».
 */

import { useMutation } from '@tanstack/react-query';

import { authApi, type SignInBody, type SignUpBody } from '@/services/api/auth';

export function useSignUp() {
  return useMutation({ mutationFn: (body: SignUpBody) => authApi.signUp(body) });
}

export function useSignIn() {
  return useMutation({ mutationFn: (body: SignInBody) => authApi.signIn(body) });
}
