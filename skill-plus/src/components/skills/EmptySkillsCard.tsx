import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function EmptySkillsCard() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.emptyText, { color: theme.subtext }]}>
        No skills added yet. Go to Discover to start learning!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});