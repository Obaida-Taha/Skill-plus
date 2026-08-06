import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProStatus } from '../../context/ProContext';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isPro, refreshProStatus } = useProStatus();
  const router = useRouter();

  const [restoring, setRestoring] = useState(false);

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
    router.push('/profile');
  };

  const handleNavigatePaywall = () => {
    console.log('Navigating to paywall screen...');
    router.push('/paywall');
  };

  const handleRestorePurchases = async () => {
    try {
      setRestoring(true);
      const customerInfo = await Purchases.restorePurchases();
      
      // Update global ProContext
      if (refreshProStatus) {
        await refreshProStatus();
      }

      const hasActivePro = typeof customerInfo.entitlements.active['pro'] !== 'undefined';

      if (hasActivePro) {
        Alert.alert('Success', 'Your Pro membership has been restored!');
      } else {
        Alert.alert('No Purchases Found', 'No active Pro subscription was found for this store account.');
      }
    } catch (error: any) {
      console.error('Restore purchases error:', error);
      Alert.alert('Error', error.message || 'Failed to restore purchases.');
    } finally {
      setRestoring(false);
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
        
        {/* Premium Status / Upgrade Button */}
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowBetween,
            { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleNavigatePaywall}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.proBadge}>👑 PRO</Text>
            <Text style={[styles.rowText, { color: theme.text, fontWeight: '600' }]}>
              {isPro ? 'Pro Member' : 'Premium'}
            </Text>
          </View>
          <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 14 }}>
            {isPro ? 'Manage ›' : 'Upgrade ›'}
          </Text>
        </Pressable>

        {/* Restore Purchases Button */}
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.rowBetween,
            { borderBottomColor: theme.border, opacity: pressed || restoring ? 0.7 : 1 },
          ]}
          onPress={handleRestorePurchases}
          disabled={restoring}
        >
          <Text style={[styles.rowText, { color: theme.text }]}>Restore Purchases</Text>
          {restoring ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <Text style={{ color: theme.accent, fontSize: 14, fontWeight: '600' }}>Restore</Text>
          )}
        </Pressable>

        {/* Profile Navigation Button */}
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
        <Pressable style={[styles.row, { borderBottomWidth: 0 }]}>
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
  proBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: '#3A2E00',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
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