/**
 * Адаптер-seam ресурса «analysis» (ИИ-разбор портфолио). Развилка
 * мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/analysis';

import * as http from './http/analysis';

export type AnalysisResponse = mock.AnalysisResponse;

export interface AnalysisApi {
  startAnalysis(): Promise<{ analysisId: string; status: 'processing' }>;
  getAnalysis(analysisId: string): Promise<AnalysisResponse>;
}

export const analysisApi: AnalysisApi = {
  startAnalysis: ENV.useMocks ? mock.startAnalysis : http.startAnalysis,
  getAnalysis: ENV.useMocks ? mock.getAnalysis : http.getAnalysis,
};
