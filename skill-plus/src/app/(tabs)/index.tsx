import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';
import { useTheme } from '../../context/ThemeContext';
import { LevelCard } from '../../components/home/LevelCard';
import { SkillItemCard, UserSkill } from '../../components/home/SkillItemCard';

const DIFFICULTY_XP: Record<string, number> = {
  Beginner: 10,
  Intermediate: 20,
  Advanced: 35,
};

const calculateSkillXP = (skill: UserSkill): number => {
  const rate = DIFFICULTY_XP[skill.difficulty] || 10;
  const repXP = (skill.reps || 0) * rate;
  const timeXP = Math.floor(((skill.timeSpentSeconds || 0) / 60) * (rate / 2));
  return repXP + timeXP;
};

const getLevelFromXP = (totalXp: number): number => {
  return Math.floor(Math.sqrt(totalXp / 250)) + 1;
};

const getXpForLevel = (level: number): number => {
  return Math.floor(250 * Math.pow(level - 1, 2));
};

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('SkillPlus Learner');
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
  const userSkillsColId = 'user_skills';

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();
      setUserName(currentUser.name || currentUser.email.split('@')[0]);

      const response = await databases.listDocuments(dbId, userSkillsColId, [
        Query.equal('userId', currentUser.$id),
      ]);

      const skillsData = response.documents.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        category: doc.category,
        subCategory: doc.subCategory,
        difficulty: doc.difficulty || 'Beginner',
        status: doc.status || 'In Progress',
        reps: doc.reps || 0,
        timeSpentSeconds: doc.timeSpentSeconds || 0,
      })) as UserSkill[];

      const calculatedTotalXP = skillsData.reduce(
        (sum, skill) => sum + calculateSkillXP(skill),
        0
      );

      setUserSkills(skillsData);
      setTotalXP(calculatedTotalXP);
    } catch (error: any) {
      console.error('Error fetching home data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = getLevelFromXP(totalXP);
  const currentLevelBaseXP = getXpForLevel(currentLevel);
  const nextLevelBaseXP = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - currentLevelBaseXP;
  const xpNeededForNextLevel = nextLevelBaseXP - currentLevelBaseXP;
  const levelProgress = Math.min(Math.max(xpInCurrentLevel / xpNeededForNextLevel, 0), 1);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.subtext }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.badgeText}>⚡ Rank #{currentLevel}</Text>
          </View>
        </View>

        {/* Level Overview Component */}
        <LevelCard
          currentLevel={currentLevel}
          totalXP={totalXP}
          levelProgress={levelProgress}
          xpNeededForNextLevel={xpNeededForNextLevel}
          xpInCurrentLevel={xpInCurrentLevel}
        />

        {/* Category Statistics Component */}
        <CategoryStatsCard skills={userSkills} />

        {/* Active Skills Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            In Progress Skills ({userSkills.length})
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/skills')}>
            <Text style={[styles.seeAllText, { color: theme.accent }]}>Manage Skills</Text>
          </TouchableOpacity>
        </View>

        {/* Render Skill Cards using SkillItemCard Component */}
        {userSkills.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>No active skills yet.</Text>
            <TouchableOpacity
              style={[styles.discoverBtn, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/(tabs)/discover')}
            >
              <Text style={[styles.discoverBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
                Explore Skills
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          userSkills.slice(0, 4).map((skill) => {
            const skillXP = calculateSkillXP(skill);
            const skillLevel = getLevelFromXP(skillXP);
            return (
              <SkillItemCard
                key={skill.$id}
                skill={skill}
                skillXP={skillXP}
                skillLevel={skillLevel}
              />
            );
          })
        )}

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/(tabs)/skills')}
        >
          <Text style={[styles.quickActionText, { color: isDark ? '#000000' : '#ffffff' }]}>
            Start Practicing
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: { fontSize: 14 },
  userName: { fontSize: 24, fontWeight: 'bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { color: '#ffb86c', fontWeight: 'bold' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllText: { fontWeight: '600' },
  emptyCard: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  emptyText: { marginBottom: 12 },
  discoverBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  discoverBtnText: { fontWeight: 'bold' },
  quickActionButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  quickActionText: { fontSize: 16, fontWeight: 'bold' },
});