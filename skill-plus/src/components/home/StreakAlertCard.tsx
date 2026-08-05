import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

interface StreakAlertCardProps {
  streakDays: number;
  hasPracticedToday: boolean;
  onActionPress: () => void;
}

export function StreakAlertCard({
  streakDays,
  hasPracticedToday,
  onActionPress,
}: StreakAlertCardProps) {
  const { theme, isDark } = useTheme();

  // Hide card if user already completed practice today
  if (hasPracticedToday) return null;

  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#2D1B00' : '#FFF3E0', borderColor: '#FF9800' }]}>
      <View style={styles.leftRow}>
        <Text style={styles.fireIcon}>🔥</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isDark ? '#FFB74D' : '#E65100' }]}>
            {streakDays > 0 ? `${streakDays}-Day Streak at Risk!` : 'Start Your Daily Streak!'}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#FFE0B2' : '#EF6C00' }]}>
            {streakDays > 0
              ? 'Complete a rep or timer session today so you don’t break it.'
              : 'Log practice today to spark your daily routine.'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onActionPress();
        }}
      >
        <Text style={styles.actionBtnText}>Practice Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  fireIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionBtn: {
    marginTop: 10,
    backgroundColor: '#FF9800',
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});