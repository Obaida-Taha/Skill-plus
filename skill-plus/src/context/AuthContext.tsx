import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, ID } from '../lib/appwrite';

type AuthContextType = {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for active session when app starts
  const checkUserSession = async () => {
    try {
      const currentAccount = await account.get();
      setUser(currentAccount);
    } catch (error) {
      setUser(null);
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
  };

  const register = async (email: string, password: string, name: string) => {
    // 1. Create Appwrite Account
    await account.create(ID.unique(), email, password, name);
    // 2. Automatically log them in after creating account
    await login(email, password);
  };

const logout = async () => {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.log('Appwrite session delete error:', error);
  } finally {
    // ALWAYS reset local user state so the UI responds
    setUser(null);
  }
};

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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