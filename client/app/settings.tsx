import React from 'react';
import { router } from 'expo-router';
import { Button, Card, Divider, List, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { ComplianceNotice } from '../components/ComplianceNotice';
import { APP_NAME } from '../constants/compliance';
import { useRequireAuth } from '../lib/useRequireAuth';
import { signOut } from '../lib/auth';

export default function SettingsScreen() {
  const { session, checkingAuth } = useRequireAuth();
  if (checkingAuth) {
    return (
      <Screen scroll={false}>
        <Text>Checking your account...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text variant="headlineMedium">Settings</Text>
      <Card mode="contained">
        <Card.Content>
          <Text variant="labelLarge">Signed in as</Text>
          <Text>{session?.email}</Text>
        </Card.Content>
      </Card>

      <Card mode="elevated">
        <Card.Content>
          <List.Item title="Notification settings" description="Alert time, urgent alerts, pause controls" left={(props) => <List.Icon {...props} icon="bell-outline" />} onPress={() => router.push('/alert-settings')} />
          <Divider />
          <List.Item title="Follow preferences" description="People, institutions, sectors, and keywords" left={(props) => <List.Icon {...props} icon="account-search-outline" />} onPress={() => router.push('/follow')} />
          <Divider />
          <List.Item title="Privacy" description="Data collected and deletion controls" left={(props) => <List.Icon {...props} icon="shield-lock-outline" />} onPress={() => router.push('/privacy')} />
          <Divider />
          <List.Item title="Contact support" description="support@example.com placeholder" left={(props) => <List.Icon {...props} icon="email-outline" />} />
        </Card.Content>
      </Card>

      <ComplianceNotice />

      <Card mode="contained">
        <Card.Content>
          <Text variant="labelLarge">App version</Text>
          <Text>{APP_NAME} 1.0.0</Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={async () => {
          await signOut();
          router.replace('/login');
        }}
      >
        Sign out
      </Button>
      <Button mode="text" onPress={() => router.back()}>Back</Button>
    </Screen>
  );
}
