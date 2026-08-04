import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { UserSkill } from '../components/home/SkillItemCard';

interface CategoryStatsCardProps {
  skills: UserSkill[];
}

type CategorySummary = {
  category: string;
  count: number;
  percentage: number;
};

export function CategoryStatsCard({ skills }: CategoryStatsCardProps) {
  const { theme } = useTheme();

  if (skills.length === 0) {
    return null; // Don't show stats if user has no skills yet
  }

  // 1. Group skills by category and count them
  const categoryCounts: Record<string, number> = {};
  skills.forEach((skill) => {
    const cat = skill.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // 2. Format into array with calculated percentage
  const totalSkills = skills.length;
  const categoriesData: CategorySummary[] = Object.keys(categoryCounts).map((cat) => ({
    category: cat,
    count: categoryCounts[cat],
    percentage: Math.round((categoryCounts[cat] / totalSkills) * 100),
  }));

  // Sort by highest count
  categoriesData.sort((a, b) => b.count - a.count);

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Category Breakdown</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>
        Distribution across {totalSkills} active {totalSkills === 1 ? 'skill' : 'skills'}
      </Text>

      <View style={styles.statsContainer}>
        {categoriesData.map((item) => (
          <View key={item.category} style={styles.categoryRow}>
            <View style={styles.labelRow}>
              <Text style={[styles.categoryName, { color: theme.text }]}>{item.category}</Text>
              <Text style={[styles.categoryDetails, { color: theme.subtext }]}>
                {item.count} ({item.percentage}%)
              </Text>
            </View>

            {/* Category Progress Bar */}
            <View style={[styles.progressBackground, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.percentage}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  statsContainer: {
    gap: 12,
  },
  categoryRow: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryDetails: {
    fontSize: 13,
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});