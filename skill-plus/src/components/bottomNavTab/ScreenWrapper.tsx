import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle } from 'react-native';
import { useBottomTabBarHeight } from 'expo-router/tabs';
import { useScrollToTop } from 'expo-router';

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
  const scrollViewRef = useRef<ScrollView>(null);

  // Automatically scroll to top when active tab bar icon is tapped
  useScrollToTop(scrollViewRef);

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
      ref={scrollViewRef}
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