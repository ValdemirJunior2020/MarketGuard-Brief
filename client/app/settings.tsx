import React from 'react';
import { StyleSheet, View } from 'react-native';
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
      <Card mode="contained" style={styles.hero}>
        <Card.Content style={styles.heroContent}>
          <Text variant="headlineLarge" style={styles.heroTitle}>
            Settings
          </Text>
          <Text variant="bodyLarge" style={styles.heroSubtitle}>
            Manage alerts, follows, privacy, and your MarketGuard Brief account.
          </Text>

          <View style={styles.accountPill}>
            <Text variant="labelMedium" style={styles.accountLabel}>
              Signed in
            </Text>
            <Text variant="bodyMedium" style={styles.accountEmail}>
              {session?.email}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <List.Item
            title="Notification settings"
            description="Alert time, urgent alerts, pause controls"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            onPress={() => router.push('/alert-settings')}
          />
          <Divider />

          <List.Item
            title="Follow preferences"
            description="People, institutions, sectors, and keywords"
            left={(props) => <List.Icon {...props} icon="account-search-outline" />}
            onPress={() => router.push('/follow')}
          />
          <Divider />

          <List.Item
            title="Privacy and account deletion"
            description="Data collected, delete app data, or delete your account"
            left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
            onPress={() => router.push('/privacy')}
          />
          <Divider />

          <List.Item
            title="Contact support"
            description="support@example.com placeholder"
            left={(props) => <List.Icon {...props} icon="email-outline" />}
          />
        </Card.Content>
      </Card>

      <ComplianceNotice />

      <Card mode="contained" style={styles.card}>
        <Card.Content>
          <Text variant="labelLarge">App version</Text>
          <Text>{APP_NAME} 1.0.0</Text>
        </Card.Content>
      </Card>

      <Button mode="contained-tonal" icon="delete-outline" onPress={() => router.push('/privacy')}>
        Delete account or data
      </Button>

      <Button
        mode="outlined"
        icon="logout"
        onPress={async () => {
          await signOut();
          router.replace('/login');
        }}
      >
        Sign out
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Back
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    backgroundColor: '#07111f'
  },
  heroContent: {
    gap: 14
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '900'
  },
  heroSubtitle: {
    color: '#cbd5e1'
  },
  accountPill: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(69, 212, 131, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(69, 212, 131, 0.28)'
  },
  accountLabel: {
    color: '#45d483',
    fontWeight: '800'
  },
  accountEmail: {
    color: '#ffffff'
  },
  card: {
    borderRadius: 24
  }
});