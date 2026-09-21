import type { QuestionnaireStatus } from '@/mocks/handlers/questionnaire';

import { apiFetch, notImplemented } from './client';

export function getQuestionnaire(): Promise<QuestionnaireStatus> {
  return apiFetch<QuestionnaireStatus>('GET', '/questionnaire');
}

export function submitQuestionnaire(): Promise<{ questionnaireId: string; filled: true }> {
  // Тело сабмита (academics/interests/preferences) проектирует Фаза 8.
  return notImplemented('POST /questionnaire');
}
