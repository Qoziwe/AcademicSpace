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
  /** Базовый URL будущего Flask-бекенда. Пока не используется (моки). */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  /**
   * Переключатель мок-слоя. На этапе Фаз 0–7 всегда `true`.
   * Фаза 8 (бекенд) сводится к смене адаптера при `false`.
   */
  useMocks: bool(process.env.EXPO_PUBLIC_USE_MOCKS, true),
} as const;
