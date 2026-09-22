/**
 * Мок-сессия пользователя (Zustand + AsyncStorage).
 *
 * На этапе Фаз 1–7 настоящей авторизации нет (`CLAUDE.md` §11): `isAuthed`
 * ставится экраном `AUTH_LOADING`, `plan` переключается либо оплатой
 * (мок-стейт-машина, Фаза 3), либо dev-меню. Форма полей совпадает с тем,
 * что вернёт `/api/v1/auth/*` и `/api/v1/profile/me` (`docs/api-contract.md`).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Plan = 'free' | 'premium';

interface SessionState {
  /** Есть ли мок-сессия. Гейт для Auth-guard роутов. */
  isAuthed: boolean;
  /** Текущий тариф. Гейт для Premium-guard роутов. */
  plan: Plan;
  /**
   * JWT реального бекенда (`POST /auth/signup|signin`, Фаза 8.3). `null` на
   * моках и до первого реального входа — `services/api/http/client.ts`
   * подставляет его в `Authorization: Bearer <token>`.
   */
  token: string | null;
  /** AsyncStorage прочитан — до этого guard'ы показывают fallback, не редиректят. */
  hydrated: boolean;

  signIn: () => void;
  signOut: () => void;
  setPlan: (plan: Plan) => void;
  setToken: (token: string) => void;
  /** Полный сброс (dev-меню). */
  reset: () => void;
}

const initial = {
  isAuthed: false,
  plan: 'free' as Plan,
  token: null as string | null,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...initial,
      hydrated: false,

      signIn: () => set({ isAuthed: true }),
      signOut: () => set({ isAuthed: false, plan: 'free', token: null }),
      setPlan: (plan) => set({ plan }),
      setToken: (token) => set({ token }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'academicspace.session',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted) => ({ token: null, ...(persisted as object) }),
      partialize: (state) => ({ isAuthed: state.isAuthed, plan: state.plan, token: state.token }),
      onRehydrateStorage: () => () => {
        useSessionStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Селекторы — чтобы компоненты не подписывались на весь стор. */
export const selectIsPremium = (s: SessionState) => s.plan === 'premium';
