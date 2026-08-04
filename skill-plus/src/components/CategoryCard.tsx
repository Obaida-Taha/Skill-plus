import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CategoryCardProps {
  title: string;
  icon?: string;
  badgeCount?: number;
  onPress: () => void;
}

export function CategoryCard({ title, icon, badgeCount, onPress }: CategoryCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      {icon ? <Text style={styles.cardIcon}>{icon}</Text> : null}
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      {badgeCount !== undefined && (
        <Text style={[styles.badge, { color: theme.accent }]}>{badgeCount} Skills</Text>
      )}
      <Text style={[styles.chevron, { color: theme.subtext }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardIcon: { fontSize: 20, marginRight: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 20 },
  badge: { fontSize: 12, marginRight: 8 },
});