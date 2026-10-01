/**
 * Адаптер-seam ресурса «questionnaire». Развилка мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/questionnaire';

import * as http from './http/questionnaire';

export type QuestionnaireStatus = mock.QuestionnaireStatus;

/** Вход алгоритма подбора (`backend/app/services/matching`) — заполняется
 * на QUESTIONNAIRE (шаг 1 из 6), отправляется вместе с фильтрами на
 * последнем шаге мастера. */
export interface AcademicsPayload {
  gpaPercent: number;
  examSubject: string;
  examScore: number;
  languageTest: string;
  languageScore: number | null;
  achievementsCount: number;
}

export interface SubmitQuestionnairePayload {
  interests: string[];
  academics: AcademicsPayload;
  preferences: Record<string, unknown>;
}

export interface QuestionnaireApi {
  getQuestionnaire(): Promise<QuestionnaireStatus>;
  submitQuestionnaire(
    payload: SubmitQuestionnairePayload,
  ): Promise<{ questionnaireId: string; filled: true; matchesCount: number }>;
}

export const questionnaireApi: QuestionnaireApi = {
  getQuestionnaire: ENV.useMocks ? mock.getQuestionnaire : http.getQuestionnaire,
  submitQuestionnaire: ENV.useMocks ? mock.submitQuestionnaire : http.submitQuestionnaire,
};
