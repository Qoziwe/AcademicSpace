import { router } from 'expo-router';
import { useEffect } from 'react';

import { BrandLoading } from '@/components/BrandLoading';
import { withGuard } from '@/navigation/withGuard';
import { useSessionStore } from '@/stores/session';

/**
 * AUTH_LOADING (`/auth/loading`). «Ваш навигатор активирован» — 2.5s, затем
 * авто-переход на DASHBOARD. Back отключён (`gestureEnabled: false` в
 * root `_layout`, здесь — `replace`, не `push`).
 */
function AuthLoadingScreen() {
  const signIn = useSessionStore((s) => s.signIn);

  useEffect(() => {
    const t = setTimeout(() => {
      signIn();
      router.replace('/dashboard');
    }, 2500);
    return () => clearTimeout(t);
  }, [signIn]);

  return (
    <BrandLoading caption="Ваш навигатор активирован" sub="Готовим персональное пространство" />
  );
}

export default withGuard(AuthLoadingScreen);
