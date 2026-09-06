/**
 * Dev-тумблеры (Zustand + AsyncStorage) — только для ручного теста, в
 * продукте значения по умолчанию. Переключаются из `<DevMenu>` (`__DEV__`).
 *
 *  - `liquidGlass` — «жидкое стекло» навбара: на web это настоящая
 *    SVG-рефракция бэкдропа (`feTurbulence` + `feDisplacementMap` в
 *    `backdrop-filter`, см. `components/organisms/LiquidGlass.tsx`), на
 *    нативе — OS-blur + блик (без преломления фона). Выключение возвращает
 *    прежний матовый navy-бар.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DevFlagsState {
  liquidGlass: boolean;
  setLiquidGlass: (v: boolean) => void;
  toggleLiquidGlass: () => void;
}

export const useDevFlags = create<DevFlagsState>()(
  persist(
    (set, get) => ({
      liquidGlass: true,
      setLiquidGlass: (liquidGlass) => set({ liquidGlass }),
      toggleLiquidGlass: () => set({ liquidGlass: !get().liquidGlass }),
    }),
    {
      name: 'academicspace.devFlags',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ liquidGlass: s.liquidGlass }),
    },
  ),
);
