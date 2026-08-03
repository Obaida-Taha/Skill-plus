import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';

type UserSkill = {
  $id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: string;
  status: string;
};

export default function SkillsScreen() {
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);

  // useFocusEffect runs EVERY time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserSkills();
    }, [])
  );

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();

      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
      const userSkillsColId = 'user_skills';

      // Fetch documents matching current user ID
      const response = await databases.listDocuments(dbId, userSkillsColId, [
        Query.equal('userId', currentUser.$id),
      ]);

      setUserSkills(response.documents as unknown as UserSkill[]);
    } catch (error: any) {
      console.error('Error loading my skills:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Learning List</Text>

      {userSkills.length === 0 ? (
        <View style={styles.centerEmpty}>
          <Text style={styles.emptyText}>You haven't selected any skills yet.</Text>
          <Text style={styles.subEmptyText}>
            Go to the Discover tab to explore and add new skills!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {userSkills.map((skill) => (
            <View key={skill.$id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.skillTitle}>{skill.name}</Text>
                <Text style={styles.categorySub}>
                  {skill.category} • {skill.subCategory}
                </Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{skill.difficulty}</Text>
                  </View>
                  <View style={[styles.tag, styles.statusTag]}>
                    <Text style={styles.statusText}>{skill.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', padding: 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  centerEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  subEmptyText: { color: '#71717a', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  list: { flex: 1 },
  card: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardContent: { flex: 1 },
  skillTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  categorySub: { color: '#a1a1aa', fontSize: 12, marginTop: 4, marginBottom: 12 },
  tagRow: { flexDirection: 'row' },
  tag: { backgroundColor: '#27272a', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginRight: 8 },
  tagText: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },
  statusTag: { backgroundColor: '#2e1065' },
  statusText: { color: '#c4b5fd', fontSize: 12, fontWeight: '600' },
});