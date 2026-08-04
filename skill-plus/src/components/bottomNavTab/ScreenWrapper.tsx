import React from 'react';
import { StyleSheet, View, ScrollView, ViewStyle } from 'react-native';
import { useBottomTabBarHeight } from 'expo-router/tabs';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
}

export function ScreenWrapper({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
}: ScreenWrapperProps) {
  let tabBarHeight = 0;

  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    // Fallback height if rendered outside a tab navigator
    tabBarHeight = 64;
  }

  const dynamicPaddingBottom = tabBarHeight + 24;

  if (!scrollable) {
    return (
      <View style={[styles.container, style, { paddingBottom: dynamicPaddingBottom }]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
        { paddingBottom: dynamicPaddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});