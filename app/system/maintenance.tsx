import { router } from 'expo-router';

import { SystemScreenLayout } from '@/components/organisms';
import { SYSTEM_COPY } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';

/**
 * MAINTENANCE (`/system/maintenance`). Full-screen, back отключён
 * (`gestureEnabled: false` в root `_layout`). «Обновить статус» —
 * повторная попытка (уводим на дашборд).
 */
function MaintenanceScreen() {
  const c = SYSTEM_COPY.maintenance;
  return (
    <SystemScreenLayout
      kind="maintenance"
      title={c.title}
      text={c.text}
      detail={c.detail}
      ctaLabel={c.cta}
      onCta={() => router.replace('/dashboard')}
    />
  );
}

export default withGuard(MaintenanceScreen);
