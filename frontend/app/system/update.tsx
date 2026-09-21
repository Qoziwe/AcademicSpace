import { Linking } from 'react-native';

import { SystemScreenLayout } from '@/components/organisms';
import { SYSTEM_COPY } from '@/mocks/fixtures';
import { withGuard } from '@/navigation/withGuard';

/**
 * UPDATE_REQUIRED (`/system/update`). Full-screen, back отключён. Ведёт на
 * страницу магазина (мок-ссылка — реальный store-URL появится при релизе).
 */
function UpdateRequiredScreen() {
  const c = SYSTEM_COPY.update;
  return (
    <SystemScreenLayout
      kind="update"
      title={c.title}
      text={c.text}
      detail={c.detail}
      ctaLabel={c.cta}
      onCta={() => Linking.openURL('https://apps.apple.com')}
    />
  );
}

export default withGuard(UpdateRequiredScreen);
