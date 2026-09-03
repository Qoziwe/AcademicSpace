/**
 * Адаптер-seam ресурса «questionnaire». Развилка мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/questionnaire';

import * as http from './http/questionnaire';

export type QuestionnaireStatus = mock.QuestionnaireStatus;

export interface QuestionnaireApi {
  getQuestionnaire(): Promise<QuestionnaireStatus>;
  submitQuestionnaire(): Promise<{ questionnaireId: string; filled: true }>;
}

export const questionnaireApi: QuestionnaireApi = {
  getQuestionnaire: ENV.useMocks ? mock.getQuestionnaire : http.getQuestionnaire,
  submitQuestionnaire: ENV.useMocks ? mock.submitQuestionnaire : http.submitQuestionnaire,
};
