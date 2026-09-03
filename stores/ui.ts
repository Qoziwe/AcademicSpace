/**
 * Локальный UI-стейт, не относящийся к сессии (Zustand).
 * Пока — только флаг офлайна для глобального баннера (дизайн-референс,
 * строки 1064–1072). Тема оформления добавится отдельным стором на Фазе 3
 * (экран Settings), см. `docs/design-tokens.md`.
 */

import { create } from 'zustand';

interface UiState {
  /** Показывать глобальный офлайн-баннер поверх контентных экранов. */
  offline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  offline: false,
  setOffline: (offline) => set({ offline }),
}));
