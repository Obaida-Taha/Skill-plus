import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: string;
  status: 'In Progress' | 'Paused' | 'Completed';
  reps: number;
  timeSpentSeconds: number;
};

interface SkillControlCardProps {
  skill: UserSkill;
  activeTimerSkillId: string | null;
  onUpdateStatus: (skillId: string, newStatus: 'In Progress' | 'Paused' | 'Completed') => void;
  onAdjustReps: (skillId: string, delta: number) => void;
  onToggleTimer: (skillId: string) => void;
  onRemoveSkill: (skillId: string, skillName: string) => void;
  onDirectUpdate?: (skillId: string, updates: Partial<UserSkill>) => void;
  formatTime: (seconds: number) => string;
}

export function SkillControlCard({
  skill,
  activeTimerSkillId,
  onUpdateStatus,
  onAdjustReps,
  onToggleTimer,
  onRemoveSkill,
  onDirectUpdate,
}: SkillControlCardProps) {
  const { theme, isDark } = useTheme();
  const isTimerActive = activeTimerSkillId === skill.$id;

  // Local state for Reps
  const [repsInput, setRepsInput] = useState(String(skill.reps));

  // Local state for HH : MM : SS
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  const updateTimeFieldsFromSeconds = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    setHours(String(h).padStart(2, '0'));
    setMinutes(String(m).padStart(2, '0'));
    setSeconds(String(s).padStart(2, '0'));
  };

  useEffect(() => {
    setRepsInput(String(skill.reps));
  }, [skill.reps]);

  useEffect(() => {
    updateTimeFieldsFromSeconds(skill.timeSpentSeconds);
  }, [skill.timeSpentSeconds]);

  const handleRepsChange = (text: string) => {
    setRepsInput(text.replace(/[^0-9]/g, ''));
  };

  const handleRepsBlur = () => {
    const parsed = parseInt(repsInput, 10);
    const validReps = isNaN(parsed) ? 0 : parsed;
    setRepsInput(String(validReps));

    const delta = validReps - skill.reps;
    if (delta !== 0) {
      onAdjustReps(skill.$id, delta);
    }
  };

  const handleHoursChange = (text: string) => setHours(text.replace(/[^0-9]/g, ''));
  const handleMinutesChange = (text: string) => setMinutes(text.replace(/[^0-9]/g, ''));
  const handleSecondsChange = (text: string) => setSeconds(text.replace(/[^0-9]/g, ''));

  const handleTimeBlur = () => {
    const h = Math.max(0, parseInt(hours, 10) || 0);
    const m = Math.min(59, Math.max(0, parseInt(minutes, 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(seconds, 10) || 0));

    setHours(String(h).padStart(2, '0'));
    setMinutes(String(m).padStart(2, '0'));
    setSeconds(String(s).padStart(2, '0'));

    const newTotalSeconds = h * 3600 + m * 60 + s;

    if (newTotalSeconds !== skill.timeSpentSeconds && onDirectUpdate) {
      onDirectUpdate(skill.$id, { timeSpentSeconds: newTotalSeconds });
    }
  };

  const handleTimeFocus = () => {
    if (isTimerActive) {
      onToggleTimer(skill.$id);
    }
  };

  // Handler for setting status to Completed with confirmation
  const handleStatusChange = (newStatus: 'In Progress' | 'Paused' | 'Completed') => {
    if (newStatus === skill.status) return;

    if (newStatus === 'Completed') {
      Alert.alert(
        'Mark Skill as Completed?',
        `Are you sure you have finished learning "${skill.name}"? This will move it to your completed showcase on the Home Screen.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Complete It!',
            style: 'default',
            onPress: () => {
              if (isTimerActive) onToggleTimer(skill.$id);
              onUpdateStatus(skill.$id, 'Completed');
            },
          },
        ]
      );
    } else {
      onUpdateStatus(skill.$id, newStatus);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Title & Category Info */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.skillTitle, { color: theme.text }]}>{skill.name}</Text>
          <Text style={[styles.skillSubtitle, { color: theme.subtext }]}>
            {skill.category} • {skill.subCategory} ({skill.difficulty})
          </Text>
        </View>
      </View>

      {/* 3-Way Status Toggle Buttons */}
      <View style={styles.statusContainer}>
        {/* In Progress Button */}
        <TouchableOpacity
          style={[
            styles.statusBtn,
            skill.status === 'In Progress'
              ? styles.statusBtnActiveProgress
              : [styles.statusBtnInactive, { backgroundColor: theme.border, borderColor: theme.border }],
          ]}
          onPress={() => handleStatusChange('In Progress')}
        >
          <Text
            style={[
              styles.statusBtnText,
              skill.status === 'In Progress' ? styles.textActive : { color: theme.subtext },
            ]}
          >
            ▶ Progress
          </Text>
        </TouchableOpacity>

        {/* Paused Button */}
        <TouchableOpacity
          style={[
            styles.statusBtn,
            skill.status === 'Paused'
              ? styles.statusBtnActivePaused
              : [styles.statusBtnInactive, { backgroundColor: theme.border, borderColor: theme.border }],
          ]}
          onPress={() => handleStatusChange('Paused')}
        >
          <Text
            style={[
              styles.statusBtnText,
              skill.status === 'Paused' ? styles.textActive : { color: theme.subtext },
            ]}
          >
            ⏸ Paused
          </Text>
        </TouchableOpacity>

        {/* Completed Button */}
        <TouchableOpacity
          style={[
            styles.statusBtn,
            skill.status === 'Completed'
              ? styles.statusBtnActiveCompleted
              : [styles.statusBtnInactive, { backgroundColor: theme.border, borderColor: theme.border }],
          ]}
          onPress={() => handleStatusChange('Completed')}
        >
          <Text
            style={[
              styles.statusBtnText,
              skill.status === 'Completed' ? styles.textActive : { color: theme.subtext },
            ]}
          >
            ✓ Finished
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rep Counter Control */}
      <View style={[styles.controlRow, { borderTopColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Reps Completed:</Text>
        <View style={styles.counterBox}>
          <TouchableOpacity
            style={[styles.btnCounter, { backgroundColor: theme.border }]}
            onPress={() => onAdjustReps(skill.$id, -1)}
          >
            <Text style={[styles.btnCounterText, { color: theme.text }]}>-</Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.counterInput,
              { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
            ]}
            value={repsInput}
            onChangeText={handleRepsChange}
            onBlur={handleRepsBlur}
            keyboardType="number-pad"
            maxLength={5}
            selectTextOnFocus
          />

          <TouchableOpacity
            style={[styles.btnCounter, { backgroundColor: theme.border }]}
            onPress={() => onAdjustReps(skill.$id, 1)}
          >
            <Text style={[styles.btnCounterText, { color: theme.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Tracking Control */}
      <View style={[styles.controlRow, { borderTopColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.subtext }]}>Time Practiced:</Text>
        <View style={styles.counterBox}>
          <View style={[styles.timeBoxContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TextInput
              style={[styles.segmentInput, { color: theme.accent }]}
              value={hours}
              onChangeText={handleHoursChange}
              onBlur={handleTimeBlur}
              onFocus={handleTimeFocus}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={[styles.timeColon, { color: theme.subtext }]}>:</Text>

            <TextInput
              style={[styles.segmentInput, { color: theme.accent }]}
              value={minutes}
              onChangeText={handleMinutesChange}
              onBlur={handleTimeBlur}
              onFocus={handleTimeFocus}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={[styles.timeColon, { color: theme.subtext }]}>:</Text>

            <TextInput
              style={[styles.segmentInput, { color: theme.accent }]}
              value={seconds}
              onChangeText={handleSecondsChange}
              onBlur={handleTimeBlur}
              onFocus={handleTimeFocus}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
          </View>

          <TouchableOpacity
            style={[
              styles.btnTimer,
              { backgroundColor: theme.accent },
              isTimerActive && styles.btnTimerActive,
            ]}
            onPress={() => onToggleTimer(skill.$id)}
          >
            <Text style={[styles.btnTimerText, { color: isDark ? '#000000' : '#ffffff' }]}>
              {isTimerActive ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remove Action */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemoveSkill(skill.$id, skill.name)}
      >
        <Text style={styles.removeBtnText}>Remove Skill</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  skillTitle: { fontSize: 18, fontWeight: 'bold' },
  skillSubtitle: { fontSize: 12, marginTop: 4 },
  statusContainer: { flexDirection: 'row', gap: 6, marginTop: 12 },
  statusBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBtnActiveProgress: { backgroundColor: '#1b5e20', borderColor: '#4caf50' },
  statusBtnActivePaused: { backgroundColor: '#b71c1c', borderColor: '#f44336' },
  statusBtnActiveCompleted: { backgroundColor: '#0d47a1', borderColor: '#2196f3' },
  statusBtnInactive: {},
  statusBtnText: { fontSize: 12, fontWeight: '600' },
  textActive: { color: '#ffffff' },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  label: { fontSize: 14 },
  counterBox: { flexDirection: 'row', alignItems: 'center' },
  btnCounter: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  btnCounterText: { fontSize: 18, fontWeight: 'bold' },
  counterInput: {
    width: 48,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    marginHorizontal: 8,
    paddingVertical: 0,
  },
  timeBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    height: 32,
    marginRight: 10,
  },
  segmentInput: { width: 22, height: 32, textAlign: 'center', fontSize: 14, fontWeight: 'bold', paddingVertical: 0 },
  timeColon: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 1 },
  btnTimer: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnTimerActive: { backgroundColor: '#e53935' },
  btnTimerText: { fontWeight: 'bold', fontSize: 12 },
  removeBtn: { marginTop: 16, alignItems: 'center' },
  removeBtnText: { color: '#ff5252', fontSize: 13 },
});