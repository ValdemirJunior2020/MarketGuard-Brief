import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Chip, Text, TextInput } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { DEFAULT_TARGETS, FOLLOW_CATEGORIES } from '../constants/followTargets';
import { getOrCreateDeviceId } from '../lib/device';
import { getFollowTargets, savePreferences } from '../lib/api';
import { useAppStore } from '../lib/store';
import { useRequireAuth } from '../lib/useRequireAuth';

export default function FollowScreen() {
  const { checkingAuth } = useRequireAuth();
  const store = useAppStore();
  const [targets, setTargets] = React.useState(DEFAULT_TARGETS);
  const [keyword, setKeyword] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getFollowTargets().then((result) => {
      if (Array.isArray((result as { targets?: typeof DEFAULT_TARGETS }).targets)) {
        setTargets((result as { targets: typeof DEFAULT_TARGETS }).targets);
      }
    });
  }, []);

  const addKeyword = () => {
    const clean = keyword.trim();
    if (!clean || store.customKeywords.includes(clean)) return;
    store.setCustomKeywords([...store.customKeywords, clean]);
    setKeyword('');
  };

  const save = async () => {
    setSaving(true);
    const deviceId = await getOrCreateDeviceId();
    try {
      await savePreferences({
        deviceId,
        selectedTargetIds: store.selectedTargetIds,
        customKeywords: store.customKeywords,
        alertTime: store.alertTime,
        timezone: store.timezone,
        urgentAlerts: store.urgentAlerts,
        quietHoursStart: store.quietHoursStart,
        quietHoursEnd: store.quietHoursEnd,
        alertTone: store.alertTone,
        pauseAllAlerts: store.pauseAllAlerts,
        notificationsEnabled: store.notificationsEnabled
      });
      router.back();
    } finally {
      setSaving(false);
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
      <Text variant="headlineMedium">Follow</Text>
      <Text>Select public sources and topics you want included in your daily brief.</Text>

      {FOLLOW_CATEGORIES.filter((category) => category !== 'Custom Keywords').map((category) => (
        <Card key={category} mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{category}</Text>
            {targets
              .filter((target) => target.category === category)
              .map((target) => (
                <Checkbox.Item
                  key={target.id}
                  label={target.name}
                  status={store.selectedTargetIds.includes(target.id) ? 'checked' : 'unchecked'}
                  onPress={() => store.toggleTarget(target.id)}
                  description={target.description}
                  position="leading"
                />
              ))}
          </Card.Content>
        </Card>
      ))}

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Custom Keywords</Text>
          <TextInput
            label="Keyword or phrase"
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="done"
            onSubmitEditing={addKeyword}
          />
          <Button mode="outlined" onPress={addKeyword}>Add keyword</Button>
          <View style={styles.chips}>
            {store.customKeywords.map((item) => (
              <Chip
                key={item}
                onClose={() => store.setCustomKeywords(store.customKeywords.filter((value) => value !== item))}
              >
                {item}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" loading={saving} onPress={save}>Save follows</Button>
      <Button mode="text" onPress={() => router.back()}>Back</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22
  },
  content: {
    gap: 12
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
});
