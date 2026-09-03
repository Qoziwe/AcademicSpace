/**
 * `useSignUp()` / `useSignIn()` — мутации авторизации
 * (`POST /api/v1/auth/signup|signin`). Мок-сессия (`isAuthed`) ставится
 * на экране AUTH_LOADING; здесь — только «запрос».
 */

import { useMutation } from '@tanstack/react-query';

import { signIn, signUp, type SignInBody, type SignUpBody } from '@/mocks/handlers/auth';

export function useSignUp() {
  return useMutation({ mutationFn: (body: SignUpBody) => signUp(body) });
}

export function useSignIn() {
  return useMutation({ mutationFn: (body: SignInBody) => signIn(body) });
}
