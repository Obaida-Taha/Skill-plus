import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Query, ID, Permission, Role } from 'react-native-appwrite';
import { databases, USER_SKILLS_COLLECTION_ID, DATABASE_ID } from '../../lib/appwrite';
import { useTheme } from '../../context/ThemeContext';
import { ScreenWrapper } from '../../components/bottomNavTab/ScreenWrapper';
import { CategoryCard } from '../../components/discover/CategoryCard';
import { SkillItem } from '../../components/discover/DiscoverSkillCard';
import { PremiumGate } from '../../components/PremiumGate';
import { useProStatus } from '../../context/ProContext';
import { Ionicons } from '@expo/vector-icons';
import {
  SearchFilterHeader,
  DifficultyType,
} from '../../components/discover/SearchFilterHeader';
import { useAuth } from '../../context/AuthContext';

type CategoryGroup = {
  name: string;
  icon: string;
  subCategories: { [subCategoryName: string]: SkillItem[] };
};

export default function DiscoverScreen() {
  const { user } = useAuth();
  const { isPro } = useProStatus();
  const router = useRouter();
  const { theme } = useTheme();

  // Loading & Database State
  const [loading, setLoading] = useState(true);
  const [addingSkill, setAddingSkill] = useState(false);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);

  // Navigation & Breadcrumb State
  const [selectedCategory, setSelectedCategory] = useState<CategoryGroup | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  // Active Skill Detail State (for modal)
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>('All');

  useEffect(() => {
    fetchDiscoverSkills();
  }, []);

  const fetchDiscoverSkills = async () => {
    try {
      setLoading(true);

      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || DATABASE_ID || 'skills-collection';
      const colId = process.env.EXPO_PUBLIC_APPWRITE_DISCOVER_COLLECTION_ID || 'discover_skills';

      let fetchedDocs: any[] = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const response = await databases.listDocuments(dbId, colId, [
          Query.limit(limit),
          Query.offset(offset),
        ]);

        fetchedDocs.push(...response.documents);

        if (response.documents.length < limit) break;
        offset += limit;
      }

      const grouped: { [catName: string]: CategoryGroup } = {};

      fetchedDocs.forEach((doc: any) => {
        const catName = doc.category || 'General';
        const subCatName = doc.subCategory || 'Misc';

        if (!grouped[catName]) {
          grouped[catName] = {
            name: catName,
            icon: doc.icon || '',
            subCategories: {},
          };
        }

        if (!grouped[catName].subCategories[subCatName]) {
          grouped[catName].subCategories[subCatName] = [];
        }

        grouped[catName].subCategories[subCatName].push({
          $id: doc.$id,
          name: doc.name || 'Untitled Skill',
          difficulty: doc.difficulty || 'Beginner',
          estimatedHours: doc.estimatedHours || '1h',
          description: doc.description || 'No description provided.',
          subCategory: subCatName,
          category: catName,
        });
      });

      setCategories(Object.values(grouped));
    } catch (error: any) {
      console.error('Error fetching discover skills:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: CategoryGroup, index: number) => {
    const isFreeCategory = index < 4;

    if (isPro || isFreeCategory) {
      setSelectedCategory(category);
      setSelectedSubCategory(null);
    } else {
      router.push('/paywall');
    }
  };

const handleAddSkillToUser = async (skill: SkillItem) => {
    if (!user?.$id) {
      Alert.alert('Error', 'You must be logged in to add a skill.');
      return;
    }

    try {
      setAddingSkill(true);

      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || DATABASE_ID || 'skills-collection';
      const userSkillsColId =
        process.env.EXPO_PUBLIC_APPWRITE_USER_SKILLS_COLLECTION_ID || USER_SKILLS_COLLECTION_ID || 'user_skills';

      // Payload strictly matching your Appwrite user_skills attributes schema
      const payload = {
        userId: user.$id,
        skillId: skill.$id,
        name: skill.name,
        category: skill.category,
        subCategory: skill.subCategory,
        difficulty: skill.difficulty,
        status: 'In Progress',
        reps: 0,
        timeSpentSeconds: 0,
        isTimerRunning: false,
      };

      await databases.createDocument(
        dbId,
        userSkillsColId,
        ID.unique(),
        payload,
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );

      // Reset UI & state
      setSelectedSkill(null);
      setSelectedCategory(null);
      setSelectedSubCategory(null);

      // Navigate directly to the Skills tab
      router.push('/(tabs)/skills');
    } catch (error: any) {
      console.error('Error adding skill:', error);
      Alert.alert('Error', error.message || 'Failed to add skill. Please try again.');
    } finally {
      setAddingSkill(false);
    }
  };

  // Robust difficulty & search matcher
  const filterSkills = (skills: SkillItem[]) => {
    return skills.filter((skill) => {
      const rawDifficulty = (skill.difficulty || '').toLowerCase().trim();
      const selected = selectedDifficulty.toLowerCase().trim();

      let matchesDifficulty = selected === 'all';
      if (!matchesDifficulty) {
        if (selected === 'beginner') {
          matchesDifficulty = rawDifficulty === 'beginner' || rawDifficulty === 'easy';
        } else if (selected === 'intermediate') {
          matchesDifficulty = rawDifficulty === 'intermediate' || rawDifficulty === 'medium';
        } else if (selected === 'advanced') {
          matchesDifficulty = rawDifficulty === 'advanced' || rawDifficulty === 'hard';
        } else {
          matchesDifficulty = rawDifficulty === selected;
        }
      }

      const matchesSearch =
        searchQuery.trim() === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDifficulty && matchesSearch;
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading skills database...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper style={{ backgroundColor: theme.background }}>
      {/* Integrated Search & Difficulty Header */}
      <SearchFilterHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* --- LEVEL 2: SUBCATEGORIES & SKILLS VIEW --- */}
        {selectedCategory ? (
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (selectedSubCategory) {
                  setSelectedSubCategory(null);
                } else {
                  setSelectedCategory(null);
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color={theme.text} />
              <Text style={[styles.breadcrumbText, { color: theme.subtext }]}>
                Categories / <Text style={{ fontWeight: '700', color: theme.text }}>{selectedCategory.name}</Text>
                {selectedSubCategory && <Text style={{ color: theme.text }}> / {selectedSubCategory}</Text>}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {selectedCategory.name}
            </Text>

            {Object.entries(selectedCategory.subCategories).map(([subCatName, skills]) => {
              const filteredSkills = filterSkills(skills);

              if (filteredSkills.length === 0) return null;

              return (
                <View
                  key={subCatName}
                  style={[
                    styles.subCatSection,
                    { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.subCatHeader}
                    onPress={() =>
                      setSelectedSubCategory(
                        selectedSubCategory === subCatName ? null : subCatName
                      )
                    }
                  >
                    <Text style={[styles.subCatTitle, { color: theme.text }]}>
                      {subCatName} ({filteredSkills.length})
                    </Text>
                    <Ionicons
                      name={selectedSubCategory === subCatName ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.subtext}
                    />
                  </TouchableOpacity>

                  {selectedSubCategory === subCatName && (
                    <View style={styles.skillsList}>
                      {filteredSkills.map((skill) => (
                        <View
                          key={skill.$id}
                          style={[styles.skillCard, { borderTopColor: theme.border }]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.skillName, { color: theme.text }]}>
                              {skill.name}
                            </Text>
                            <Text style={[styles.skillMeta, { color: theme.subtext }]}>
                              {skill.difficulty} • {skill.estimatedHours}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={[styles.viewButton, { backgroundColor: theme.border }]}
                            onPress={() => setSelectedSkill(skill)}
                          >
                            <Text style={[styles.viewButtonText, { color: theme.accent }]}>
                              View Skill
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          /* --- LEVEL 1: CATEGORIES GRID --- */
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Explore Categories</Text>

            <View style={styles.gridContainer}>
              {categories.map((category, index) => {
                const isLocked = isPro ? false : index >= 4;

                return (
                  <PremiumGate
                    key={category.name}
                    isLocked={isLocked}
                    variant="badge"
                    onPress={() => handleCategoryPress(category, index)}
                    style={styles.gateWrapper}
                  >
                    <CategoryCard
                      title={category.name}
                      icon={category.icon}
                      onPress={() => handleCategoryPress(category, index)}
                    />
                  </PremiumGate>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* --- SKILL DETAIL MODAL --- */}
      <Modal
        visible={!!selectedSkill}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSkill(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedSkill && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedSkill.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedSkill(null)}>
                    <Ionicons name="close-circle" size={28} color={theme.subtext} />
                  </TouchableOpacity>
                </View>

                <View style={styles.badgeRow}>
                  <Text style={[styles.badge, { backgroundColor: theme.border, color: theme.text }]}>
                    {selectedSkill.difficulty}
                  </Text>
                  <Text style={[styles.badge, { backgroundColor: theme.border, color: theme.text }]}>
                    {selectedSkill.estimatedHours}
                  </Text>
                </View>

                <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
                <Text style={[styles.descriptionText, { color: theme.subtext }]}>
                  {selectedSkill.description}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.addSkillButton, { backgroundColor: theme.accent }]}
                    onPress={() => handleAddSkillToUser(selectedSkill)}
                    disabled={addingSkill}
                  >
                    {addingSkill ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.addSkillButtonText}>Add Skill</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumbText: {
    fontSize: 14,
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gateWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  subCatSection: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  subCatHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  skillsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  skillCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  skillName: {
    fontSize: 15,
    fontWeight: '600',
  },
  skillMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    marginTop: 'auto',
  },
  addSkillButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addSkillButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});