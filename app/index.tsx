import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { BrandLoading } from '@/components/BrandLoading';
import { useSessionStore } from '@/stores/session';

/**
 * SPLASH (`/`). App launch → WELCOME или DASHBOARD (если есть мок-сессия).
 * Ждём гидратацию AsyncStorage + минимальную паузу, чтобы экран был виден.
 */
export default function SplashScreen() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const isAuthed = useSessionStore((s) => s.isAuthed);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (hydrated && minElapsed) {
    return <Redirect href={isAuthed ? '/dashboard' : '/welcome'} />;
  }

  return <BrandLoading caption="Запуск навигатора" />;
}
