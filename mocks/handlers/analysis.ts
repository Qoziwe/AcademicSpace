/**
 * Мок-хендлер ИИ-анализа портфолио. Контракт — `docs/api-contract.md`
 * §AI Mentor (`POST /api/v1/ai/portfolio`, `GET /api/v1/ai/analysis/:id`).
 * Полный текст (`fullText`) в моке всегда `null` — превью-блоки размыты
 * градиентом, разблокировка — по подписке.
 */

import { delay } from '@/mocks/delay';
import { ANALYSIS_PREVIEW_BLOCKS } from '@/mocks/fixtures';

export interface AnalysisResponse {
  analysisId: string;
  status: 'processing' | 'ready';
  previewBlocks: { title: string; text: string }[];
  fullText: string | null;
}

export function startAnalysis(): Promise<{ analysisId: string; status: 'processing' }> {
  return delay({ analysisId: 'a_demo', status: 'processing' });
}

export function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return delay({
    analysisId,
    status: 'ready',
    previewBlocks: ANALYSIS_PREVIEW_BLOCKS.map((b) => ({ title: b.title, text: b.text })),
    fullText: null,
  });
}
