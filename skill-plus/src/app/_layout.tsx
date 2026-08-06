import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ProProvider } from '../context/ProContext';

export default function RootLayout() {
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        if (typeof Purchases.canMakePayments === 'function') {
          const isConfigured = await Purchases.isConfigured();

          if (!isConfigured) {
            if (__DEV__) {
              Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
            }

            const apiKey =
              process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ||
              'test_mxqsJBsYysfxsVuDSCyMeGTAaEl';

            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              Purchases.configure({ apiKey });
            }
          }
        }
      } catch (err) {
        console.warn('RevenueCat config error:', err);
      } finally {
        setIsSdkReady(true);
      }
    };

    initRevenueCat();
  }, []);

  // Block ALL context providers until RevenueCat configuration is guaranteed complete
  if (!isSdkReady) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ProProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="skill-proof/[id]" />
            <Stack.Screen
              name="paywall"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </ProProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}