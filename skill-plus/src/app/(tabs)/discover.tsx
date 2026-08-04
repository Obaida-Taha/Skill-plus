import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ID, Query } from 'react-native-appwrite';
import { account, databases } from '../../lib/appwrite';
import { useTheme } from '../../context/ThemeContext';
import {
  SearchFilterHeader,
  DifficultyType,
} from '../../components/SearchFilterHeader';
import { CategoryCard } from '../../components/CategoryCard';
import { DiscoverSkillCard, SkillItem } from '../../components/DiscoverSkillCard';
import { SkillDetailModal } from '../../components/SkillDetailModal';

type CategoryGroup = {
  name: string;
  icon: string;
  subCategories: { [subCategoryName: string]: SkillItem[] };
};

export default function DiscoverScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  // Loading & Database State
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

        if (response.documents.length < limit) break;
        offset += limit;
      }

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

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === 'All' || skill.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [allSkills, searchQuery, selectedDifficulty]);

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
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.subtext, marginTop: 12 }}>Loading skills database...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Filter & Search Header Component */}
      <SearchFilterHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
      />

      {/* Breadcrumb Bar */}
      {!isSearching && (selectedCategory || selectedSubCategoryName) && (
        <View style={[styles.breadcrumbBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => {
              if (selectedSubCategoryName) {
                setSelectedSubCategoryName(null);
              } else {
                setSelectedCategory(null);
              }
            }}
          >
            <Text style={[styles.backButtonText, { color: theme.accent }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.breadcrumbTitle, { color: theme.text }]}>
            {selectedSubCategoryName || selectedCategory?.name}
          </Text>
        </View>
      )}

      {/* VIEW A: Search Results */}
      {isSearching ? (
        <ScrollView style={styles.listContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Search Results ({filteredSkills.length})
          </Text>
          {filteredSkills.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No skills match your query.
            </Text>
          ) : (
            filteredSkills.map((skill) => (
              <DiscoverSkillCard
                key={skill.$id}
                skill={skill}
                showCategoryMeta
                onPress={() => setSelectedSkill(skill)}
              />
            ))
          )}
        </ScrollView>
      ) : (
        <>
          {/* VIEW 1: Categories */}
          {!selectedCategory && (
            <ScrollView style={styles.listContainer}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Explore Categories</Text>
              {categories.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.subtext }]}>
                  No skills found in database yet.
                </Text>
              ) : (
                categories.map((category) => (
                  <CategoryCard
                    key={category.name}
                    title={category.name}
                    icon={category.icon}
                    onPress={() => setSelectedCategory(category)}
                  />
                ))
              )}
            </ScrollView>
          )}

          {/* VIEW 2: Subcategories */}
          {selectedCategory && !selectedSubCategoryName && (
            <ScrollView style={styles.listContainer}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {selectedCategory.name}
              </Text>
              {Object.keys(selectedCategory.subCategories).map((subName) => {
                const subSkillsCount = selectedCategory.subCategories[subName].filter(
                  (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
                ).length;

                return (
                  <CategoryCard
                    key={subName}
                    title={subName}
                    badgeCount={subSkillsCount}
                    onPress={() => setSelectedSubCategoryName(subName)}
                  />
                );
              })}
            </ScrollView>
          )}

          {/* VIEW 3: Filtered Subcategory Skills */}
          {selectedCategory && selectedSubCategoryName && (
            <ScrollView style={styles.listContainer}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {selectedSubCategoryName}
              </Text>
              {(() => {
                const subCategorySkills = selectedCategory.subCategories[
                  selectedSubCategoryName
                ].filter(
                  (s) => selectedDifficulty === 'All' || s.difficulty === selectedDifficulty
                );

                if (subCategorySkills.length === 0) {
                  return (
                    <Text style={[styles.emptyText, { color: theme.subtext }]}>
                      No skills found for difficulty level "{selectedDifficulty}".
                    </Text>
                  );
                }

                return subCategorySkills.map((skill) => (
                  <DiscoverSkillCard
                    key={skill.$id}
                    skill={skill}
                    onPress={() => setSelectedSkill(skill)}
                  />
                ));
              })()}
            </ScrollView>
          )}
        </>
      )}

      {/* Skill Detail Modal Component */}
      <SkillDetailModal
        selectedSkill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onLearnSkill={handleLearnSkill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 32 },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButtonText: { fontSize: 16, fontWeight: 'bold', marginRight: 16 },
  breadcrumbTitle: { fontSize: 16, fontWeight: 'bold' },
});