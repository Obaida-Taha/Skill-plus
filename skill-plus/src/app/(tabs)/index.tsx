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

// Difficulty XP Rate Mapping
const DIFFICULTY_XP: Record<string, number> = {
  Beginner: 10,
  Intermediate: 20,
  Advanced: 35,
};

type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: string;
  reps: number;
  timeSpentSeconds: number;
};

// Gamification Formula Helpers
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

      // Fetch user's skills
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

      // Calculate Total Appwrite XP across all logged skills
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

  // Gamification Stats
  const currentLevel = getLevelFromXP(totalXP);
  const currentLevelBaseXP = getXpForLevel(currentLevel);
  const nextLevelBaseXP = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - currentLevelBaseXP;
  const xpNeededForNextLevel = nextLevelBaseXP - currentLevelBaseXP;
  const levelProgress = Math.min(
    Math.max(xpInCurrentLevel / xpNeededForNextLevel, 0),
    1
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ Rank #{currentLevel}</Text>
          </View>
        </View>

        {/* Level & XP Overview Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Level {currentLevel}</Text>
              <Text style={styles.levelSubtitle}>SkillPlus Mastery</Text>
            </View>
            <Text style={styles.xpText}>{totalXP.toLocaleString()} Total XP</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(levelProgress * 100)}%` },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressSubtext}>
              {xpNeededForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}
            </Text>
            <Text style={styles.progressSubtext}>
              {Math.round(levelProgress * 100)}%
            </Text>
          </View>
        </View>

        {/* Active Skills Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>In Progress Skills ({userSkills.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/skills')}>
            <Text style={styles.seeAllText}>Manage Skills</Text>
          </TouchableOpacity>
        </View>

        {userSkills.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active skills yet.</Text>
            <TouchableOpacity
              style={styles.discoverBtn}
              onPress={() => router.push('/(tabs)/discover')}
            >
              <Text style={styles.discoverBtnText}>Explore Skills</Text>
            </TouchableOpacity>
          </View>
        ) : (
          userSkills.slice(0, 4).map((skill) => {
            const skillXP = calculateSkillXP(skill);
            const skillLevel = getLevelFromXP(skillXP);

            return (
              <View key={skill.$id} style={styles.skillCard}>
                <View
                  style={[
                    styles.colorIndicator,
                    {
                      backgroundColor:
                        skill.difficulty === 'Advanced'
                          ? '#ff5252'
                          : skill.difficulty === 'Intermediate'
                          ? '#ffb86c'
                          : '#61dafb',
                    },
                  ]}
                />
                <View style={styles.skillInfo}>
                  <Text style={styles.skillTitle}>{skill.name}</Text>
                  <Text style={styles.skillCategory}>
                    {skill.category} • {skill.difficulty} • Lvl {skillLevel}
                  </Text>
                </View>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+{skillXP} XP</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Quick Action Button */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/skills')}
        >
          <Text style={styles.quickActionText}>Start Practicing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  badge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  badgeText: {
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelTitle: {
    color: '#a78bfa',
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelSubtitle: {
    color: '#71717a',
    fontSize: 12,
    marginTop: 2,
  },
  xpText: {
    color: '#f4f4f5',
    fontWeight: '700',
    fontSize: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#2d2d38',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    color: '#a1a1aa',
    fontSize: 12,
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
  emptyCard: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  emptyText: {
    color: '#71717a',
    marginBottom: 12,
  },
  discoverBtn: {
    backgroundColor: '#a78bfa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  discoverBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
    width: 8,
    height: 38,
    borderRadius: 4,
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
  xpBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  xpBadgeText: {
    color: '#4caf50',
    fontWeight: 'bold',
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