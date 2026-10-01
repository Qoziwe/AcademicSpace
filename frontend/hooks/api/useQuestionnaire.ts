/**
 * Анкета (`POST /api/v1/questionnaire`). `useQuestionnaireStatus()` —
 * заполнена ли; `useSubmitQuestionnaire()` — фиксация, после которой
 * дашборд и подбор показывают результаты.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { questionnaireApi, type SubmitQuestionnairePayload } from '@/services/api/questionnaire';

export function useQuestionnaireStatus() {
  return useQuery({
    queryKey: qk.questionnaire(),
    queryFn: questionnaireApi.getQuestionnaire,
  });
}

export function useSubmitQuestionnaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitQuestionnairePayload) =>
      questionnaireApi.submitQuestionnaire(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.questionnaire() });
      void qc.invalidateQueries({ queryKey: qk.universitySearch() });
      // `qk.profile` ключуется по тарифу (`Plan`) — инвалидируем по
      // общему префиксу, не зная тариф здесь (rating/matchesCount меняются
      // пересчётом подборки на бэкенде).
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
