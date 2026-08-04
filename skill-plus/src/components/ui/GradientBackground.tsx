import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={['#121212', '#1A1A1A', '#802800', '#D35400']}
      locations={[0, 0.55, 0.88, 1]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});