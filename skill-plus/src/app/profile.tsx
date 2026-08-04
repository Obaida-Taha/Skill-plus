import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { account, databases } from '../lib/appwrite';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '../components/bottomNavTab/ScreenWrapper';
import { ProfileHeroCard } from '../components/profile/ProfileHeroCard';
import { ProfileStatsRow } from '../components/profile/ProfileStatsRow';
import { ProfileInfoCard } from '../components/profile/ProfileInfoCard';

const DIFFICULTY_XP: Record<string, number> = { Beginner: 10, Intermediate: 20, Advanced: 35 };

const calculateSkillXP = (skill: any): number => {
  const rate = DIFFICULTY_XP[skill.difficulty] || 10;
  return (skill.reps || 0) * rate + Math.floor(((skill.timeSpentSeconds || 0) / 60) * (rate / 2));
};

const getLevelFromXP = (totalXp: number): number => Math.floor(Math.sqrt(totalXp / 250)) + 1;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user, userProfile } = useAuth(); // <-- Pulled userProfile from useAuth
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bioTagline, setBioTagline] = useState('Focusing on React Native & Design');
  const [joinedDate, setJoinedDate] = useState('Jan 2025');

  const [totalXP, setTotalXP] = useState(0);
  const [userSkillsCount, setUserSkillsCount] = useState(0);

  // Dynamic streak reading from Appwrite user_profiles collection
  const streakDays = userProfile?.streakCount ?? 0;

  const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();
      setDisplayName(currentUser.name || currentUser.email.split('@')[0]);

      if (currentUser.$createdAt) {
        const date = new Date(currentUser.$createdAt);
        setJoinedDate(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }

      const response = await databases.listDocuments(dbId, 'user_skills', [
        Query.equal('userId', currentUser.$id),
      ]);

      const skillsData = response.documents || [];
      setUserSkillsCount(skillsData.length);
      setTotalXP(skillsData.reduce((sum, skill) => sum + calculateSkillXP(skill), 0));
    } catch (error: any) {
      console.error('Error fetching profile details:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display Name cannot be empty');
      return;
    }
    try {
      setSaving(true);
      await account.updateName(displayName.trim());
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Update Failed', error?.message || 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const currentLevel = getLevelFromXP(totalXP);

  if (loading) {
    return (
      <ScreenWrapper style={{ backgroundColor: theme.background }}>
        <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </ScreenWrapper>
    );
  }

 

  return (
    <ScreenWrapper style={{ backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Navigation Bar */}
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backText, { color: theme.accent }]}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.editBtn,
                { backgroundColor: isEditing ? theme.accent : theme.card, borderColor: theme.border },
              ]}
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.editBtnText,
                    { color: isEditing ? (isDark ? '#000000' : '#FFFFFF') : theme.text },
                  ]}
                >
                  {isEditing ? 'Save' : 'Edit Profile'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 1. Hero Card & Stats Row */}
          <ProfileHeroCard displayName={displayName} joinedDate={joinedDate}>
            <ProfileStatsRow
              currentLevel={currentLevel}
              totalXP={totalXP}
              streakDays={streakDays}
              userSkillsCount={userSkillsCount}
            />
          </ProfileHeroCard>

          {/* 2. Account Information Card */}
          <ProfileInfoCard
            isEditing={isEditing}
            displayName={displayName}
            setDisplayName={setDisplayName}
            bioTagline={bioTagline}
            setBioTagline={setBioTagline}
            email={user?.email}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  backBtn: { paddingVertical: 6 },
  backText: { fontSize: 16, fontWeight: '600' },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editBtnText: { fontSize: 14, fontWeight: '700' },
});