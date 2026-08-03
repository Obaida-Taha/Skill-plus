import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
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
    <ScrollView style={{ flex: 1, backgroundColor: '#121214', padding: 16 }}>
      {/* Profile Header */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#18181b', borderRadius: 8 }}>
        <Text style={{ color: '#888', fontSize: 12 }}>LOGGED IN AS</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
          {user?.name || 'User'}
        </Text>
        <Text style={{ color: '#aaa', fontSize: 14 }}>{user?.email}</Text>
      </View>

      {/* Options List */}
      <View style={{ backgroundColor: '#18181b', borderRadius: 8, marginBottom: 24 }}>
        <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Help & Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Working Logout Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#27272a',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: '#ff5555', fontSize: 16, fontWeight: 'bold' }}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}