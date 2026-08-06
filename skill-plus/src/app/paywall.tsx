import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../context/ThemeContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        setPackages(offerings.current.availablePackages);
        setSelectedPackage(offerings.current.availablePackages[0]);
      }
    } catch (e: any) {
      console.error('Error fetching offerings:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (customerInfo.entitlements.active['pro_access'] !== undefined) {
        Alert.alert('Welcome to Skill Plus Pro!', 'Your subscription is now active.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Success', 'Thank you for your purchase!');
        router.back();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert('Restored', 'Your purchases have been successfully restored.');
      } else {
        Alert.alert('No Purchases Found', 'We could not find any active subscriptions.');
      }
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background || '#121212' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={[styles.closeText, { color: theme.subtext || '#888888' }]}>✕</Text>
        </TouchableOpacity>

        {/* Header Hero Section with Orange Gradient Badge */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#FF8C00', '#FF4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badgeGradient}
          >
            <Text style={styles.badgeText}>SKILL PLUS PRO</Text>
          </LinearGradient>

          <Text style={[styles.title, { color: theme.text || '#FFFFFF' }]}>
            Unlock Your Full Potential
          </Text>

          <Text style={[styles.subtitle, { color: theme.subtext || '#A0A0A0' }]}>
            Get unlimited access to premium skill verification, advanced tracking, and exclusive community features.
          </Text>
        </View>

        {/* Feature Highlights Card */}
        <View style={[styles.featuresList, { backgroundColor: theme.card || '#1E1E1E', borderColor: theme.border || '#2A2A2A' }]}>
          <FeatureRow title="Unlimited Skill Submissions" description="Upload and verify as many skills as you want" subtextColor={theme.subtext} textColor={theme.text} />
          <FeatureRow title="Priority Review" description="Get your proofs verified faster by the community" subtextColor={theme.subtext} textColor={theme.text} />
          <FeatureRow title="Advanced Analytics" description="Track your growth with detailed progress insights" subtextColor={theme.subtext} textColor={theme.text} />
          <FeatureRow title="Pro Profile Badge" description="Stand out with a verified pro member badge" subtextColor={theme.subtext} textColor={theme.text} />
        </View>

        {/* Offerings Selector */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginVertical: 40 }} />
        ) : packages.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card || '#1E1E1E' }]}>
            <Text style={[styles.emptyText, { color: theme.subtext || '#888888' }]}>
              No active subscription plans found in RevenueCat dashboard.
            </Text>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  onPress={() => setSelectedPackage(pkg)}
                  activeOpacity={0.8}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#FF8C00', '#FF4500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.selectedGradientBorder}
                    >
                      <View style={[styles.packageCardInner, { backgroundColor: theme.card || '#1A1A1A' }]}>
                        <View style={styles.packageInfo}>
                          <Text style={[styles.packageTitle, { color: theme.text || '#FFFFFF' }]}>{pkg.product.title}</Text>
                          <Text style={[styles.packageDescription, { color: theme.subtext || '#888888' }]}>{pkg.product.description}</Text>
                        </View>
                        <Text style={styles.orangePriceText}>{pkg.product.priceString}</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.packageCard, { backgroundColor: theme.card || '#1E1E1E', borderColor: theme.border || '#2A2A2A' }]}>
                      <View style={styles.packageInfo}>
                        <Text style={[styles.packageTitle, { color: theme.text || '#FFFFFF' }]}>{pkg.product.title}</Text>
                        <Text style={[styles.packageDescription, { color: theme.subtext || '#888888' }]}>{pkg.product.description}</Text>
                      </View>
                      <Text style={[styles.packagePrice, { color: theme.text || '#FFFFFF' }]}>{pkg.product.priceString}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Orange Gradient CTA Button */}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={!selectedPackage || purchasing}
          activeOpacity={0.8}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={selectedPackage && !purchasing ? ['#FF8C00', '#FF4500'] : ['#4A4A4A', '#333333']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.buyButton, (!selectedPackage || purchasing) && styles.disabledButton]}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buyButtonText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={[styles.footerLink, { color: theme.subtext || '#777777' }]}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({
  title,
  description,
  textColor,
  subtextColor,
}: {
  title: string;
  description: string;
  textColor?: string;
  subtextColor?: string;
}) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureCheck}>✓</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.featureTitle, { color: textColor || '#FFFFFF' }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: subtextColor || '#888888' }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 12,
  },
  closeText: {
    fontSize: 22,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  badgeGradient: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 28,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureCheck: {
    color: '#FF6B00',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  packagesContainer: {
    gap: 14,
    marginBottom: 24,
  },
  selectedGradientBorder: {
    borderRadius: 16,
    padding: 2,
  },
  packageCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 18,
  },
  packageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  packageInfo: {
    flex: 1,
    paddingRight: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  packageDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  orangePriceText: {
    color: '#FF6B00',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  buyButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});