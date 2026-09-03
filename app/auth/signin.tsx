import { AuthScreen } from '@/components/screens/AuthScreen';
import { withGuard } from '@/navigation/withGuard';

/** AUTH_SIGNIN (`/auth/signin`). Общий экран с AUTH_SIGNUP (`CLAUDE.md` §7). */
function AuthSigninScreen() {
  return <AuthScreen mode="signin" />;
}

export default withGuard(AuthSigninScreen);
