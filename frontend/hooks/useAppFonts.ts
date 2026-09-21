/**
 * Загрузка шрифтов Unbounded / Manrope (`theme/typography.ts` их только
 * называет). Корневой layout держит нативный сплэш, пока `fontsLoaded`
 * не станет `true` — чтобы текст не «прыгал» с системного шрифта на
 * брендовый (Фаза 2 роадмапа).
 */

import { useFonts } from 'expo-font';

import { FONT_MAP } from '@/theme';

export function useAppFonts(): { fontsLoaded: boolean } {
  const [loaded, error] = useFonts(FONT_MAP);
  // Ошибку загрузки не считаем фатальной — упадём на системный шрифт,
  // но приложение не должно залипнуть на сплэше.
  return { fontsLoaded: loaded || error != null };
}
