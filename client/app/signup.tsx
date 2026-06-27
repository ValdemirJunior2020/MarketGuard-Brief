import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { ComplianceNotice } from '../components/ComplianceNotice';
import { APP_NAME, TAGLINE } from '../constants/compliance';
import { signUp } from '../lib/auth';
import { registerDevice } from '../lib/api';
import { useAppStore } from '../lib/store';

export default function SignupScreen() {
  const store = useAppStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const session = await signUp(email, password);
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
      setError(err instanceof Error ? err.message : 'Unable to create account.');
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
          <Text variant="headlineSmall">Create account</Text>
          <Text>Your follows, alert time, and notification choices will be saved to your Firebase account.</Text>
          <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
          <TextInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button mode="contained" loading={loading} disabled={loading || !email || !password || !confirmPassword} onPress={submit}>
            Sign up
          </Button>
          <Button mode="text" onPress={() => router.push('/login')}>Already have an account? Sign in</Button>
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
