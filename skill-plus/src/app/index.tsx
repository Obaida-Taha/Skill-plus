import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Simple XP level calculation helper
const getNextLevelXp = (level: number) => level * 500;

export default function HomeScreen() {
  // Mock User State
  const [user, setUser] = useState({
    name: 'Obaida',
    level: 4,
    xp: 1450,
    streak: 5,
  });

  // Mock Active Skills
  const [skills, setSkills] = useState([
    { id: '1', title: 'React Native', category: 'Coding', xp: 850, level: 3, color: '#61dafb' },
    { id: '2', title: 'UI/UX Design', category: 'Design', xp: 420, level: 2, color: '#ff7ac6' },
    { id: '3', title: 'Spanish', category: 'Languages', xp: 180, level: 1, color: '#ffb86c' },
  ]);

  const targetXp = getNextLevelXp(user.level);
  const levelProgress = Math.min((user.xp % 500) / 500, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{user.streak} Days</Text>
          </View>
        </View>

        {/* Level & XP Overview Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Level {user.level}</Text>
            <Text style={styles.xpText}>{user.xp} Total XP</Text>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${levelProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {500 - (user.xp % 500)} XP to Level {user.level + 1}
          </Text>
        </View>

        {/* Active Skills Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Skills</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {skills.map((skill) => (
          <View key={skill.id} style={styles.skillCard}>
            <View style={[styles.colorIndicator, { backgroundColor: skill.color }]} />
            <View style={styles.skillInfo}>
              <Text style={styles.skillTitle}>{skill.title}</Text>
              <Text style={styles.skillCategory}>{skill.category} • Lvl {skill.level}</Text>
            </View>
            <TouchableOpacity style={styles.logButton}>
              <Text style={styles.logButtonText}>+ Practice</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Action Button */}
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>⚡ Quick Log Practice</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  streakIcon: {
    marginRight: 4,
  },
  streakText: {
    color: '#ffb86c',
    fontWeight: 'bold',
  },
  levelCard: {
    backgroundColor: '#1e1e24',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2d2d38',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  levelTitle: {
    color: '#a78bfa',
    fontSize: 22,
    fontWeight: 'bold',
  },
  xpText: {
    color: '#f4f4f5',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#2d2d38',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 5,
  },
  progressSubtext: {
    color: '#71717a',
    fontSize: 12,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#a78bfa',
    fontWeight: '600',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  colorIndicator: {
    width: 10,
    height: 40,
    borderRadius: 5,
    marginRight: 14,
  },
  skillInfo: {
    flex: 1,
  },
  skillTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skillCategory: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  logButton: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#a78bfa',
    fontWeight: '600',
    fontSize: 12,
  },
  quickActionButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});