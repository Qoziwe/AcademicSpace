/**
 * ИИ-анализ портфолио (`POST /api/v1/ai/portfolio`,
 * `GET /api/v1/ai/analysis/:id`).
 *  - `useStartAnalysis()` — запуск (экран PORTFOLIO_UPLOAD);
 *  - `useAnalysis(id)` — результат/превью (экран ANALYSIS_PREVIEW).
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { analysisApi } from '@/services/api/analysis';

export function useStartAnalysis() {
  return useMutation({ mutationFn: analysisApi.startAnalysis });
}

export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: qk.analysis(analysisId),
    queryFn: () => analysisApi.getAnalysis(analysisId),
    enabled: Boolean(analysisId),
    // На реальном бекенде анализ считается в фоне — опрашиваем, пока не ready.
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });
}
