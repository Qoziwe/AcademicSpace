/**
 * Фабрика ключей TanStack Query. Один источник, чтобы инвалидация из
 * мутаций не расходилась со `useQuery`.
 */

import type { Plan } from '@/stores/session';

export const qk = {
  profile: (plan: Plan) => ['profile', plan] as const,
  questionnaire: () => ['questionnaire'] as const,
  universitySearch: () => ['universities', 'search'] as const,
  university: (id: string) => ['universities', 'detail', id] as const,
  tasks: () => ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  chat: () => ['chat'] as const,
  analysis: (id: string) => ['analysis', id] as const,
  plans: () => ['subscription', 'plans'] as const,
} as const;
