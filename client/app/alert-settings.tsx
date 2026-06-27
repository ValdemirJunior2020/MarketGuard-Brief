import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Switch, Text, TextInput } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { getOrCreateDeviceId } from '../lib/device';
import { registerDevice, savePreferences } from '../lib/api';
import { requestExpoPushToken } from '../lib/notifications';
import { useAppStore } from '../lib/store';
import { useRequireAuth } from '../lib/useRequireAuth';

export default function AlertSettingsScreen() {
  const { checkingAuth } = useRequireAuth();
  const store = useAppStore();
  const [saving, setSaving] = React.useState(false);

  const enableNotifications = async () => {
    const token = await requestExpoPushToken();
    if (!token) return;

    const deviceId = await getOrCreateDeviceId();
    await registerDevice({
      deviceId,
      pushToken: token,
      platform: Platform.OS,
      timezone: store.timezone,
      alertTime: store.alertTime,
      notificationsEnabled: true
    });
    store.setNotificationsEnabled(true);
  };

  const save = async () => {
    setSaving(true);
    const deviceId = await getOrCreateDeviceId();
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
    setSaving(false);
    router.back();
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
      <Text variant="headlineMedium">Alert Settings</Text>
      <Text>Choose when and how MarketGuard Brief sends optional neutral updates.</Text>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <TextInput label="Daily alert time, 24-hour format" value={store.alertTime} onChangeText={store.setAlertTime} placeholder="08:00" />
          <TextInput label="Timezone" value={store.timezone} onChangeText={store.setTimezone} />
          <TextInput label="Quiet hours start" value={store.quietHoursStart} onChangeText={store.setQuietHoursStart} placeholder="21:00" />
          <TextInput label="Quiet hours end" value={store.quietHoursEnd} onChangeText={store.setQuietHoursEnd} placeholder="07:00" />
          <TextInput label="Alert tone" value={store.alertTone} onChangeText={store.setAlertTone} placeholder="default" />
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.switchRow}>
            <Text>Urgent alerts</Text>
            <Switch value={store.urgentAlerts} onValueChange={store.setUrgentAlerts} />
          </View>
          <View style={styles.switchRow}>
            <Text>Pause all alerts</Text>
            <Switch value={store.pauseAllAlerts} onValueChange={store.setPauseAllAlerts} />
          </View>
          <View style={styles.switchRow}>
            <Text>Notifications enabled</Text>
            <Switch value={store.notificationsEnabled} onValueChange={store.setNotificationsEnabled} />
          </View>
        </Card.Content>
      </Card>

      {!store.notificationsEnabled ? (
        <Button mode="outlined" onPress={enableNotifications}>Enable optional notifications</Button>
      ) : null}

      <Button mode="contained" loading={saving} onPress={save}>Save preferences</Button>
      <Button mode="text" onPress={() => router.back()}>Back</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22
  },
  content: {
    gap: 14
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
