import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

export interface CelebrationData {
  type: 'level_up' | 'achievement';
  title: string;
  subtitle: string;
  icon?: string;
}

interface CelebrationModalProps {
  visible: boolean;
  data: CelebrationData | null;
  onClose: () => void;
}

export function CelebrationModal({ visible, data, onClose }: CelebrationModalProps) {
  const { theme, isDark } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (visible && data) {
      // Trigger success haptics sequence
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Fire confetti explosion
      setTimeout(() => {
        confettiRef.current?.start();
      }, 100);
    }
  }, [visible, data]);

  if (!data) return null;

  const isLevelUp = data.type === 'level_up';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti Explosion Cannon */}
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
        />

        {/* Modal Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.icon}>{data.icon || (isLevelUp ? '🎉' : '🏆')}</Text>

          <Text style={[styles.badgeTag, { backgroundColor: theme.accent, color: isDark ? '#000' : '#fff' }]}>
            {isLevelUp ? 'LEVEL UP!' : 'UNLOCKED!'}
          </Text>

          <Text style={[styles.title, { color: theme.text }]}>{data.title}</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>{data.subtitle}</Text>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <Text style={[styles.btnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {isLevelUp ? 'Keep Grinding! 🚀' : 'Awesome! 🙌'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  icon: {
    fontSize: 54,
    marginBottom: 12,
  },
  badgeTag: {
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});