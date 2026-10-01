/**
 * Мок-хендлер анкеты. Контракт — `docs/api-contract.md` §Questionnaire
 * (`POST /api/v1/questionnaire`).
 *
 * Форму «в моменте» (интересы, академические данные, выбор фильтров)
 * экраны держат в `mocks/store.ts`; сабмит фиксирует `filled: true`.
 * В отличие от реального бекенда (`app/services/matching`) мок не
 * пересчитывает подборку по формуле — просто возвращает статичный
 * `PROFILE.matchesCount` для правдоподобия демо-режима без бекенда.
 */

import { delay } from '@/mocks/delay';
import { PROFILE } from '@/mocks/fixtures';
import { type AcademicsForm, useMockStore } from '@/mocks/store';

export interface QuestionnaireStatus {
  filled: boolean;
  interests: string[];
  academics: AcademicsForm;
}

export function getQuestionnaire(): Promise<QuestionnaireStatus> {
  const s = useMockStore.getState();
  return delay({
    filled: s.questionnaireFilled,
    interests: s.interests,
    academics: s.academics,
  });
}

export function submitQuestionnaire(): Promise<{
  questionnaireId: string;
  filled: true;
  matchesCount: number;
}> {
  // Мок уже держит interests/academics/filters в `mocks/store.ts` — сабмит
  // просто фиксирует флаг, тело запроса ему не нужно.
  useMockStore.getState().setQuestionnaireFilled(true);
  return delay({ questionnaireId: 'q_demo', filled: true, matchesCount: PROFILE.matchesCount });
}
