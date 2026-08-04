import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
      style={[styles.pillCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Icon + Badge (if present) */}
      {(icon || badgeCount !== undefined) && (
        <View style={styles.topRow}>
          {icon ? <Text style={styles.cardIcon}>{icon}</Text> : null}
          {badgeCount !== undefined && (
            <View style={[styles.badgeContainer, { backgroundColor: theme.border }]}>
              <Text style={[styles.badgeText, { color: theme.accent }]}>{badgeCount}</Text>
            </View>
          )}
        </View>
      )}

      {/* Title wraps onto multiple lines automatically */}
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillCard: {
    width: 160,
    minHeight: 61, // Changed from fixed height to minHeight so it expands if text is very long
    borderRadius: 24, // Adjusted border radius slightly for a balanced capsule shape
    borderWidth: 1,
    flexDirection: 'column', // Stacks content top-to-bottom
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap', // Forces long text to drop down onto a new line
  },
  badgeContainer: {
    marginLeft: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});