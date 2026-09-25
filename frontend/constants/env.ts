/**
 * Типобезопасный доступ к публичным переменным окружения.
 *
 * Секреты сюда не попадают — только `EXPO_PUBLIC_*` (см. `CLAUDE.md` §5).
 * Значения инлайнятся Expo на этапе сборки, поэтому обращаемся к
 * `process.env.EXPO_PUBLIC_*` по полному имени, а не по вычисляемому ключу.
 */

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const ENV = {
  /** Базовый URL Flask-бекенда (см. `backend/README.md`). */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  /** Переключатель мок-слоя — `false` уходит на реальный бекенд, Фазы 8.3–8.9 реализованы. */
  useMocks: bool(process.env.EXPO_PUBLIC_USE_MOCKS, true),
} as const;
