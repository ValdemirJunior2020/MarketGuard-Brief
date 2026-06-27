import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SourceBadges } from './SourceBadge';
import type { NewsItem } from '../lib/api';

type Props = {
  item: NewsItem;
  onPress: () => void;
};

export function NewsCard({ item, onPress }: Props) {
  return (
    <Card mode="elevated" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <SourceBadges source={item.source} isAiSummary={item.isAiSummary} riskLevel={item.riskLevel} />
        <Text variant="titleMedium">{item.title}</Text>
        <Text variant="bodyMedium">{item.whyItMatters || item.aiSummary || item.snippet}</Text>
        <Text variant="labelSmall">Published {new Date(item.publishedAt).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22
  },
  content: {
    gap: 10
  }
});
