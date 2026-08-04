import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  dark: {
    background: '#121212',                // Matte Black main background
    card: 'rgba(22, 22, 22, 0.90)',        // Glassy matte dark card
    border: 'rgba(255, 111, 0, 0.25)',      // Subtle orange glow border
    text: '#ffffff',                       // Primary white text
    subtext: '#a0a0a0',                    // Secondary subtle text
    accent: '#FF6F00',                     // Vibrant Matte Orange
    accentDark: '#E65100',                 // Deep Burnt Orange
    inputBg: '#121212',                    // Dark input field background
    chipBorder: 'rgba(255, 111, 0, 0.30)', // Orange chip border
    modalOverlay: 'rgba(0, 0, 0, 0.85)',   // Deep dark overlay
    emptyText: '#666666',                  // Muted placeholder text
    progressTrack: '#242424',             // Background track for progress bars
    xpBadgeBg: 'rgba(255, 111, 0, 0.15)',  // Subtle orange tint badge background
  },
  light: {
    // Light mode adjusted to complement the orange theme
    background: '#F9F9F9',
    card: '#FFFFFF',
    border: '#E0E0E0',
    text: '#1A1A1A',
    subtext: '#666666',
    accent: '#E65100',
    accentDark: '#BF360C',
    inputBg: '#F0F0F0',
    chipBorder: '#CCCCCC',
    modalOverlay: 'rgba(0, 0, 0, 0.4)',
    emptyText: '#999999',
    progressTrack: '#E0E0E0',
    xpBadgeBg: 'rgba(230, 81, 0, 0.10)',
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