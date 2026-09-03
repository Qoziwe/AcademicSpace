// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * `zustand` публикует ESM-сборку (`zustand/esm/*.mjs`), где middleware
 * `devtools` содержит голый `import.meta.env`. На вебе Metro по умолчанию
 * резолвит условие `import` → берёт `.mjs`, а `import.meta` в классическом
 * (не-module) бандле — это `SyntaxError: import.meta may only appear in a
 * module`, из-за которого падает весь бандл и экран остаётся белым.
 *
 * Точечно заставляем `zustand` резолвиться в CJS-сборку (там `import.meta`
 * нет). На нативные платформы это не влияет — там и так условие
 * `react-native`.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    return context.resolveRequest(
      { ...context, unstable_conditionNames: ['require', 'react-native'] },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
