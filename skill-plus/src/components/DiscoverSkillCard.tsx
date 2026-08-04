import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type SkillItem = {
  $id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: string;
  description: string;
  subCategory: string;
  category: string;
};

interface DiscoverSkillCardProps {
  skill: SkillItem;
  showCategoryMeta?: boolean;
  onPress: () => void;
}

export function DiscoverSkillCard({ skill, showCategoryMeta = false, onPress }: DiscoverSkillCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.skillCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.skillName, { color: theme.text }]}>{skill.name}</Text>
        <Text style={[styles.skillMeta, { color: theme.subtext }]}>
          {showCategoryMeta
            ? `${skill.category} • ${skill.subCategory} • ${skill.difficulty} • ~${skill.estimatedHours}`
            : `${skill.difficulty} • ~${skill.estimatedHours}`}
        </Text>
      </View>
      <Text style={[styles.infoBadge, { color: theme.accent }]}>Info</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  skillCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  skillName: { fontSize: 16, fontWeight: '600' },
  skillMeta: { fontSize: 12, marginTop: 4 },
  infoBadge: { fontSize: 13, fontWeight: 'bold' },
});