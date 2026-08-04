import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  isEditing: boolean;
  displayName: string;
  setDisplayName: (val: string) => void;
  bioTagline: string;
  setBioTagline: (val: string) => void;
  email?: string;
}

export function ProfileInfoCard({
  isEditing,
  displayName,
  setDisplayName,
  bioTagline,
  setBioTagline,
  email,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>Account & Profile</Text>

      {/* Display Name */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Display Name</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
            placeholderTextColor={theme.emptyText || '#666'}
          />
        ) : (
          <Text style={[styles.fieldValue, { color: theme.text }]}>{displayName}</Text>
        )}
      </View>

      {/* Bio / Tagline */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Bio / Personal Goal</Text>
        {isEditing ? (
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
            ]}
            value={bioTagline}
            onChangeText={setBioTagline}
            multiline
            placeholder="Share your learning focus..."
            placeholderTextColor={theme.emptyText || '#666'}
          />
        ) : (
          <Text style={[styles.fieldValue, { color: theme.text }]}>{bioTagline}</Text>
        )}
      </View>

      {/* Email Address */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.subtext }]}>Email Address</Text>
        <Text style={[styles.fieldValue, { color: theme.subtext }]}>{email || 'N/A'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
});