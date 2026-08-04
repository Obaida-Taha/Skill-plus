import React from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleNavigateProfile = () => {
    console.log('Navigating to profile screen...');
    // If your file is at src/app/profile.tsx use '/profile'
    // If your file is inside tabs (src/app/(tabs)/profile.tsx) use '/(tabs)/profile'
    router.push('/profile');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.subtext }]}>LOGGED IN AS</Text>
        <Text style={[styles.userName, { color: theme.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.subtext }]}>{user?.email}</Text>
      </View>

      {/* Options List */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        
        {/* Profile Navigation Button using Pressable */}
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowBetween,
            { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleNavigateProfile}
        >
          <Text style={[styles.rowText, { color: theme.text }]}>Profile</Text>
          <Text style={{ color: theme.subtext, fontSize: 16 }}>›</Text>
        </Pressable>

        {/* Theme Toggle Button */}
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowBetween,
            { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={toggleTheme}
        >
          <Text style={[styles.rowText, { color: theme.text }]}>Theme</Text>
          <View style={[styles.themeBadge, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.themeBadgeText, { color: theme.accent }]}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </Text>
          </View>
        </Pressable>

        {/* Help & Contact */}
        <Pressable style={styles.row}>
          <Text style={[styles.rowText, { color: theme.text }]}>Help & Contact</Text>
        </Pressable>
      </View>

      {/* Logout Button */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.inputBg, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
  },
});