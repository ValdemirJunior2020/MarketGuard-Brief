import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { ComplianceNotice } from '../components/ComplianceNotice';
import { NewsCard } from '../components/NewsCard';
import { APP_NAME } from '../constants/compliance';
import { getOrCreateDeviceId } from '../lib/device';
import { getPreferences, getTodayNews, type NewsItem } from '../lib/api';
import { useRequireAuth } from '../lib/useRequireAuth';
import { useAppStore } from '../lib/store';

const previewNews: NewsItem[] = [
  {
    id: 'preview-fed',
    title: 'Federal Reserve communications to monitor',
    url: 'https://www.federalreserve.gov/newsevents.htm',
    source: 'Federal Reserve',
    publishedAt: new Date().toISOString(),
    snippet: 'Official Federal Reserve speeches, statements, minutes, and press releases can affect rate expectations and market sentiment.',
    aiSummary: 'Official Federal Reserve communications may be relevant to interest-rate expectations and broader market volatility.',
    whyItMatters: 'Rate-sensitive sectors, bond yields, banks, and broad equity sentiment can react when central bank language changes.',
    possibleAffectedAreas: ['Rates', 'Banks', 'Treasuries', 'Broad market sentiment'],
    riskLevel: 'medium',
    isAiSummary: true,
    marketRelevanceScore: 7
  },
  {
    id: 'preview-sec',
    title: 'SEC public announcements to monitor',
    url: 'https://www.sec.gov/newsroom/press-releases',
    source: 'SEC',
    publishedAt: new Date().toISOString(),
    snippet: 'SEC announcements may affect securities regulation, crypto, fintech, market structure, and company disclosure sentiment.',
    aiSummary: 'SEC updates may be relevant to regulated sectors, digital assets, fintech, and public-company compliance expectations.',
    whyItMatters: 'Regulatory language can influence risk perception across fintech, crypto-related equities, brokers, and exchanges.',
    possibleAffectedAreas: ['Regulation', 'Crypto', 'Fintech', 'Market structure'],
    riskLevel: 'medium',
    isAiSummary: true,
    marketRelevanceScore: 6
  },
  {
    id: 'preview-bls',
    title: 'Economic data releases to monitor',
    url: 'https://www.bls.gov/news.release/',
    source: 'BLS',
    publishedAt: new Date().toISOString(),
    snippet: 'Labor and inflation-related releases are commonly monitored for changes in rate expectations and economic sentiment.',
    aiSummary: 'Economic data releases can be relevant to market expectations around inflation, employment, and monetary policy.',
    whyItMatters: 'Unexpected changes in inflation or labor data may affect bond yields, rate expectations, and sector sentiment.',
    possibleAffectedAreas: ['CPI', 'Jobs', 'Rates', 'Treasuries'],
    riskLevel: 'high',
    isAiSummary: true,
    marketRelevanceScore: 8
  }
];

export default function HomeScreen() {
  const theme = useTheme();
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
      hydratePreferences({
        ...saved.preference,
        quietHoursStart: saved.preference.quietHoursStart ?? undefined,
        quietHoursEnd: saved.preference.quietHoursEnd ?? undefined
      });
    }
  } catch {
    // Keep local defaults if preferences are not available yet.
  }

  const result = await getTodayNews(deviceId);
  setItems(result.items);
  setLastUpdated(result.lastUpdated);
} catch {
  setError('Live news ingestion is not loaded yet. Showing official-source preview cards.');
  setItems([]);
  setLastUpdated(new Date().toISOString());
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

  const visibleItems = items.length > 0 ? items.slice(0, 3) : previewNews;

  const openItem = (item: NewsItem) => {
    if (item.id.startsWith('preview-')) {
      Linking.openURL(item.url);
      return;
    }

    router.push(`/news/${item.id}`);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={load}>
      <Card mode="contained" style={styles.hero}>
        <Card.Content style={styles.heroContent}>
          <View style={styles.heroTop}>
            <Chip compact style={styles.liveChip} textStyle={styles.liveChipText}>
              Market intelligence
            </Chip>
            <Text variant="labelMedium" style={styles.heroDate}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          <Text variant="headlineLarge" style={styles.heroTitle}>
            Today’s {APP_NAME}
          </Text>

          <Text variant="bodyLarge" style={styles.heroSubtitle}>
            Market-moving public remarks, official updates, and regulatory signals before they become noise.
          </Text>

          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricNumber}>
                {visibleItems.length}
              </Text>
              <Text variant="labelMedium" style={styles.metricLabel}>
                items
              </Text>
            </View>

            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricNumber}>
                {visibleItems.filter((item) => item.riskLevel === 'high').length}
              </Text>
              <Text variant="labelMedium" style={styles.metricLabel}>
                high focus
              </Text>
            </View>

            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricNumber}>
                AI
              </Text>
              <Text variant="labelMedium" style={styles.metricLabel}>
                summaries
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Text variant="titleLarge" style={{ fontWeight: '800' }}>
            Top market-watch items
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Last updated {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'waiting for sync'}
          </Text>
        </View>

        <Button mode="contained-tonal" onPress={load} loading={refreshing}>
          Refresh
        </Button>
      </View>

      {error ? (
        <Card mode="contained" style={styles.noticeCard}>
          <Card.Content>
            <Text variant="titleSmall">Preview mode</Text>
            <Text>{error}</Text>
          </Card.Content>
        </Card>
      ) : null}

      {visibleItems.map((item) => (
        <NewsCard key={item.id} item={item} onPress={() => openItem(item)} />
      ))}

      <View style={styles.actionRow}>
        <Button mode="contained" onPress={() => router.push('/follow')} style={styles.actionButton}>
          Edit follows
        </Button>
        <Button mode="outlined" onPress={() => router.push('/alert-settings')} style={styles.actionButton}>
          Alert settings
        </Button>
        <Button mode="outlined" onPress={() => router.push('/settings')} style={styles.actionButton}>
          Settings
        </Button>
      </View>

      <ComplianceNotice compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 30,
    backgroundColor: '#07111f',
    overflow: 'hidden'
  },
  heroContent: {
    gap: 18,
    paddingVertical: 10
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  liveChip: {
    backgroundColor: '#123d64'
  },
  liveChipText: {
    color: '#dff3ff',
    fontWeight: '800'
  },
  heroDate: {
    color: '#94a3b8'
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: -1
  },
  heroSubtitle: {
    color: '#cbd5e1',
    maxWidth: 720
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metricBox: {
    minWidth: 140,
    flexGrow: 1,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  metricNumber: {
    color: '#45d483',
    fontWeight: '900'
  },
  metricLabel: {
    color: '#cbd5e1'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  noticeCard: {
    borderRadius: 22,
    backgroundColor: '#eef6ff'
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  actionButton: {
    flexGrow: 1
  }
});