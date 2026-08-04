import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Adjust import path as needed
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, mode, toggleTheme, isDark } = useTheme();
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
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: theme.border }]}
        >
          <Text style={[styles.rowText, { color: theme.text }]}>Profile</Text>
        </TouchableOpacity>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.row, styles.rowBetween, { borderBottomColor: theme.border }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.rowText, { color: theme.text }]}>Theme</Text>
          <View style={[styles.themeBadge, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.themeBadgeText, { color: theme.accent }]}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={[styles.rowText, { color: theme.text }]}>Help & Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.inputBg }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
  },
});