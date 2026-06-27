import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { AI_DISCLOSURE, DISCLAIMER } from '../constants/compliance';

type Props = {
  compact?: boolean;
};

export function ComplianceNotice({ compact }: Props) {
  const theme = useTheme();
  return (
    <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Card.Content style={styles.content}>
        <Text variant={compact ? 'labelLarge' : 'titleSmall'}>Information only</Text>
        <Text variant="bodySmall">{DISCLAIMER}</Text>
        {!compact && <Text variant="bodySmall">{AI_DISCLOSURE}</Text>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18
  },
  content: {
    gap: 8
  }
});
