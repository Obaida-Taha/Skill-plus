import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Adjust relative path if needed

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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  colorIndicator: {
    width: 8,
    height: 38,
    borderRadius: 4,
    marginRight: 14,
  },
  skillInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
    marginTop: 2,
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  xpBadgeText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 12,
  },
});