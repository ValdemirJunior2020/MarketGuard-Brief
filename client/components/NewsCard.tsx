import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SourceBadges } from './SourceBadge';
import type { NewsItem } from '../lib/api';

type Props = {
  item: NewsItem;
  onPress: () => void;
};

function riskColor(risk: NewsItem['riskLevel']) {
  if (risk === 'high') return '#f97316';
  if (risk === 'medium') return '#38bdf8';
  return '#22c55e';
}

export function NewsCard({ item, onPress }: Props) {
  const theme = useTheme();
  const color = riskColor(item.riskLevel);

  return (
    <Card
      mode="elevated"
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? '#10243c' : '#ffffff',
          borderColor: theme.dark ? '#1e3a5f' : '#dbeafe'
        }
      ]}
      onPress={onPress}
    >
      <View style={[styles.accent, { backgroundColor: color }]} />
      <Card.Content style={styles.content}>
        <SourceBadges source={item.source} isAiSummary={item.isAiSummary} riskLevel={item.riskLevel} />

        <Text variant="titleMedium" style={styles.title}>
          {item.title}
        </Text>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {item.whyItMatters || item.aiSummary || item.snippet}
        </Text>

        <View style={styles.footer}>
          <Text variant="labelSmall">Published {new Date(item.publishedAt).toLocaleString()}</Text>
          <Text variant="labelSmall">Source linked</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden'
  },
  accent: {
    height: 5,
    width: '100%'
  },
  content: {
    gap: 10,
    paddingTop: 14
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2
  },
  footer: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap'
  }
});