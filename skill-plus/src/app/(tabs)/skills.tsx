import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Client, Databases, Account, Query } from 'react-native-appwrite';
import * as Haptics from 'expo-haptics';

import { CelebrationModal, CelebrationData } from '../../components/common/CelebrationModal';
import { calculateAchievements } from '../../utils/achievements';
import { ScreenWrapper } from '../../components/bottomNavTab/ScreenWrapper';
import { SkillControlCard } from '../../components/skills/SkillControlCard';
import { CompletedSkillsCard } from '../../components/home/CompletedSkillsCard';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const account = new Account(client);

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const USER_SKILLS_COL_ID = 'user_skills';

export type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  status: 'In Progress' | 'Paused' | 'Completed';
  reps: number;
  timeSpentSeconds: number;
  isTimerRunning?: boolean;
  timerStartedAt?: string | null;
};

type FilterType = 'All' | 'In Progress' | 'Paused' | 'Completed';

// Helpers placed outside component
const DIFFICULTY_XP: Record<string, number> = { Beginner: 10, Intermediate: 20, Advanced: 35 };

const calculateSkillXP = (skill: any): number => {
  const rate = DIFFICULTY_XP[skill.difficulty] || 10;
  return (skill.reps || 0) * rate + Math.floor(((skill.timeSpentSeconds || 0) / 60) * (rate / 2));
};

const getLevelFromXP = (totalXp: number): number => Math.floor(Math.sqrt(totalXp / 250)) + 1;

export default function SkillsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { userProfile } = useAuth();
  const streakDays = userProfile?.streakCount ?? 0;

  // Celebration Modal State
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTimerSkillId, setActiveTimerSkillId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('In Progress');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchUserSkills();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [])
  );

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();

      const response = await databases.listDocuments(DB_ID, USER_SKILLS_COL_ID, [
        Query.equal('userId', currentUser.$id),
      ]);

      const formatted: UserSkill[] = response.documents.map((doc: any) => {
        let currentSeconds = doc.timeSpentSeconds || 0;

        if (doc.isTimerRunning && doc.timerStartedAt) {
          const startTime = new Date(doc.timerStartedAt).getTime();
          const nowTime = new Date().getTime();
          const secondsElapsed = Math.floor((nowTime - startTime) / 1000);

          if (secondsElapsed > 0) {
            currentSeconds += secondsElapsed;
          }
        }

        return {
          $id: doc.$id,
          name: doc.name,
          category: doc.category,
          subCategory: doc.subCategory,
          difficulty: doc.difficulty,
          status: doc.status || 'In Progress',
          reps: doc.reps || 0,
          timeSpentSeconds: currentSeconds,
          isTimerRunning: doc.isTimerRunning || false,
          timerStartedAt: doc.timerStartedAt || null,
        };
      });

      setUserSkills(formatted);

      const runningSkill = formatted.find((s) => s.isTimerRunning);
      if (runningSkill) {
        setActiveTimerSkillId(runningSkill.$id);
        startLocalTicker(runningSkill.$id);
      }
    } catch (error: any) {
      console.error('Error loading skills:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserSkills();
  };

  const checkForCelebration = (prevSkills: UserSkill[], updatedSkills: UserSkill[]) => {
    const prevXP = prevSkills.reduce((sum, s) => sum + calculateSkillXP(s), 0);
    const prevLevel = getLevelFromXP(prevXP);
    const prevBadges = calculateAchievements(prevSkills, streakDays);

    const newXP = updatedSkills.reduce((sum, s) => sum + calculateSkillXP(s), 0);
    const newLevel = getLevelFromXP(newXP);
    const newBadges = calculateAchievements(updatedSkills, streakDays);

    const newlyUnlocked = newBadges.filter(
      (nb) => nb.isUnlocked && !prevBadges.find((pb) => pb.id === nb.id && pb.isUnlocked)
    );

    if (newLevel > prevLevel) {
      setCelebrationData({
        type: 'level_up',
        title: `Level ${newLevel} Reached!`,
        subtitle: `You earned enough XP to ascend to Level ${newLevel}. Outstanding progress!`,
        icon: '⚡',
      });
      setCelebrationVisible(true);
    } else if (newlyUnlocked.length > 0) {
      const badge = newlyUnlocked[0];
      setCelebrationData({
        type: 'achievement',
        title: `Unlocked: ${badge.title}!`,
        subtitle: badge.description,
        icon: badge.icon,
      });
      setCelebrationVisible(true);
    }
  };

  const updateSkillInAppwrite = async (skillId: string, updates: Partial<UserSkill>) => {
    try {
      let nextSkills: UserSkill[] = [];
      setUserSkills((prev) => {
        nextSkills = prev.map((s) => (s.$id === skillId ? { ...s, ...updates } : s));
        checkForCelebration(prev, nextSkills);
        return nextSkills;
      });

      await databases.updateDocument(DB_ID, USER_SKILLS_COL_ID, skillId, updates);
    } catch (error: any) {
      console.error('Error updating skill in Appwrite:', error.message);
      Alert.alert('Update Failed', 'Could not sync changes to the cloud.');
    }
  };

  const startLocalTicker = (skillId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setUserSkills((prevSkills) =>
        prevSkills.map((s) =>
          s.$id === skillId ? { ...s, timeSpentSeconds: s.timeSpentSeconds + 1 } : s
        )
      );
    }, 1000);
  };

  const toggleTimer = async (skillId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const activeSkill = userSkills.find((s) => s.$id === skillId);
    if (!activeSkill) return;

    const isCurrentlyRunning = activeTimerSkillId === skillId;

    if (isCurrentlyRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setActiveTimerSkillId(null);

      await updateSkillInAppwrite(skillId, {
        timeSpentSeconds: activeSkill.timeSpentSeconds,
        timerStartedAt: null,
        isTimerRunning: false,
      });
    } else {
      if (activeTimerSkillId && timerRef.current) {
        clearInterval(timerRef.current);
        const runningSkill = userSkills.find((s) => s.$id === activeTimerSkillId);
        if (runningSkill) {
          await updateSkillInAppwrite(runningSkill.$id, {
            timeSpentSeconds: runningSkill.timeSpentSeconds,
            timerStartedAt: null,
            isTimerRunning: false,
          });
        }
      }

      const nowISO = new Date().toISOString();
      setActiveTimerSkillId(skillId);
      startLocalTicker(skillId);

      await updateSkillInAppwrite(skillId, {
        timerStartedAt: nowISO,
        isTimerRunning: true,
      });
    }
  };

  const adjustReps = (skillId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const target = userSkills.find((s) => s.$id === skillId);
    if (!target) return;

    const newReps = Math.max(0, target.reps + delta);
    updateSkillInAppwrite(skillId, { reps: newReps });
  };

  const updateSkillStatus = (
    skillId: string,
    newStatus: 'In Progress' | 'Paused' | 'Completed'
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateSkillInAppwrite(skillId, { status: newStatus });
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to permanently delete "${skillName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (activeTimerSkillId === skillId && timerRef.current) {
              clearInterval(timerRef.current);
              setActiveTimerSkillId(null);
            }
            try {
              setUserSkills((prev) => prev.filter((s) => s.$id !== skillId));
              await databases.deleteDocument(DB_ID, USER_SKILLS_COL_ID, skillId);
            } catch (error: any) {
              console.error('Failed to remove skill:', error.message);
            }
          },
        },
      ]
    );
  };

  const completedSkills = userSkills.filter((s) => s.status === 'Completed');
  const filteredSkills = userSkills.filter((s) => {
    if (selectedFilter === 'All') return true;
    return s.status === selectedFilter;
  });

  return (
    <ScreenWrapper style={{ backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>My Skills</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Track your daily repetitions & time spent
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={[styles.addBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
              + Add Skill
            </Text>
          </TouchableOpacity>
        </View>

        <CompletedSkillsCard skills={completedSkills} />

        <View style={styles.filterContainer}>
          {(['In Progress', 'Paused', 'Completed', 'All'] as FilterType[]).map((tab) => {
            const isActive = selectedFilter === tab;
            const label = tab === 'Completed' ? 'Finished' : tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  isActive
                    ? { backgroundColor: theme.accent }
                    : { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedFilter(tab);
                }}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive
                      ? { color: isDark ? '#000000' : '#ffffff', fontWeight: 'bold' }
                      : { color: theme.subtext },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : filteredSkills.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No {selectedFilter === 'Completed' ? 'Finished' : selectedFilter} Skills
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              {selectedFilter === 'In Progress'
                ? 'Select a skill to start practicing or add a new one from Discover.'
                : `No skills currently marked as ${selectedFilter.toLowerCase()}.`}
            </Text>
            {userSkills.length === 0 && (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.accent }]}
                onPress={() => router.push('/(tabs)/discover')}
              >
                <Text style={[styles.emptyBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
                  Browse Skills
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredSkills.map((skill) => (
            <SkillControlCard
              key={skill.$id}
              skill={skill}
              activeTimerSkillId={activeTimerSkillId}
              onUpdateStatus={updateSkillStatus}
              onAdjustReps={adjustReps}
              onToggleTimer={toggleTimer}
              onRemoveSkill={handleRemoveSkill}
              onDirectUpdate={updateSkillInAppwrite}
              formatTime={formatTime}
            />
          ))
        )}
      </ScrollView>

      {/* Confetti & Level-Up Pop-up Modal */}
      <CelebrationModal
        visible={celebrationVisible}
        data={celebrationData}
        onClose={() => setCelebrationVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { fontWeight: 'bold', fontSize: 13 },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterTabText: { fontSize: 12 },
  centerContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 14 },
  emptyBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  emptyBtnText: { fontWeight: 'bold', fontSize: 14 },
});