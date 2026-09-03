/**
 * Типографика AcademicSpace — мост между токенами (`design-tokens.md`:
 * «Unbounded 500/600/700», «Manrope 400/500/600/700/800») и реальными
 * фейсами, которые грузит `@expo-google-fonts/*` через `expo-font`.
 *
 * В RN нельзя выбрать начертание кастомного шрифта через `fontWeight` —
 * каждый вес это отдельно зарегистрированный `fontFamily`. Поэтому здесь:
 *  - `FONT_MAP` — то, что скармливаем `useFonts()` (см. `hooks/useAppFonts.ts`);
 *  - `displayFont(w)` / `bodyFont(w)` — единственный способ проставить шрифт
 *    в компонентах UI-кита (никакого «на глаз», `CLAUDE.md` §10).
 */

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
} from '@expo-google-fonts/unbounded';

/** Карта для `useFonts()`. Ключ = имя фейса, значение = ассет шрифта. */
export const FONT_MAP = {
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} as const;

/** Начертания display-шрифта из `design-tokens.md`. */
export type DisplayWeight = '500' | '600' | '700';
/** Начертания текстового шрифта из `design-tokens.md`. */
export type BodyWeight = '400' | '500' | '600' | '700' | '800';

const DISPLAY_FACE: Record<DisplayWeight, keyof typeof FONT_MAP> = {
  '500': 'Unbounded_500Medium',
  '600': 'Unbounded_600SemiBold',
  '700': 'Unbounded_700Bold',
};

const BODY_FACE: Record<BodyWeight, keyof typeof FONT_MAP> = {
  '400': 'Manrope_400Regular',
  '500': 'Manrope_500Medium',
  '600': 'Manrope_600SemiBold',
  '700': 'Manrope_700Bold',
  '800': 'Manrope_800ExtraBold',
};

/**
 * Стиль для заголовков / display (`Unbounded`). letter-spacing из дизайна
 * (-0.02…-0.03em) добавляем на месте использования, т.к. он зависит от кегля.
 */
export function displayFont(weight: DisplayWeight = '600'): { fontFamily: string } {
  return { fontFamily: DISPLAY_FACE[weight] };
}

/** Стиль для основного текста / UI (`Manrope`). */
export function bodyFont(weight: BodyWeight = '400'): { fontFamily: string } {
  return { fontFamily: BODY_FACE[weight] };
}

/** Имена зарегистрированных фейсов — если нужен только строковый `fontFamily`. */
export const fontFace = {
  display: DISPLAY_FACE,
  body: BODY_FACE,
} as const;
