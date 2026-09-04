import type { ExpoConfig } from 'expo/config';

import brand from './constants/brand.json';

/**
 * Динамический конфиг Expo. Всё, что касается брендинга (имя, scheme,
 * bundle id / package), берётся из `constants/brand.json` — «UniPath» нигде
 * не хардкодится (`CLAUDE.md` §4). Тот же JSON читает рантайм в
 * `constants/brand.ts`.
 */

/**
 * Подпуть для веб-сборки под GitHub Pages (project site отдаётся с
 * `/<repo>/`). Локально и в нативных сборках переменной нет → `baseUrl`
 * не проставляется, приложение живёт в корне. В `deploy-pages.yml` в неё
 * кладётся `/<имя-репозитория>`. Должна начинаться со `/` и не оканчиваться `/`.
 */
const webBaseUrl = process.env.EXPO_WEB_BASE_URL?.trim().replace(/\/$/, '');

const config: ExpoConfig = {
  name: brand.appName,
  slug: 'academicspace',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: brand.scheme,
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: brand.iosBundleId,
  },
  android: {
    package: brand.androidPackage,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: '#EDEDF1',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    // SPA, а не static: приложение мобайл-фёрст (RN-примитивы, AsyncStorage),
    // серверный пререндер не нужен и ломается на web-storage. Полноценная
    // desktop-раскладка — отдельная Фаза 7 (CLAUDE.md §9).
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#2C317A',
        dark: {
          backgroundColor: '#0B0D22',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    ...(webBaseUrl ? { baseUrl: webBaseUrl } : {}),
  },
};

export default config;
