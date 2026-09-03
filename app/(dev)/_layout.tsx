import { Redirect, Slot } from 'expo-router';

/**
 * Группа dev-only роутов. Не входит в `navigation/registry.ts`, не имеет
 * deep link в проде: вне `__DEV__` — редирект на splash. Внутри — только
 * `/playground` (визуальная сверка UI-кита Фазы 2).
 */
export default function DevLayout() {
  if (!__DEV__) return <Redirect href="/" />;
  return <Slot />;
}
