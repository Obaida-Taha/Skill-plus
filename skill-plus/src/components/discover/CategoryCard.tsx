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

  // Type-safe check using optional chaining to avoid TS(18048)
  const hasValidIcon =
    typeof icon === 'string' &&
    icon !== 'null' &&
    icon !== 'NULL' &&
    icon.trim() !== '';

  return (
    <TouchableOpacity
      style={[styles.pillCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Icon + Badge (if present) */}
      {(hasValidIcon || badgeCount !== undefined) && (
        <View style={styles.topRow}>
          {hasValidIcon ? <Text style={styles.cardIcon}>{icon}</Text> : null}
          {badgeCount !== undefined && (
            <View style={[styles.badgeContainer, { backgroundColor: theme.border }]}>
              <Text style={[styles.badgeText, { color: theme.accent }]}>{badgeCount}</Text>
            </View>
          )}
        </View>
      )}

      {/* Title */}
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillCard: {
    width: 160,
    minHeight: 61,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'column',
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
    flexWrap: 'wrap',
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