/**
 * `useBreakpoint()` — раскладка веба по ширине окна (Фаза 7,
 * `docs/00-roadmap.md`). Раскладка сама по себе не трогает бизнес-логику
 * экранов — только компоновку (`CLAUDE.md` §9): экраны читают `isDesktop`/
 * `isWide` и переключают JSX-структуру, данные остаются теми же хуками.
 *
 * На iOS/Android всегда `isDesktop = false` — постоянный сайдбар и
 * многоколоночные раскладки существуют только на вебе.
 */

import { Platform, useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

export interface Breakpoint {
  width: number;
  /** От `breakpoints.desktop` — сайдбар вместо плавающего таб-бара. */
  isDesktop: boolean;
  /** От `breakpoints.wide` — многоколоночная раскладка (Dashboard/Results/Vaults). */
  isWide: boolean;
}

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return {
    width,
    isDesktop: isWeb && width >= breakpoints.desktop,
    isWide: isWeb && width >= breakpoints.wide,
  };
}
