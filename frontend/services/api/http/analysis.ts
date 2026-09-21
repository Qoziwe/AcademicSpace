import type { AnalysisResponse } from '@/mocks/handlers/analysis';

import { apiFetch, notImplemented } from './client';

export function startAnalysis(): Promise<{ analysisId: string; status: 'processing' }> {
  // Загрузка портфолио (multipart) — форму проектирует Фаза 8.
  return notImplemented('POST /ai/portfolio');
}

export function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return apiFetch<AnalysisResponse>('GET', `/ai/analysis/${analysisId}`);
}
