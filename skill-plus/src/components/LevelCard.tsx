import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LevelCardProps {
  currentLevel: number;
  totalXP: number;
  levelProgress: number;
  xpNeededForNextLevel: number;
  xpInCurrentLevel: number;
}

export function LevelCard({
  currentLevel,
  totalXP,
  levelProgress,
  xpNeededForNextLevel,
  xpInCurrentLevel,
}: LevelCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.levelCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.levelHeader}>
        <View>
          <Text style={[styles.levelTitle, { color: theme.accent }]}>Level {currentLevel}</Text>
          <Text style={[styles.levelSubtitle, { color: theme.subtext }]}>SkillPlus Mastery</Text>
        </View>
        <Text style={[styles.xpText, { color: theme.text }]}>{totalXP.toLocaleString()} Total XP</Text>
      </View>

      <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.round(levelProgress * 100)}%`, backgroundColor: theme.accent },
          ]}
        />
      </View>

      <View style={styles.progressFooter}>
        <Text style={[styles.progressSubtext, { color: theme.subtext }]}>
          {xpNeededForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}
        </Text>
        <Text style={[styles.progressSubtext, { color: theme.subtext }]}>
          {Math.round(levelProgress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  xpText: {
    fontWeight: '700',
    fontSize: 16,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 12,
  },
});