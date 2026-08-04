import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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
  onUpdateStatus: (skillId: string, newStatus: 'In Progress' | 'Paused') => void;
  onAdjustReps: (skillId: string, delta: number) => void;
  onToggleTimer: (skillId: string) => void;
  onRemoveSkill: (skillId: string, skillName: string) => void;
  formatTime: (seconds: number) => string;
}

export function SkillControlCard({
  skill,
  activeTimerSkillId,
  onUpdateStatus,
  onAdjustReps,
  onToggleTimer,
  onRemoveSkill,
  formatTime,
}: SkillControlCardProps) {
  const { theme, isDark } = useTheme();
  const isTimerActive = activeTimerSkillId === skill.$id;

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

      {/* Status Toggle Buttons */}
      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[
            styles.statusBtn,
            skill.status === 'In Progress'
              ? styles.statusBtnActiveProgress
              : [styles.statusBtnInactive, { backgroundColor: theme.border, borderColor: theme.border }],
          ]}
          onPress={() => onUpdateStatus(skill.$id, 'In Progress')}
        >
          <Text
            style={[
              styles.statusBtnText,
              skill.status === 'In Progress'
                ? styles.textActive
                : [styles.textInactive, { color: theme.subtext }],
            ]}
          >
            ▶ In Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusBtn,
            skill.status === 'Paused'
              ? styles.statusBtnActivePaused
              : [styles.statusBtnInactive, { backgroundColor: theme.border, borderColor: theme.border }],
          ]}
          onPress={() => onUpdateStatus(skill.$id, 'Paused')}
        >
          <Text
            style={[
              styles.statusBtnText,
              skill.status === 'Paused'
                ? styles.textActive
                : [styles.textInactive, { color: theme.subtext }],
            ]}
          >
            ⏸ Paused
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

          <Text style={[styles.counterValue, { color: theme.text }]}>{skill.reps}</Text>

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
          <Text style={[styles.timerDisplay, { color: theme.accent }]}>
            {formatTime(skill.timeSpentSeconds)}
          </Text>
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
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  skillTitle: { fontSize: 18, fontWeight: 'bold' },
  skillSubtitle: { fontSize: 12, marginTop: 4 },
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
  statusBtnInactive: {},
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: '#ffffff',
  },
  textInactive: {},
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
  btnCounter: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCounterText: { fontSize: 18, fontWeight: 'bold' },
  counterValue: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12 },
  timerDisplay: { fontSize: 16, fontWeight: '600', marginRight: 12 },
  btnTimer: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnTimerActive: { backgroundColor: '#e53935' },
  btnTimerText: { fontWeight: 'bold', fontSize: 12 },
  removeBtn: { marginTop: 16, alignItems: 'center' },
  removeBtnText: { color: '#ff5252', fontSize: 13 },
});