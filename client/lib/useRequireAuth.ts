import React from 'react';
import { router } from 'expo-router';
import { getAuthSession, type AuthSession } from './auth';

export function useRequireAuth() {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    getAuthSession().then((currentSession) => {
      if (!alive) return;
      if (!currentSession) {
        router.replace('/login');
        return;
      }
      setSession(currentSession);
      setCheckingAuth(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return { session, checkingAuth };
}
