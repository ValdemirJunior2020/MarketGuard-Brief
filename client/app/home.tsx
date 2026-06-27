import React from 'react';
import { router } from 'expo-router';
import { Button, Card, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { ComplianceNotice } from '../components/ComplianceNotice';
import { NewsCard } from '../components/NewsCard';
import { APP_NAME } from '../constants/compliance';
import { getOrCreateDeviceId } from '../lib/device';
import { getPreferences, getTodayNews, type NewsItem } from '../lib/api';
import { useRequireAuth } from '../lib/useRequireAuth';
import { useAppStore } from '../lib/store';

export default function HomeScreen() {
  const { checkingAuth } = useRequireAuth();
  const hydratePreferences = useAppStore((state) => state.hydratePreferences);
  const [items, setItems] = React.useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const deviceId = await getOrCreateDeviceId();
      try {
        const saved = await getPreferences(deviceId);
        if (saved.preference) {
          hydratePreferences(saved.preference);
        }
      } catch {
        // Keep local defaults if saved preferences cannot be loaded.
      }
      const result = await getTodayNews(deviceId);
      setItems(result.items);
      setLastUpdated(result.lastUpdated);
    } catch {
      setError('No live brief is available yet. Connect the backend and run news ingestion to populate today’s brief.');
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [hydratePreferences]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (checkingAuth) {
    return (
      <Screen scroll={false}>
        <Text>Checking your account...</Text>
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineMedium">Today’s {APP_NAME}</Text>
      <Text variant="bodyMedium">Top public remarks and official updates that may affect sentiment or volatility.</Text>

      <Card mode="contained">
        <Card.Content>
          <Text variant="labelLarge">Last updated</Text>
          <Text>{lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Waiting for first backend sync'}</Text>
        </Card.Content>
      </Card>

      {error ? (
        <Card mode="contained">
          <Card.Content>
            <Text>{error}</Text>
          </Card.Content>
        </Card>
      ) : null}

      {items.slice(0, 3).map((item) => (
        <NewsCard key={item.id} item={item} onPress={() => router.push(`/news/${item.id}`)} />
      ))}

      {items.length === 0 ? (
        <Card mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">No items yet</Text>
            <Text>Run `/api/admin/ingest-news` from the backend after adding official RSS sources.</Text>
          </Card.Content>
        </Card>
      ) : null}

      <Button mode="outlined" onPress={() => router.push('/follow')}>Edit follows</Button>
      <Button mode="outlined" onPress={() => router.push('/alert-settings')}>Alert settings</Button>
      <Button mode="text" onPress={() => router.push('/settings')}>Settings</Button>

      <ComplianceNotice compact />
    </Screen>
  );
}
