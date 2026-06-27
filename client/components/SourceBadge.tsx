import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

type Props = {
  source?: string;
  isAiSummary?: boolean;
  riskLevel?: string;
};

export function SourceBadges({ source, isAiSummary, riskLevel }: Props) {
  return (
    <View style={styles.row}>
      {source ? <Chip compact>{source}</Chip> : null}
      {isAiSummary ? <Chip compact icon="creation">AI summary</Chip> : null}
      {riskLevel ? <Chip compact>{riskLevel} relevance</Chip> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
});
