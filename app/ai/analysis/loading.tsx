import { router } from 'expo-router';
import { useEffect } from 'react';

import { BrandLoading } from '@/components/BrandLoading';
import { withGuard } from '@/navigation/withGuard';

/**
 * ANALYSIS_LOADING (`/ai/analysis/loading`). «ИИ анализирует портфолио…» —
 * авто-переход на ANALYSIS_PREVIEW. Back отключён.
 */
function AnalysisLoadingScreen() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/ai/analysis/preview'), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrandLoading
      caption="ИИ анализирует ваше портфолио"
      sub="Считаем шансы и собираем стратегию"
    />
  );
}

export default withGuard(AnalysisLoadingScreen, { auth: true });
