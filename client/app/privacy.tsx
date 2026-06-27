import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { AI_DISCLOSURE } from '../constants/compliance';
import { clearLocalDeviceData, getDeviceId } from '../lib/device';
import { deleteDevice } from '../lib/api';
import { useRequireAuth } from '../lib/useRequireAuth';
import { deleteAccount, signOut } from '../lib/auth';

function confirmOnWeb(message: string) {
  if (Platform.OS === 'web') {
    return window.confirm(message);
  }

  return true;
}

export default function PrivacyScreen() {
  const { checkingAuth } = useRequireAuth();
  const [deletingData, setDeletingData] = React.useState(false);
  const [deletingAccount, setDeletingAccount] = React.useState(false);

  const deleteDataOnly = async () => {
    const confirmed = confirmOnWeb('Delete your MarketGuard Brief saved preferences and device data? Your login account will remain active.');
    if (!confirmed) return;

    setDeletingData(true);

    try {
      const deviceId = await getDeviceId();

      if (deviceId) {
        try {
          await deleteDevice(deviceId);
        } catch {
          // Local deletion still proceeds if backend is temporarily unavailable.
        }
      }

      await clearLocalDeviceData();
      router.replace('/home');
    } finally {
      setDeletingData(false);
    }
  };

  const deleteFullAccount = async () => {
    const confirmed = confirmOnWeb(
      'Permanently delete your MarketGuard Brief account? This removes your app data and deletes your Firebase Authentication login.'
    );

    if (!confirmed) return;

    setDeletingAccount(true);

    try {
      const deviceId = await getDeviceId();

      if (deviceId) {
        try {
          await deleteDevice(deviceId);
        } catch {
          // Continue account deletion even if backend data deletion fails.
        }
      }

      await clearLocalDeviceData();
      await deleteAccount();
      router.replace('/signup');
    } finally {
      setDeletingAccount(false);
    }
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
      <Card mode="contained" style={styles.hero}>
        <Card.Content style={styles.heroContent}>
          <Text variant="headlineLarge" style={styles.heroTitle}>
            Privacy & Account
          </Text>
          <Text variant="bodyLarge" style={styles.heroSubtitle}>
            Control your saved preferences, notification data, and account access.
          </Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">Data collected</Text>
          <Text>• Push notification token, only if notifications are enabled.</Text>
          <Text>• Selected followed topics and people.</Text>
          <Text>• Preferred alert time.</Text>
          <Text>• Timezone.</Text>
          <Text>• Account email used for sign in and support.</Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">Why this data is collected</Text>
          <Text>
            These settings are used to build your daily brief, schedule optional alerts, and keep the app focused on the topics you choose.
          </Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">AI disclosure</Text>
          <Text>{AI_DISCLOSURE}</Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.dangerCard}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.dangerTitle}>
            Delete options
          </Text>

          <Text>
            You can delete only your saved app preferences, or permanently delete your full MarketGuard Brief account.
          </Text>

          <View style={styles.buttonGroup}>
            <Button mode="contained-tonal" icon="database-remove" loading={deletingData} onPress={deleteDataOnly}>
              Delete app data only
            </Button>

            <Button mode="contained" buttonColor="#b91c1c" icon="account-remove" loading={deletingAccount} onPress={deleteFullAccount}>
              Delete account permanently
            </Button>
          </View>
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
    gap: 12
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '900'
  },
  heroSubtitle: {
    color: '#cbd5e1'
  },
  card: {
    borderRadius: 24
  },
  cardContent: {
    gap: 10
  },
  dangerCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2'
  },
  dangerTitle: {
    color: '#991b1b',
    fontWeight: '900'
  },
  buttonGroup: {
    gap: 10,
    marginTop: 8
  }
});