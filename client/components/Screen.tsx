import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, scroll = true, refreshing, onRefresh }: ScreenProps) {
  const theme = useTheme();

  const content = <View style={styles.container}>{children}</View>;

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined
        }
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  container: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    gap: 18
  }
});