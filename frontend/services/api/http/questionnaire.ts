import type { QuestionnaireStatus } from '@/mocks/handlers/questionnaire';

import type { SubmitQuestionnairePayload } from '../questionnaire';

import { apiFetch } from './client';

export function getQuestionnaire(): Promise<QuestionnaireStatus> {
  return apiFetch<QuestionnaireStatus>('GET', '/questionnaire');
}

export function submitQuestionnaire(
  payload: SubmitQuestionnairePayload,
): Promise<{ questionnaireId: string; filled: true; matchesCount: number }> {
  return apiFetch<{ questionnaireId: string; filled: true; matchesCount: number }>(
    'POST',
    '/questionnaire',
    payload,
  );
}
