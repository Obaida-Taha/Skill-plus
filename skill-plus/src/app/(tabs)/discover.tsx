import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ID, Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';

// Types
type DifficultyType = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

type SkillItem = {
  $id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: string;
  description: string;
  subCategory: string;
  category: string;
};

type CategoryGroup = {
  name: string;
  icon: string;
  subCategories: { [subCategoryName: string]: SkillItem[] };
};

export default function DiscoverScreen() {
  const router = useRouter();

  // Loading & Master Database State
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState<SkillItem[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);

  // Navigation State
  const [selectedCategory, setSelectedCategory] = useState<CategoryGroup | null>(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>('All');

  // Fetch from Appwrite
  useEffect(() => {
    fetchDiscoverSkills();
  }, []);

  const fetchDiscoverSkills = async () => {
    try {
      setLoading(true);

      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
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

        if (response.documents.length < limit) {
          break;
        }

        offset += limit;
      }

      // Format flat skill items
      const parsedSkills: SkillItem[] = fetchedDocs.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name || 'Untitled Skill',
        difficulty: doc.difficulty || 'Beginner',
        estimatedHours: doc.estimatedHours || '1h',
        description: doc.description || '',
        subCategory: doc.subCategory || 'Misc',
        category: doc.category || 'General',
      }));

      setAllSkills(parsedSkills);

      // Group flat Appwrite documents into nested Category -> SubCategory structure
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
          name: doc.name,
          difficulty: doc.difficulty,
          estimatedHours: doc.estimatedHours,
          description: doc.description,
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

  // --- FILTERING LOGIC ---
  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      // Search term filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === 'All' || skill.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [allSkills, searchQuery, selectedDifficulty]);

  // Check if search active
  const isSearching = searchQuery.trim().length > 0;

  const handleLearnSkill = async (skill: SkillItem) => {
    try {
      const currentUser = await account.get();

      const dbId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'skills-collection';
      const userSkillsColId = 'user_skills';

      await databases.createDocument(dbId, userSkillsColId, ID.unique(), {
        userId: currentUser.$id,
        skillId: skill.$id,
        name: skill.name,
        category: skill.category,
        subCategory: skill.subCategory,
        difficulty: skill.difficulty,
        status: 'In Progress',
      });

      setSelectedSkill(null);
      router.push('/(tabs)/skills' as any);
    } catch (error: any) {
      console.error('Error adding skill:', error.message);
      Alert.alert('Error', 'Failed to add skill: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={{ color: '#aaa', marginTop: 12 }}>Loading skills database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* FILTER & SEARCH HEADER */}
      <View style={styles.searchSection}>
        {/* Search Bar Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}></Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search skills, categories..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Difficulty Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as DifficultyType[]).map((level) => {
            const active = selectedDifficulty === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setSelectedDifficulty(level)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Breadcrumb Navigation (Hidden when global search is active) */}
      {!isSearching && (selectedCategory || selectedSubCategoryName) && (
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity
            onPress={() => {
              if (selectedSubCategoryName) {
                setSelectedSubCategoryName(null);
              } else {
                setSelectedCategory(null);
              }
            }}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbTitle}>
            {selectedSubCategoryName || selectedCategory?.name}
          </Text>
        </View>
      )}

      {/* VIEW A: Global Search Results (Triggers automatically when typing) */}
      {isSearching ? (
        <ScrollView style={styles.listContainer}>
          <Text style={styles.headerTitle}>Search Results ({filteredSkills.length})</Text>
          {filteredSkills.length === 0 ? (
            <Text style={styles.emptyText}>No skills match your query.</Text>
          ) : (
            filteredSkills.map((skill) => (
              <TouchableOpacity
                key={skill.$id}
                style={styles.skillCard}
                onPress={() => setSelectedSkill(skill)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillMeta}>
                    {skill.category} • {skill.subCategory} • {skill.difficulty} • ~{skill.estimatedHours}
                  </Text>
                </View>
                <Text style={styles.infoBadge}>Info</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <>
          {/* VIEW 1: Categories */}
          {!selectedCategory && (
            <ScrollView style={styles.listContainer}>
              <Text style={styles.headerTitle}>Explore Categories</Text>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No skills found in database yet.</Text>
              ) : (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={styles.card}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={styles.cardIcon}>{category.icon}</Text>
                    <Text style={styles.cardTitle}>{category.name}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {/* VIEW 2: Subcategories */}
          {selectedCategory && !selectedSubCategoryName && (
            <ScrollView style={styles.listContainer}>
              <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
              {Object.keys(selectedCategory.subCategories).map((subName) => {
                // Count subcategory skills respecting difficulty filter
                const subSkillsCount = selectedCategory.subCategories[subName].filter(
                  (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
                ).length;

                return (
                  <TouchableOpacity
                    key={subName}
                    style={styles.card}
                    onPress={() => setSelectedSubCategoryName(subName)}
                  >
                    <Text style={styles.cardTitle}>{subName}</Text>
                    <Text style={styles.badge}>{subSkillsCount} Skills</Text>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* VIEW 3: Filtered Skills List */}
          {selectedCategory && selectedSubCategoryName && (
            <ScrollView style={styles.listContainer}>
              <Text style={styles.headerTitle}>{selectedSubCategoryName}</Text>
              {(() => {
                const subCategorySkills = selectedCategory.subCategories[
                  selectedSubCategoryName
                ].filter(
                  (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
                );

                if (subCategorySkills.length === 0) {
                  return (
                    <Text style={styles.emptyText}>
                      No skills found for difficulty level "{selectedDifficulty}".
                    </Text>
                  );
                }

                return subCategorySkills.map((skill) => (
                  <TouchableOpacity
                    key={skill.$id}
                    style={styles.skillCard}
                    onPress={() => setSelectedSkill(skill)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <Text style={styles.skillMeta}>
                        {skill.difficulty} • ~{skill.estimatedHours}
                      </Text>
                    </View>
                    <Text style={styles.infoBadge}>Info</Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          )}
        </>
      )}

      {/* SKILL DETAIL MODAL */}
      <Modal
        visible={!!selectedSkill}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSkill(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSkill && (
              <>
                <Text style={styles.modalTitle}>{selectedSkill.name}</Text>

                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{selectedSkill.difficulty}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>⏳ {selectedSkill.estimatedHours}</Text>
                  </View>
                </View>

                <Text style={styles.modalDescriptionTitle}>Description</Text>
                <Text style={styles.modalDescription}>{selectedSkill.description}</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setSelectedSkill(null)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.learnButton}
                    onPress={() => handleLearnSkill(selectedSkill)}
                  >
                    <Text style={styles.learnButtonText}>Learn Skill</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  center: { justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#71717a', fontSize: 14, textAlign: 'center', marginTop: 32 },

  // Search & Filters Header
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 15 },
  clearSearchText: { color: '#a1a1aa', fontSize: 16, fontWeight: 'bold', paddingLeft: 8 },

  chipScroll: { marginTop: 12, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#27272a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  activeChip: {
    backgroundColor: '#a78bfa',
    borderColor: '#a78bfa',
  },
  chipText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
  activeChipText: { color: '#000000', fontWeight: 'bold' },

  // Breadcrumbs
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButtonText: { color: '#a78bfa', fontSize: 16, fontWeight: 'bold', marginRight: 16 },
  breadcrumbTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },

  // Cards & Rows
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardIcon: { fontSize: 20, marginRight: 12 },
  cardTitle: { flex: 1, color: '#ffffff', fontSize: 16, fontWeight: '600' },
  chevron: { color: '#71717a', fontSize: 20 },
  badge: { color: '#a78bfa', fontSize: 12, marginRight: 8 },
  skillCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  skillName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  skillMeta: { color: '#a1a1aa', fontSize: 12, marginTop: 4 },
  infoBadge: { color: '#a78bfa', fontSize: 13, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  tagRow: { flexDirection: 'row', marginBottom: 16 },
  tag: { backgroundColor: '#27272a', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginRight: 8 },
  tagText: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },
  modalDescriptionTitle: { color: '#888888', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  modalDescription: { color: '#d4d4d8', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { flex: 1, backgroundColor: '#27272a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: '#ffffff', fontWeight: 'bold' },
  learnButton: { flex: 1, backgroundColor: '#a78bfa', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  learnButtonText: { color: '#000000', fontWeight: 'bold' },
});