import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { ComplianceNotice } from '../components/ComplianceNotice';
import { APP_NAME, TAGLINE } from '../constants/compliance';
import { signIn } from '../lib/auth';
import { registerDevice } from '../lib/api';
import { useAppStore } from '../lib/store';

export default function LoginScreen() {
  const store = useAppStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const session = await signIn(email, password);
      try {
        const result = await registerDevice({
          deviceId: session.uid,
          email: session.email,
          pushToken: null,
          platform: 'authenticated-user',
          timezone: store.timezone,
          alertTime: store.alertTime,
          notificationsEnabled: store.notificationsEnabled
        }) as { preference?: Record<string, unknown> };
        if (result.preference) {
          store.hydratePreferences(result.preference as Partial<typeof store>);
        }
      } catch {
        // The user can still enter the app if the API is temporarily offline.
      }
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="displaySmall">{APP_NAME}</Text>
        <Text variant="titleMedium">{TAGLINE}</Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall">Sign in</Text>
          <Text>Use your email and password to access your saved follows and alert settings.</Text>
          <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button mode="contained" loading={loading} disabled={loading || !email || !password} onPress={submit}>
            Sign in
          </Button>
          <Button mode="text" onPress={() => router.push('/signup')}>Create an account</Button>
        </Card.Content>
      </Card>

      <ComplianceNotice compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    paddingTop: 10
  },
  card: {
    borderRadius: 24
  },
  content: {
    gap: 14
  },
  error: {
    color: '#c62828'
  }
});
