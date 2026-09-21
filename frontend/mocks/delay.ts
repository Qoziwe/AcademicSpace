/**
 * Небольшая задержка для мок-хендлеров — чтобы TanStack Query проходил
 * через `isLoading`/`isPending`, как это будет с реальным Flask.
 */
export function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
