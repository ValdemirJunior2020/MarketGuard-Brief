import React from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { hasAcceptedDisclaimer } from '../lib/device';
import { getAuthSession } from '../lib/auth';

export default function IndexScreen() {
  React.useEffect(() => {
    async function boot() {
      const accepted = await hasAcceptedDisclaimer();
      if (!accepted) {
        router.replace('/onboarding');
        return;
      }

      const session = await getAuthSession();
      router.replace(session ? '/home' : '/login');
    }

    boot();
  }, []);

  return (
    <Screen scroll={false}>
      <ActivityIndicator />
      <Text variant="bodyMedium">Loading MarketGuard Brief...</Text>
    </Screen>
  );
}
