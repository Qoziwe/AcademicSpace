/**
 * Тема оформления (Zustand + AsyncStorage).
 *
 * Прототип хранит это как `dark: boolean` и переключает свитчем на экране
 * Settings (`design-tokens.md` §«Тема»). В RN держим как `theme` со
 * значениями `'light' | 'dark'`, персистентно — чтобы выбор пережил
 * перезапуск приложения. Навy-экраны (Splash / Welcome / Paywall / …)
 * тему игнорируют — см. карту в `docs/design-tokens.md`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeName } from '@/theme';

interface ThemeState {
  theme: ThemeName;
  /** AsyncStorage прочитан — до этого корневой layout держит сплэш. */
  hydrated: boolean;
  setTheme: (theme: ThemeName) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      toggle: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'academicspace.theme',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => () => {
        useThemeStore.setState({ hydrated: true });
      },
    },
  ),
);
