import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';

// Extended UserSkill Type
type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: string;
  status: 'In Progress' | 'Paused' | 'Completed';
  reps: number;
  timeSpentSeconds: number;
};

export default function SkillsScreen() {
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  // Timer state management
  const [activeTimerSkillId, setActiveTimerSkillId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
  const userSkillsColId = 'user_skills';

  // Fetch skills when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserSkills();
      return () => {
        // Stop timer when leaving screen
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

  // Helper function to sync Appwrite changes
  const updateSkillInAppwrite = async (skillId: string, updates: Partial<UserSkill>) => {
    try {
      await databases.updateDocument(dbId, userSkillsColId, skillId, updates);
    } catch (error: any) {
      console.error('Failed to update skill:', error.message);
    }
  };

  // 1. Direct Status Update (In Progress or Paused)
  const updateSkillStatus = (skillId: string, newStatus: 'In Progress' | 'Paused') => {
    setUserSkills((prev) =>
      prev.map((s) => (s.$id === skillId ? { ...s, status: newStatus } : s))
    );

    // Stop timer if paused
    if (newStatus === 'Paused' && activeTimerSkillId === skillId) {
      stopTimer();
    }

    updateSkillInAppwrite(skillId, { status: newStatus });
  };

  // 2. Adjust Rep Counter (+ / -)
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

  // 3. Time Counter Controls
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
            // Periodically sync every 10 seconds to save network bandwidth
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
    // Final save for the current skill
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

  // Format Seconds to HH:MM:SS format
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  // 4. Delete Skill
  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    const performDelete = async () => {
      try {
        // Stop timer if it's running on this skill
        if (activeTimerSkillId === skillId) stopTimer();

        // Delete from Appwrite database
        await databases.deleteDocument(dbId, userSkillsColId, skillId);

        // Remove from local UI state immediately
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

    // Cross-platform alert check
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to remove "${skillName}"?`);
      if (confirmDelete) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Remove Skill',
        `Are you sure you want to remove "${skillName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>My Skills</Text>

      {userSkills.length === 0 ? (
        <Text style={styles.emptyText}>No skills added yet. Go to Discover to start learning!</Text>
      ) : (
        userSkills.map((skill) => (
          <View key={skill.$id} style={styles.card}>
            {/* Title & Category Info */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.skillTitle}>{skill.name}</Text>
                <Text style={styles.skillSubtitle}>
                  {skill.category} • {skill.subCategory} ({skill.difficulty})
                </Text>
              </View>
            </View>

            {/* Status Toggle Buttons (Side-by-Side) */}
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  skill.status === 'In Progress' ? styles.statusBtnActiveProgress : styles.statusBtnInactive,
                ]}
                onPress={() => updateSkillStatus(skill.$id, 'In Progress')}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    skill.status === 'In Progress' ? styles.textActive : styles.textInactive,
                  ]}
                >
                  ▶ In Progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  skill.status === 'Paused' ? styles.statusBtnActivePaused : styles.statusBtnInactive,
                ]}
                onPress={() => updateSkillStatus(skill.$id, 'Paused')}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    skill.status === 'Paused' ? styles.textActive : styles.textInactive,
                  ]}
                >
                  ⏸ Paused
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rep Counter Control */}
            <View style={styles.controlRow}>
              <Text style={styles.label}>Reps Completed:</Text>
              <View style={styles.counterBox}>
                <TouchableOpacity
                  style={styles.btnCounter}
                  onPress={() => adjustReps(skill.$id, -1)}
                >
                  <Text style={styles.btnCounterText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{skill.reps}</Text>

                <TouchableOpacity
                  style={styles.btnCounter}
                  onPress={() => adjustReps(skill.$id, 1)}
                >
                  <Text style={styles.btnCounterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Tracking Control */}
            <View style={styles.controlRow}>
              <Text style={styles.label}>Time Practiced:</Text>
              <View style={styles.counterBox}>
                <Text style={styles.timerDisplay}>{formatTime(skill.timeSpentSeconds)}</Text>
                <TouchableOpacity
                  style={[
                    styles.btnTimer,
                    activeTimerSkillId === skill.$id && styles.btnTimerActive,
                  ]}
                  onPress={() => toggleTimer(skill.$id)}
                >
                  <Text style={styles.btnTimerText}>
                    {activeTimerSkillId === skill.$id ? 'Pause' : 'Start'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Remove Action */}
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveSkill(skill.$id, skill.name)}
            >
              <Text style={styles.removeBtnText}>Remove Skill</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  skillTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  skillSubtitle: { fontSize: 12, color: '#aaa', marginTop: 4 },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBtnActiveProgress: {
    backgroundColor: '#1b5e20',
    borderColor: '#4caf50',
  },
  statusBtnActivePaused: {
    backgroundColor: '#b71c1c',
    borderColor: '#f44336',
  },
  statusBtnInactive: {
    backgroundColor: '#262626',
    borderColor: '#3a3a3a',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: '#ffffff',
  },
  textInactive: {
    color: '#777777',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 12,
  },
  label: { color: '#ccc', fontSize: 14 },
  counterBox: { flexDirection: 'row', alignItems: 'center' },
  btnCounter: {
    backgroundColor: '#333',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCounterText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterValue: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 12 },
  timerDisplay: { color: '#a78bfa', fontSize: 16, fontWeight: '600', marginRight: 12 },
  btnTimer: { backgroundColor: '#a78bfa', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnTimerActive: { backgroundColor: '#e53935' },
  btnTimerText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  removeBtn: { marginTop: 16, alignItems: 'center' },
  removeBtnText: { color: '#ff5252', fontSize: 13 },
});