import type { QuestionnaireStatus } from '@/mocks/handlers/questionnaire';

import { apiFetch } from './client';

export function getQuestionnaire(): Promise<QuestionnaireStatus> {
  return apiFetch<QuestionnaireStatus>('GET', '/questionnaire');
}

export function submitQuestionnaire(payload: {
  interests: string[];
  preferences: Record<string, unknown>;
}): Promise<{ questionnaireId: string; filled: true }> {
  return apiFetch<{ questionnaireId: string; filled: true }>('POST', '/questionnaire', payload);
}
