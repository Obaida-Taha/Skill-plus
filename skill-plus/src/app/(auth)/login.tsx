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
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
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
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.innerContainer, { paddingTop: Math.max(insets.top + 20, 40) }]}
        >
          {/* Hero Section: Centered Big Icon */}
          <View style={styles.topHeroSection}>
            <View style={styles.iconBadge}>
              <Image
                source={require('../../../assets/images/loginicon/settings.png')}
                style={styles.heroIcon}
              />
            </View>
          </View>

          {/* Text Header */}
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
    paddingBottom: 24,
  },
topHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 111, 0, 0.16)',
    borderWidth: 2,
    borderColor: '#FF6F00',
    justifyContent: 'center', // Centers vertically
    alignItems: 'center',     // Centers horizontally
    shadowColor: '#FF6F00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  heroIcon: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
    tintColor: '#FF6F00',
  },
  headerContainer: {
    marginBottom: 24,
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