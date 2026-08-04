import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type DifficultyType = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

interface SearchFilterHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedDifficulty: DifficultyType;
  onSelectDifficulty: (difficulty: DifficultyType) => void;
}

export function SearchFilterHeader({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onSelectDifficulty,
}: SearchFilterHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.searchSection, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search skills, categories..."
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Text style={[styles.clearSearchText, { color: theme.subtext }]}>✕</Text>
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
              style={[
                styles.chip,
                { backgroundColor: theme.border, borderColor: theme.border },
                active && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              onPress={() => onSelectDifficulty(level)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: theme.subtext },
                  active && styles.activeChipText,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15 },
  clearSearchText: { fontSize: 16, fontWeight: 'bold', paddingLeft: 8 },
  chipScroll: { marginTop: 12, flexDirection: 'row' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  activeChipText: { color: '#000000', fontWeight: 'bold' },
});