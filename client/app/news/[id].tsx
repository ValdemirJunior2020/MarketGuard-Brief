import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { Screen } from '../../components/Screen';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import { SourceBadges } from '../../components/SourceBadge';
import { getNewsItem, type NewsItem } from '../../lib/api';
import { useRequireAuth } from '../../lib/useRequireAuth';

export default function NewsDetailScreen() {
  const { checkingAuth } = useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = React.useState<NewsItem | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    getNewsItem(id)
      .then((result) => setItem(result.item))
      .catch(() => setError('This item could not be loaded from the backend.'));
  }, [id]);

  if (checkingAuth) {
    return (
      <Screen scroll={false}>
        <Text>Checking your account...</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Text variant="headlineSmall">News detail</Text>
        <Text>{error}</Text>
        <Button mode="text" onPress={() => router.back()}>Back</Button>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <Text>Loading source-linked summary...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <SourceBadges source={item.source} isAiSummary={item.isAiSummary} riskLevel={item.riskLevel} />
      <Text variant="headlineSmall">{item.title}</Text>
      <Text variant="bodySmall">Published {new Date(item.publishedAt).toLocaleString()}</Text>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">AI summary</Text>
          <Text>{item.aiSummary || item.snippet}</Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Why it may matter</Text>
          <Text>{item.whyItMatters || 'This item may be relevant to market sentiment. Review the original source before making any decision.'}</Text>
          <View style={styles.chips}>
            {item.possibleAffectedAreas.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={() => Linking.openURL(item.url)}>Open original source</Button>
      <Button mode="text" onPress={() => router.back()}>Back</Button>
      <ComplianceNotice />
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
