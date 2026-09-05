/**
 * Дизайн-токены AcademicSpace — единственный источник визуальных констант.
 * Извлечено 1:1 из `docs/design-tokens.md` (v0.2). Ничего «на глаз» —
 * при вёрстке экранов Фазы 3 брать значения только отсюда (`CLAUDE.md` §10).
 *
 * Открытые вопросы дизайн-токенов закрыты в Фазе 0:
 *  - light/dark тема — настоящий переключатель (обе палитры ниже финальные);
 *  - веб-раскладка — отложена на Фазу 7;
 *  - логотип — временный градиентный ромб, конфиг в `constants/brand.ts`
 *    (`logo.mode`), заменяется на картинку без правок экранов.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Шрифты
// ─────────────────────────────────────────────────────────────────────────────

export const fontFamily = {
  /** Заголовки / display. letter-spacing -0.02…-0.03em. */
  display: 'Unbounded',
  /** Основной текст / UI. */
  text: 'Manrope',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Семантические токены темы (7 штук × light/dark)
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemePalette {
  /** Фон вне контента (canvas / зона статус-бара). */
  page: string;
  /** Базовый фон контентных экранов. */
  screen: string;
  /** Фон карточек. */
  card: string;
  /** Обводка карточек. */
  border: string;
  /** Основной текст. */
  ink: string;
  /** Вторичный текст. */
  sub: string;
  /** Фон чипов / мелких плашек. */
  chip: string;
}

export const lightPalette: ThemePalette = {
  page: '#EDEDF1',
  screen: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E7E9F2',
  ink: '#1B1F4B',
  sub: '#7A7F9E',
  chip: '#F4F5FA',
};

export const darkPalette: ThemePalette = {
  page: '#0B0D22',
  screen: '#12142E',
  card: '#1B1E45',
  border: 'rgba(255,255,255,0.08)',
  ink: '#EDEFFA',
  sub: 'rgba(255,255,255,0.55)',
  chip: 'rgba(255,255,255,0.07)',
};

export type ThemeName = 'light' | 'dark';

export const palettes: Record<ThemeName, ThemePalette> = {
  light: lightPalette,
  dark: darkPalette,
};

// ─────────────────────────────────────────────────────────────────────────────
// Брендовые навy-цвета — НЕ зависят от темы
// (Splash, Welcome, AuthLoading, Paywall, Focus, Payment, System-экраны)
// ─────────────────────────────────────────────────────────────────────────────

export const navy = {
  /** Splash, Welcome, верхние навy-зоны Dashboard/UniversityDetails/VaultDetail/Profile/ModuleDetail. */
  primary: '#2C317A',
  /** Paywall, аватар бота в чате, Maintenance / Update. */
  deep: '#151843',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Акценты — общие для обеих тем (осознанное решение дизайна)
// ─────────────────────────────────────────────────────────────────────────────

export const accent = {
  /** Основной интерактивный акцент. */
  blue: '#2E6BFF',
  /** Вторичный акцент на тёмном фоне. */
  blueLight: '#7C93FF',
  /** Premium / достижения. */
  gold: '#F3C24B',
  /** Success / выполнено. */
  green: '#1FB574',
  /** Ошибка / акцент. */
  rose: '#E2739B',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Радиусы — официальная шкала 14 / 20 / 24 / 32 px + мелкие xs/sm
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Отступы — 4px-база (прототип не по сетке, нормализуем при вёрстке)
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Тени — box-shadow дизайна → RN (iOS shadow* + Android elevation)
// ─────────────────────────────────────────────────────────────────────────────

export const shadow = {
  /** Карточки: 0 1px 2–3px rgba(20,24,60,.04–.07). */
  card: {
    shadowColor: 'rgba(20,24,60,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  /** Крупные CTA: 0 14–18px 30–36px -12/-14px в цвет кнопки. */
  cta: {
    shadowColor: accent.blue,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Брейкпоинты веба (Фаза 7 — desktop-адаптация, `docs/00-roadmap.md`)
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  /** От этой ширины — постоянный сайдбар вместо плавающего таб-бара. */
  desktop: 1024,
  /** От этой ширины — широкая (многоколоночная) раскладка контента. */
  wide: 1280,
} as const;

/** Ширина постоянного сайдбара на десктопе (`components/organisms/Sidebar.tsx`). */
export const SIDEBAR_WIDTH = 264;

export const tokens = {
  fontFamily,
  fontWeight,
  palettes,
  navy,
  accent,
  radius,
  spacing,
  shadow,
  breakpoints,
  SIDEBAR_WIDTH,
} as const;
