import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { UserSkill } from '../../app/(tabs)/skills';

interface CompletedSkillsCardProps {
  skills: UserSkill[];
}

export function CompletedSkillsCard({ skills }: CompletedSkillsCardProps) {
  const { theme } = useTheme();

  // State to track if the user is in "See All / Drill-down" view
  const [showAll, setShowAll] = useState(false);

  if (skills.length === 0) return null; // Hide if no skills are completed yet

  // Get the single most recently completed skill (first item or last added)
  const latestSkill = skills[skills.length - 1];

  // Format time helper (e.g. 5h 20m)
  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* HEADER SECTION */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>🏆 Mastered Skills ({skills.length})</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {showAll ? 'Viewing all your completed skills' : 'Your latest achievement'}
          </Text>
        </View>

        {/* Back button or See All Toggle */}
        {showAll ? (
          <TouchableOpacity onPress={() => setShowAll(false)} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: theme.accent }]}>‹ Back</Text>
          </TouchableOpacity>
        ) : (
          skills.length > 1 && (
            <TouchableOpacity onPress={() => setShowAll(true)}>
              <Text style={[styles.seeAllBtnText, { color: theme.accent }]}>
                See All ({skills.length}) ›
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* VIEW 1: DRILL-DOWN FULL LIST (WHEN "SEE ALL" IS TAPPED) */}
      {showAll ? (
        <View style={styles.gridContainer}>
          {skills.map((skill) => (
            <TouchableOpacity
              key={skill.$id}
              style={[styles.skillRow, { backgroundColor: theme.background, borderColor: '#4caf50' }]}
              activeOpacity={0.8}
            >
              <View style={styles.checkBadge}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.skillName, { color: theme.text }]}>{skill.name}</Text>
                <Text style={[styles.skillMeta, { color: theme.subtext }]}>
                  {skill.category} • {skill.reps} reps • {formatTotalTime(skill.timeSpentSeconds)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* VIEW 2: COMPACT SINGLE LATEST SKILL VIEW (DEFAULT) */
        <TouchableOpacity
          style={[styles.featuredBadge, { backgroundColor: theme.background, borderColor: '#4caf50' }]}
          onPress={() => {
            if (skills.length > 1) setShowAll(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.checkBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.featuredSkillName, { color: theme.text }]}>{latestSkill.name}</Text>
            <Text style={[styles.skillMeta, { color: theme.subtext }]}>
              {latestSkill.category} • {latestSkill.reps} reps • {formatTotalTime(latestSkill.timeSpentSeconds)}
            </Text>
          </View>

          {skills.length > 1 && (
            <Text style={[styles.chevron, { color: theme.subtext }]}>›</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1b5e20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  featuredSkillName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  skillMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gridContainer: {
    gap: 8,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  skillName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});