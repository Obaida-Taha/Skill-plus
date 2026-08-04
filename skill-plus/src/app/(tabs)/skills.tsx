import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';
import { useTheme } from '../../context/ThemeContext';
import { SkillControlCard, UserSkill } from '../../components/SkillControlCard';
import { EmptySkillsCard } from '../../components/EmptySkillsCard';

export default function SkillsScreen() {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  // Timer state management
  const [activeTimerSkillId, setActiveTimerSkillId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
  const userSkillsColId = 'user_skills';

  useFocusEffect(
    useCallback(() => {
      fetchUserSkills();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [])
  );

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();

      const response = await databases.listDocuments(dbId, userSkillsColId, [
        Query.equal('userId', currentUser.$id),
      ]);

      const formatted = response.documents.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        category: doc.category,
        subCategory: doc.subCategory,
        difficulty: doc.difficulty,
        status: doc.status || 'In Progress',
        reps: doc.reps || 0,
        timeSpentSeconds: doc.timeSpentSeconds || 0,
      }));

      setUserSkills(formatted);
    } catch (error: any) {
      console.error('Error loading my skills:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSkillInAppwrite = async (skillId: string, updates: Partial<UserSkill>) => {
    try {
      await databases.updateDocument(dbId, userSkillsColId, skillId, updates);
    } catch (error: any) {
      console.error('Failed to update skill:', error.message);
    }
  };

  const updateSkillStatus = (skillId: string, newStatus: 'In Progress' | 'Paused') => {
    setUserSkills((prev) =>
      prev.map((s) => (s.$id === skillId ? { ...s, status: newStatus } : s))
    );

    if (newStatus === 'Paused' && activeTimerSkillId === skillId) {
      stopTimer();
    }

    updateSkillInAppwrite(skillId, { status: newStatus });
  };

  const adjustReps = (skillId: string, delta: number) => {
    setUserSkills((prev) =>
      prev.map((s) => {
        if (s.$id === skillId) {
          const newReps = Math.max(0, s.reps + delta);
          updateSkillInAppwrite(skillId, { reps: newReps });
          return { ...s, reps: newReps };
        }
        return s;
      })
    );
  };

  const toggleTimer = (skillId: string) => {
    if (activeTimerSkillId === skillId) {
      stopTimer();
    } else {
      startTimer(skillId);
    }
  };

  const startTimer = (skillId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveTimerSkillId(skillId);

    timerRef.current = setInterval(() => {
      setUserSkills((prev) =>
        prev.map((s) => {
          if (s.$id === skillId) {
            const updatedSeconds = s.timeSpentSeconds + 1;
            if (updatedSeconds % 10 === 0) {
              updateSkillInAppwrite(skillId, { timeSpentSeconds: updatedSeconds });
            }
            return { ...s, timeSpentSeconds: updatedSeconds };
          }
          return s;
        })
      );
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (activeTimerSkillId) {
      const activeSkill = userSkills.find((s) => s.$id === activeTimerSkillId);
      if (activeSkill) {
        updateSkillInAppwrite(activeTimerSkillId, {
          timeSpentSeconds: activeSkill.timeSpentSeconds,
        });
      }
    }
    setActiveTimerSkillId(null);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    const performDelete = async () => {
      try {
        if (activeTimerSkillId === skillId) stopTimer();
        await databases.deleteDocument(dbId, userSkillsColId, skillId);
        setUserSkills((prev) => prev.filter((s) => s.$id !== skillId));
      } catch (error: any) {
        console.error('Failed to delete skill:', error.message);
        if (Platform.OS === 'web') {
          alert('Failed to delete skill: ' + error.message);
        } else {
          Alert.alert('Error', 'Failed to delete skill: ' + error.message);
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to remove "${skillName}"?`);
      if (confirmDelete) await performDelete();
    } else {
      Alert.alert(
        'Remove Skill',
        `Are you sure you want to remove "${skillName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

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
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.header, { color: theme.text }]}>My Skills</Text>

        {userSkills.length === 0 ? (
          <EmptySkillsCard />
        ) : (
          userSkills.map((skill) => (
            <SkillControlCard
              key={skill.$id}
              skill={skill}
              activeTimerSkillId={activeTimerSkillId}
              onUpdateStatus={updateSkillStatus}
              onAdjustReps={adjustReps}
              onToggleTimer={toggleTimer}
              onRemoveSkill={handleRemoveSkill}
              formatTime={formatTime}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});