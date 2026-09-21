/**
 * Единая точка правды для брендинга AcademicSpace.
 *
 * Дизайн-референс и исходные документы используют плейсхолдер «UniPath» —
 * нигде в коде «UniPath» хардкодить нельзя (см. `CLAUDE.md` §4).
 *
 * Сырые значения лежат в `constants/brand.json`, чтобы их мог прочитать и
 * рантайм приложения (этот модуль), и `app.config.ts` (Expo транспилирует
 * только сам конфиг, но не его импорты — `.ts`-сосед оттуда не
 * подключить, а `.json` — можно).
 */

import type { ImageSourcePropType } from 'react-native';

import brandData from './brand.json';

/** Режим отрисовки лого-знака. */
export type BrandLogoMode = 'diamond' | 'image';

export interface BrandLogoConfig {
  /**
   * `diamond` — временный градиентный ромб из дизайн-референса (по умолчанию).
   * `image` — растровый/векторный логотип из брендбука.
   *
   * Чтобы подключить настоящий логотип позже: положить файл в
   * `assets/brand/logo.png`, раскомментировать `source` ниже, поменять
   * `logo.mode` в `constants/brand.json` на `"image"`. Компонент
   * `<BrandLogo>` (Фаза 2) переключается по этому полю — код экранов
   * трогать не нужно.
   */
  mode: BrandLogoMode;
  /** Используется только при `mode: 'image'`. */
  source?: ImageSourcePropType;
  /** Градиент временного ромба (из дизайна, accent.blue → accent.blueLight). */
  diamondGradient: readonly [string, string];
}

export interface Brand {
  /** Отображаемое имя приложения. */
  appName: string;
  /** Название платного тарифа. */
  premiumPlanName: string;
  /** Deep link scheme (без `://`). */
  scheme: string;
  /** iOS bundle identifier. */
  iosBundleId: string;
  /** Android package name. */
  androidPackage: string;
  /** Домен для Universal Links / App Links (уточняется, см. `docs/source/03-routes.md`). */
  webDomain: string;
  logo: BrandLogoConfig;
}

export const BRAND: Brand = {
  appName: brandData.appName,
  premiumPlanName: brandData.premiumPlanName,
  scheme: brandData.scheme,
  iosBundleId: brandData.iosBundleId,
  androidPackage: brandData.androidPackage,
  webDomain: brandData.webDomain,
  logo: {
    mode: brandData.logo.mode as BrandLogoMode,
    // source: require('../assets/brand/logo.png'),
    diamondGradient: brandData.logo.diamondGradient as [string, string],
  },
};
