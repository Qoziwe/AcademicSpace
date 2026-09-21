/**
 * Таймер сессии фокуса и выбранный фоновый звук (`CLAUDE.md` §5 — стейт в
 * моменте). Прототип: `timer: 1500, running: false, sound: null` +
 * `setInterval` в `componentDidMount`, декремент пока `running`.
 *
 * Используется на FOCUS_TOOLS и на MODULE_DETAIL (вариант kind=ТАЙМЕР).
 * Не персистится — «живой» таймер восстанавливать смысла нет.
 */

import { create } from 'zustand';

import { FOCUS_DEFAULT_SECONDS } from '@/mocks/fixtures';

interface FocusState {
  seconds: number;
  running: boolean;
  /** Индекс активного звука из `FOCUS_SOUNDS` или `null`. */
  activeSound: number | null;

  toggleRunning: () => void;
  reset: () => void;
  tick: () => void;
  setSound: (index: number | null) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  seconds: FOCUS_DEFAULT_SECONDS,
  running: false,
  activeSound: null,

  toggleRunning: () => set((s) => ({ running: !s.running })),
  reset: () => set({ seconds: FOCUS_DEFAULT_SECONDS, running: false }),
  tick: () => set((s) => (s.running && s.seconds > 0 ? { seconds: s.seconds - 1 } : s)),
  setSound: (index) => set({ activeSound: index }),
}));

// Единый тикер на всё приложение (как `this.iv` в прототипе).
if (typeof setInterval === 'function') {
  setInterval(() => useFocusStore.getState().tick(), 1000);
}

/** `mm:ss` из секунд. */
export function formatClock(totalSeconds: number): string {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
