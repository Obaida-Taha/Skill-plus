import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  GestureResponderEvent 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProStatus } from '../hooks/useProStatus';

interface PremiumGateProps {
  /** The component or content to display */
  children: ReactNode;
  /** Whether this specific item requires Premium */
  isLocked?: boolean;
  /** Custom function to run when unlocked. If locked, paywall opens automatically */
  onPress?: (event: GestureResponderEvent) => void;
  /** Variant style: 'overlay' dims content with a central lock; 'badge' adds a top-right Pro tag */
  variant?: 'overlay' | 'badge';
  /** Optional container style overrides */
  style?: StyleProp<ViewStyle>;
}

export function PremiumGate({
  children,
  isLocked = true,
  onPress,
  variant = 'overlay',
  style,
}: PremiumGateProps) {
  const router = useRouter();
  const { isPro, isLoading } = useProStatus();

  // If user is Pro, lock condition is completely bypassed
  const shouldLock = !isPro && isLocked;

  const handlePress = (e: GestureResponderEvent) => {
    if (shouldLock) {
      router.push('/paywall');
      return;
    }

    if (onPress) {
      onPress(e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={shouldLock ? 0.8 : 0.7}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <View style={shouldLock ? styles.lockedContent : styles.unlockedContent} pointerEvents="none">
        {children}
      </View>

      {/* Lock Overlay Variant */}
      {shouldLock && variant === 'overlay' && (
        <View style={styles.overlayContainer}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={16} color="#FFD700" />
          </View>
          <Text style={styles.proTagText}>PRO</Text>
        </View>
      )}

      {/* Badge Variant */}
      {shouldLock && variant === 'badge' && (
        <View style={styles.badgeContainer}>
          <Ionicons name="lock-closed" size={12} color="#FFD700" />
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  unlockedContent: {
    width: '100%',
  },
  lockedContent: {
    width: '100%',
    opacity: 0.45,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 15, 18, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  lockIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proTagText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  badgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },
});