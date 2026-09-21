/**
 * Мок-хендлер анкеты. Контракт — `docs/api-contract.md` §Questionnaire
 * (`POST /api/v1/questionnaire`).
 *
 * Форму «в моменте» (интересы, выбор фильтров) экраны держат в
 * `mocks/store.ts`; сабмит фиксирует `filled: true`.
 */

import { delay } from '@/mocks/delay';
import { QUESTIONNAIRE_GROUPS } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface QuestionnaireStatus {
  filled: boolean;
  interests: string[];
  groups: typeof QUESTIONNAIRE_GROUPS;
}

export function getQuestionnaire(): Promise<QuestionnaireStatus> {
  const s = useMockStore.getState();
  return delay({
    filled: s.questionnaireFilled,
    interests: s.interests,
    groups: QUESTIONNAIRE_GROUPS,
  });
}

export function submitQuestionnaire(): Promise<{ questionnaireId: string; filled: true }> {
  useMockStore.getState().setQuestionnaireFilled(true);
  return delay({ questionnaireId: 'q_demo', filled: true });
}
