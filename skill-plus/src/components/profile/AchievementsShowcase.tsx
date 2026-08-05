import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Achievement } from '../../utils/achievements';

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

type CategoryFilter = 'all' | 'reps' | 'time' | 'mastery';

export function AchievementsShowcase({ achievements = [] }: AchievementsShowcaseProps) {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<CategoryFilter>('all');

  if (!achievements || achievements.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.subtext, textAlign: 'center', padding: 12 }}>
          Loading achievements...
        </Text>
      </View>
    );
  }

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  
  // Filter achievements based on selected category tab
  const filteredAchievements = achievements.filter((a) => {
    if (activeTab === 'all') return true;
    return a.category === activeTab;
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* 1. Trophy Room Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>🎖️ Achievements</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {unlockedCount} of {achievements.length} Unlocked
          </Text>
        </View>
        <View style={[styles.badgeCounter, { backgroundColor: theme.accent }]}>
          <Text style={[styles.badgeCounterText, { color: isDark ? '#000000' : '#ffffff' }]}>
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </Text>
        </View>
      </View>

      {/* 2. Category Breadcrumb / Filter Tabs */}
      <View style={styles.tabContainer}>
        {(['all', 'reps', 'time', 'mastery'] as CategoryFilter[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isActive ? theme.accent : 'transparent',
                  borderColor: isActive ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  {
                    color: isActive
                      ? isDark
                        ? '#000000'
                        : '#ffffff'
                      : theme.subtext,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Compact Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {filteredAchievements.map((item) => (
          <View
            key={item.id}
            style={[
              styles.badgeTile,
              {
                backgroundColor: theme.background,
                borderColor: item.isUnlocked ? theme.accent : theme.border,
                opacity: item.isUnlocked ? 1 : 0.65,
              },
            ]}
          >
            {/* Badge Icon Bubble */}
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: item.isUnlocked
                    ? `${theme.accent}20`
                    : 'rgba(150,150,150,0.1)',
                },
              ]}
            >
              <Text style={styles.badgeIcon}>{item.isUnlocked ? item.icon : '🔒'}</Text>
            </View>

            <Text numberOfLines={1} style={[styles.badgeTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text numberOfLines={2} style={[styles.badgeDesc, { color: theme.subtext }]}>
              {item.description}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={[styles.track, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${item.progressRatio * 100}%`,
                      backgroundColor: item.isUnlocked ? '#4CAF50' : theme.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.subtext }]}>
                {item.current > item.target ? item.target : item.current}/{item.target}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeCounter: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCounterText: {
    fontWeight: '800',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
  },
  horizontalScroll: {
    gap: 12,
    paddingRight: 8,
  },
  badgeTile: {
    width: 140,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    height: 26,
    marginBottom: 8,
  },
  progressSection: {
    width: '100%',
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  progressText: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});