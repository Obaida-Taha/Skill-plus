import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  currentLevel: number;
  totalXP: number;
  streakDays: number;
  userSkillsCount: number;
}

export function ProfileStatsRow({
  currentLevel,
  totalXP,
  streakDays,
  userSkillsCount,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.statsRow}>
      {/* Pill 1: Level & XP */}
      <View style={[styles.statPill, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={[styles.statTitle, { color: theme.accent }]}>
          Lvl {currentLevel}
        </Text>
        <Text style={[styles.statSubtitle, { color: theme.subtext }]}>
          {totalXP.toLocaleString()} XP
        </Text>
      </View>

      {/* Pill 2: Streak */}
      <View style={[styles.statPill, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={[styles.statTitle, { color: theme.accent }]}>
          🔥 {streakDays} Days
        </Text>
        <Text style={[styles.statSubtitle, { color: theme.subtext }]}>
          Streak
        </Text>
      </View>

      {/* Pill 3: Active Skills */}
      <View style={[styles.statPill, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={[styles.statTitle, { color: theme.accent }]}>
          {userSkillsCount} Active
        </Text>
        <Text style={[styles.statSubtitle, { color: theme.subtext }]}>
          Skills
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});