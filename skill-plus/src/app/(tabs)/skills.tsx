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

import { ScreenWrapper } from '../../components/bottomNavTab/ScreenWrapper';
import { SkillControlCard } from '../../components/skills/SkillControlCard';
import { useTheme } from '../../context/ThemeContext';

// Centralized Appwrite setup using EXPO_PUBLIC environment variables
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
  difficulty: string;
  status: 'In Progress' | 'Paused' | 'Completed';
  reps: number;
  timeSpentSeconds: number;
  isTimerRunning?: boolean;
  timerStartedAt?: string | null;
};

export default function SkillsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTimerSkillId, setActiveTimerSkillId] = useState<string | null>(null);

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

  const updateSkillInAppwrite = async (skillId: string, updates: Partial<UserSkill>) => {
    try {
      setUserSkills((prev) =>
        prev.map((s) => (s.$id === skillId ? { ...s, ...updates } : s))
      );
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
    const target = userSkills.find((s) => s.$id === skillId);
    if (!target) return;

    const newReps = Math.max(0, target.reps + delta);
    updateSkillInAppwrite(skillId, { reps: newReps });
  };

  const updateSkillStatus = (skillId: string, newStatus: 'In Progress' | 'Paused') => {
    updateSkillInAppwrite(skillId, { status: newStatus });
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove "${skillName}" from your active skills?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
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

  return (
    <ScreenWrapper style={{ backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Screen Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>My Skills</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Track your daily repetitions & time spent
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/discover')}
          >
            <Text style={[styles.addBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
              + Add Skill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Spinner */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : userSkills.length === 0 ? (
          /* Empty State */
          <View style={[styles.emptyBox, { borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No skills added yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              Explore the discover tab to select and track skills you want to master.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/discover')}
            >
              <Text style={[styles.emptyBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
                Browse Skills
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Skills List */
          userSkills.map((skill) => (
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});