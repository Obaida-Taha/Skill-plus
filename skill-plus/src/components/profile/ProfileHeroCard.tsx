import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  displayName: string;
  joinedDate: string;
  children?: React.ReactNode;
}

export function ProfileHeroCard({ displayName, joinedDate, children }: Props) {
  const { theme } = useTheme();

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'SP';
    const parts = nameStr.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Avatar Circle with Orange Ring */}
      <View style={[styles.avatarRing, { borderColor: theme.accent }]}>
        <View style={[styles.avatarInner, { backgroundColor: theme.inputBg }]}>
          <Text style={[styles.avatarInitials, { color: theme.accent }]}>
            {getInitials(displayName)}
          </Text>
        </View>
      </View>

      <Text style={[styles.userName, { color: theme.text }]}>{displayName}</Text>
      <Text style={[styles.memberSince, { color: theme.subtext }]}>
        Member since {joinedDate}
      </Text>

      {/* Renders ProfileStatsRow passed as a child */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
  },
  memberSince: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
});