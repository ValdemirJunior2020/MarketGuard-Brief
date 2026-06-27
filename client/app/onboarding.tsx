import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { AI_DISCLOSURE, APP_NAME, DISCLAIMER, TAGLINE } from '../constants/compliance';
import { acceptDisclaimer } from '../lib/device';

export default function OnboardingScreen() {
  const [accepted, setAccepted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const continueToApp = async () => {
    if (!accepted) return;
    setSaving(true);
    await acceptDisclaimer();
    setSaving(false);
    router.replace('/signup');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="displaySmall">{APP_NAME}</Text>
        <Text variant="titleMedium">{TAGLINE}</Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Stay aware without the noise</Text>
          <Text>Follow public figures and institutions that can move markets.</Text>
          <Text>Receive AI-assisted summaries at your chosen time.</Text>
          <Text>Open sources before acting.</Text>
          <Text>This is not financial advice.</Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Required disclosure</Text>
          <Text>{DISCLAIMER}</Text>
          <Text>{AI_DISCLOSURE}</Text>
          <Checkbox.Item
            label="I understand and accept this disclosure."
            status={accepted ? 'checked' : 'unchecked'}
            onPress={() => setAccepted((value) => !value)}
            position="leading"
          />
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Account and notifications</Text>
          <Text>Create an account next so your follows and alert settings are saved. Notifications remain optional and can be enabled later in Alert Settings.</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" disabled={!accepted || saving} loading={saving} onPress={continueToApp}>
        Continue
      </Button>
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
    gap: 10
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between'
  }
});
