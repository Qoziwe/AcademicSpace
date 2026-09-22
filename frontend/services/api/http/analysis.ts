import type { AnalysisResponse } from '@/mocks/handlers/analysis';

import { apiFetch } from './client';

export function startAnalysis(): Promise<{ analysisId: string; status: 'processing' }> {
  // Слоты PORTFOLIO_UPLOAD — мок file-picker, реальных resume/writes не
  // собирает (см. `app/ai/portfolio.tsx`) — бекенд сам берёт анкету/подбор.
  return apiFetch('POST', '/ai/portfolio');
}

export function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return apiFetch<AnalysisResponse>('GET', `/ai/analysis/${analysisId}`);
}
