import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<GenderOption>('Prefer not to say');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const genderOptions: GenderOption[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleRegister = async () => {
    // Basic presence check
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    // Password match check
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    // Password length check
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Note: Pass gender alongside email/password/name if your AuthContext/Appwrite user preferences support it
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Sign up to start tracking your skills and progress
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor={theme.subtext}
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
          <TextInput
            placeholder="name@example.com"
            placeholderTextColor={theme.subtext}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Gender Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => {
              const isSelected = gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderChip,
                    isSelected
                      ? { backgroundColor: theme.accent, borderColor: theme.accent }
                      : { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => setGender(option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderText,
                      isSelected
                        ? { color: isDark ? '#000000' : '#ffffff', fontWeight: 'bold' }
                        : { color: theme.subtext },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Password</Text>
          <TextInput
            placeholder="At least 8 characters"
            placeholderTextColor={theme.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[
              styles.input,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
          <TextInput
            placeholder="Re-enter your password"
            placeholderTextColor={theme.subtext}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[
              styles.input,
              { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
            ]}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={isDark ? '#000000' : '#ffffff'} />
          ) : (
            <Text style={[styles.primaryBtnText, { color: isDark ? '#000000' : '#ffffff' }]}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.footerRow}>
          <Text style={{ color: theme.subtext }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { color: theme.accent }]}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 12,
  },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginLink: {
    fontWeight: 'bold',
  },
});