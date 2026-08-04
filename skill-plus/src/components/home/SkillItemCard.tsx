import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Adjust relative path if needed

export type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: string;
  reps: number;
  timeSpentSeconds: number;
};

interface SkillItemCardProps {
  skill: UserSkill;
  skillXP: number;
  skillLevel: number;
}

export function SkillItemCard({ skill, skillXP, skillLevel }: SkillItemCardProps) {
  const { theme } = useTheme();

  const difficultyColor =
    skill.difficulty === 'Advanced'
      ? '#ff5252'
      : skill.difficulty === 'Intermediate'
      ? '#ffb86c'
      : '#61dafb';

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.colorIndicator, { backgroundColor: difficultyColor }]} />
      <View style={styles.skillInfo}>
        <Text style={[styles.title, { color: theme.text }]}>{skill.name}</Text>
        <Text style={[styles.category, { color: theme.subtext }]}>
          {skill.category} • {skill.difficulty} • Lvl {skillLevel}
        </Text>
      </View>
      <View style={[styles.xpBadge, { backgroundColor: theme.border }]}>
        <Text style={styles.xpBadgeText}>+{skillXP} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,         // Reduced from 16
    borderRadius: 12,
    marginBottom: 8,     // Reduced from 12 (Saves 12px total across 3 skills)
    borderWidth: 1,
  },
  colorIndicator: {
    width: 6,            // Tightened from 8
    height: 32,          // Reduced from 38
    borderRadius: 3,
    marginRight: 10,     // Reduced from 14
  },
  skillInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,        // Tightened from 16
    fontWeight: '600',
  },
  category: {
    fontSize: 11,        // Tightened from 12
    marginTop: 1,
  },
  xpBadge: {
    paddingHorizontal: 8, // Reduced from 10
    paddingVertical: 4,   // Reduced from 6
    borderRadius: 6,
  },
  xpBadgeText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 11,
  },
});