/**
 * ИИ-анализ портфолио (`POST /api/v1/ai/portfolio`,
 * `GET /api/v1/ai/analysis/:id`).
 *  - `useStartAnalysis()` — запуск (экран PORTFOLIO_UPLOAD);
 *  - `useAnalysis(id)` — результат/превью (экран ANALYSIS_PREVIEW).
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getAnalysis, startAnalysis } from '@/mocks/handlers/analysis';

export function useStartAnalysis() {
  return useMutation({ mutationFn: startAnalysis });
}

export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: qk.analysis(analysisId),
    queryFn: () => getAnalysis(analysisId),
  });
}
