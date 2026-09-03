/**
 * `useTheme()` — единая точка доступа к активной палитре для компонентов
 * UI-кита. Возвращает 7-токенную палитру (`page/screen/card/border/ink/
 * sub/chip`) плюс переключатели для экрана Settings.
 *
 * Компоненты theme-aware экранов красятся ТОЛЬКО из `palette` (см.
 * `docs/design-tokens.md` §«тема применена не везде»). Навy-компоненты
 * (`SystemScreenLayout kind=...`, `BrandLoading`, `ProfileHeaderWidget`
 * навy-шапка) палитру не используют — у них фиксированные брендовые цвета.
 */

import { useThemeStore } from '@/stores/theme';
import { palettes, type ThemeName, type ThemePalette } from '@/theme';

export interface UseTheme {
  theme: ThemeName;
  palette: ThemePalette;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggle: () => void;
}

export function useTheme(): UseTheme {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggle = useThemeStore((s) => s.toggle);

  return {
    theme,
    palette: palettes[theme],
    isDark: theme === 'dark',
    setTheme,
    toggle,
  };
}
