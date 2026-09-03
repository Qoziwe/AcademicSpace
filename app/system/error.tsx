import { router } from 'expo-router';

import { SystemScreenLayout } from '@/components/organisms';
import { SYSTEM_COPY } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';

/** ERROR (`/system/error`). Общий `<SystemScreenLayout>` (`CLAUDE.md` §7). */
function ErrorScreen() {
  const c = SYSTEM_COPY.error;
  return (
    <SystemScreenLayout
      kind="error"
      title={c.title}
      text={c.text}
      detail={c.detail}
      ctaLabel={c.cta}
      onCta={() => (router.canGoBack() ? router.back() : router.replace('/dashboard'))}
    />
  );
}

export default withGuard(ErrorScreen);
