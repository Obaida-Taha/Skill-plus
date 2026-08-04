import React, { createContext, useContext, useEffect, useState } from 'react';
import { Query } from 'react-native-appwrite';
import { account, databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID, ID } from '../lib/appwrite';

type AuthContextType = {
  user: any;
  userProfile: any; // <-- Added userProfile state
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // <-- Added to manually update profile state when streak changes
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null); // <-- Profile document state
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create user profile document in Appwrite DB
  const fetchOrCreateUserProfile = async (userId: string) => {
    // Safeguard: Ensure userId exists before querying Appwrite
    if (!userId || typeof userId !== 'string') {
      console.warn('fetchOrCreateUserProfile called without a valid userId');
      return null;
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (response.documents.length > 0) {
        return response.documents[0];
      }

      // First-time setup: create initial profile document
      return await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          streakCount: 0,
          lastPracticeDate: null,
        }
      );
    } catch (error) {
      console.error('Error in fetchOrCreateUserProfile:', error);
      return null;
    }
  };
  
  const refreshUserProfile = async () => {
    if (user?.$id) {
      const profile = await fetchOrCreateUserProfile(user.$id);
      setUserProfile(profile);
    }
  };

  // Check for active session when app starts
  const checkUserSession = async () => {
    try {
      const currentAccount = await account.get();
      setUser(currentAccount);

      // Fetch associated profile
      const profile = await fetchOrCreateUserProfile(currentAccount.$id);
      setUserProfile(profile);
    } catch (error) {
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    const currentAccount = await account.get();
    setUser(currentAccount);

    const profile = await fetchOrCreateUserProfile(currentAccount.$id);
    setUserProfile(profile);
  };

  const register = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.log('Appwrite session delete error:', error);
    } finally {
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        login,
        register,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};