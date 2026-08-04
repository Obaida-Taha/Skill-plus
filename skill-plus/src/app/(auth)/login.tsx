import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

import GradientBackground from '../../components/ui/GradientBackground';
import CustomInput from '../../components/login_register/CustomInput';
import GradientButton from '../../components/ui/GradientButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Login attempt started for:', email);

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      console.log('Login successful, navigating to tabs...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Appwrite Login Error:', error);
      Alert.alert(
        'Login Failed',
        error?.message || 'Check your credentials or backend environment variables'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      {/* Pressable handles screen dismissal without blocking child component presses */}
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.innerContainer}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <CustomInput
              label="Email"
              placeholder="enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <GradientButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            {/* Registration Link */}
            <View style={styles.linkContainer}>
              <Link href="/(auth)/register">
                <Text style={styles.linkText}>
                  Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
                </Text>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: 'rgba(22, 22, 22, 0.85)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 0, 0.25)',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FF6F00',
    fontWeight: '700',
  },
});