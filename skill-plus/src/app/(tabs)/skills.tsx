import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SkillsScreen() {
  const router = useRouter();

  // Temporary mock state — set to empty array [] to see the empty state message!
  const [userSkills, setUserSkills] = useState([
    { id: '1', title: 'React Native', category: 'Coding', timeSpentMinutes: 120, progress: '3/5 reps' },
  ]);

  // Handler to navigate to the Discover tab
  const handleGoToDiscover = () => {
    router.push('/(tabs)/discover' as any);
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      {userSkills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No skills added yet</Text>
          <Text style={styles.emptySubtext}>
            Choose your next skill from the discover page to start tracking your progress!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.sectionHeader}>Skills in Progress</Text>
          {userSkills.map((skill) => (
            <View key={skill.id} style={styles.skillCard}>
              <View>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillCategory}>{skill.category}</Text>
              </View>

              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>{skill.timeSpentMinutes} mins logged</Text>
                <TouchableOpacity style={styles.logButton}>
                  <Text style={styles.logButtonText}>+ Log Progress</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Floating Bottom "Add Skill" Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton} onPress={handleGoToDiscover}>
          <Text style={styles.addButtonText}>+ Add Skill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  skillCard: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  skillTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillCategory: {
    color: '#a78bfa',
    fontSize: 12,
    marginTop: 2,
  },
  progressInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#71717a',
    fontSize: 13,
  },
  logButton: {
    backgroundColor: '#27272a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logButtonText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#121214',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  addButton: {
    backgroundColor: '#a78bfa',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});