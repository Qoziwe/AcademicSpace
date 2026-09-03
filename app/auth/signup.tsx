import { AuthScreen } from '@/components/screens/AuthScreen';
import { withGuard } from '@/navigation/withGuard';

/** AUTH_SIGNUP (`/auth/signup`). Общий экран с AUTH_SIGNIN (`CLAUDE.md` §7). */
function AuthSignupScreen() {
  return <AuthScreen mode="signup" />;
}

export default withGuard(AuthSignupScreen);
