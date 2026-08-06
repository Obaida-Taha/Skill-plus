import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  refetchProStatus: () => Promise<void>;
  refreshProStatus: () => Promise<void>; // Added alias for compatibility
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  isLoading: true,
  refetchProStatus: async () => {},
  refreshProStatus: async () => {},
});

export const ProProvider = ({ children }: { children: ReactNode }) => {
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkEntitlements = async () => {
    try {
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) return;

      const customerInfo = await Purchases.getCustomerInfo();
      
      console.log('--- REVENUECAT ENTITLEMENT DEBUG ---');
      console.log('Current RevenueCat User ID:', customerInfo.originalAppUserId);
      console.log('Active Entitlements Object:', JSON.stringify(customerInfo.entitlements.active));
      console.log('Is "pro" active?:', typeof customerInfo.entitlements.active['pro'] !== 'undefined');

      const activePro = typeof customerInfo.entitlements.active['pro'] !== 'undefined';
      setIsPro(activePro);
    } catch (e) {
      console.warn('RevenueCat check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkEntitlements();

    const updateListener = (info: CustomerInfo) => {
      const activePro = typeof info.entitlements.active['pro'] !== 'undefined';
      setIsPro(activePro);
    };

    if (typeof Purchases.addCustomerInfoUpdateListener === 'function') {
      Purchases.addCustomerInfoUpdateListener(updateListener);
    }

    return () => {
      if (typeof Purchases.removeCustomerInfoUpdateListener === 'function') {
        Purchases.removeCustomerInfoUpdateListener(updateListener);
      }
    };
  }, []);

  return (
    <ProContext.Provider 
      value={{ 
        isPro, 
        isLoading, 
        refetchProStatus: checkEntitlements,
        refreshProStatus: checkEntitlements, // Maps refreshProStatus to checkEntitlements
      }}
    >
      {children}
    </ProContext.Provider>
  );
};

export const useProStatus = () => useContext(ProContext);