import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  dark: {
    background: '#121214',
    card: '#18181b',
    border: '#27272a',
    text: '#ffffff',
    subtext: '#a1a1aa',
    accent: '#a78bfa',
    inputBg: '#27272a',
    chipBorder: '#3f3f46',
    modalOverlay: 'rgba(0, 0, 0, 0.75)',
    emptyText: '#71717a',
  },
  light: {
    background: '#f4f4f5',
    card: '#ffffff',
    border: '#e4e4e7',
    text: '#18181b',
    subtext: '#71717a',
    accent: '#7c3aed',
    inputBg: '#e4e4e7',
    chipBorder: '#d4d4d8',
    modalOverlay: 'rgba(0, 0, 0, 0.4)',
    emptyText: '#a1a1aa',
  },
};

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: typeof palette.dark;
  mode: ThemeType;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();

  // Helper to ensure state only ever receives 'light' or 'dark'
  const getValidTheme = (scheme: typeof systemScheme): ThemeType => {
    return scheme === 'light' ? 'light' : 'dark';
  };

  const [mode, setMode] = useState<ThemeType>(getValidTheme(systemScheme));

  useEffect(() => {
    setMode(getValidTheme(systemScheme));
  }, [systemScheme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = mode === 'dark';
  const theme = palette[mode];

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};