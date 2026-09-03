import { router } from 'expo-router';

import { SystemScreenLayout } from '@/components/organisms';
import { SYSTEM_COPY } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';
import { useUiStore } from '@/stores/ui';

/**
 * OFFLINE (`/system/offline`). «Продолжить офлайн» включает глобальный
 * офлайн-баннер и уводит на дашборд (прототип `sysAction`).
 */
function OfflineScreen() {
  const c = SYSTEM_COPY.offline;
  const setOffline = useUiStore((s) => s.setOffline);

  return (
    <SystemScreenLayout
      kind="offline"
      title={c.title}
      text={c.text}
      ctaLabel={c.cta}
      onCta={() => {
        setOffline(true);
        router.replace('/dashboard');
      }}
    />
  );
}

export default withGuard(OfflineScreen);
