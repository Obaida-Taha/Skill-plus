import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext'; 

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY || 'test_mxqsJBsYysfxsVuDSCyMeGTAaEl';

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Purchases.configure({ apiKey });
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="skill-proof/[id]" />
          
          {/* Paywall screen configured as a modal */}
          <Stack.Screen 
            name="paywall" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}