import React from 'react';
import { router } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { AI_DISCLOSURE } from '../constants/compliance';
import { clearLocalDeviceData, getDeviceId } from '../lib/device';
import { deleteDevice } from '../lib/api';
import { useRequireAuth } from '../lib/useRequireAuth';
import { signOut } from '../lib/auth';

export default function PrivacyScreen() {
  const { checkingAuth } = useRequireAuth();
  const [deleting, setDeleting] = React.useState(false);

  const deleteData = async () => {
    setDeleting(true);
    const deviceId = await getDeviceId();
    if (deviceId) {
      try {
        await deleteDevice(deviceId);
      } catch {
        // Local deletion still proceeds if the backend is temporarily unavailable.
      }
    }
    await signOut();
    await clearLocalDeviceData();
    setDeleting(false);
    router.replace('/onboarding');
  };

  if (checkingAuth) {
    return (
      <Screen scroll={false}>
        <Text>Checking your account...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text variant="headlineMedium">Privacy</Text>

      <Card mode="elevated">
        <Card.Content>
          <Text variant="titleMedium">Data collected</Text>
          <Text>• Push notification token, only if notifications are enabled.</Text>
          <Text>• Selected followed topics and people.</Text>
          <Text>• Preferred alert time.</Text>
          <Text>• Timezone.</Text>
          <Text>• Account email used for sign in and support.</Text>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Content>
          <Text variant="titleMedium">Why this data is collected</Text>
          <Text>These settings are used to build your daily brief, schedule optional alerts, and keep the app focused on the topics you choose.</Text>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Content>
          <Text variant="titleMedium">AI disclosure</Text>
          <Text>{AI_DISCLOSURE}</Text>
        </Card.Content>
      </Card>

      <Button mode="contained-tonal" loading={deleting} onPress={deleteData}>Delete my data from this device/server</Button>
      <Button mode="text" onPress={() => router.back()}>Back</Button>
    </Screen>
  );
}
