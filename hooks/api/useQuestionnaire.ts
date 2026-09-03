/**
 * Анкета (`POST /api/v1/questionnaire`). `useQuestionnaireStatus()` —
 * заполнена ли; `useSubmitQuestionnaire()` — фиксация, после которой
 * дашборд и подбор показывают результаты.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { questionnaireApi } from '@/services/api/questionnaire';

export function useQuestionnaireStatus() {
  return useQuery({
    queryKey: qk.questionnaire(),
    queryFn: questionnaireApi.getQuestionnaire,
  });
}

export function useSubmitQuestionnaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionnaireApi.submitQuestionnaire,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.questionnaire() });
      void qc.invalidateQueries({ queryKey: qk.universitySearch() });
    },
  });
}
