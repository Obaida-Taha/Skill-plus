import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#121214',
        },
        headerTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#18181b',
          borderTopColor: '#27272a',
        },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#71717a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Skill Plus',
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          headerTitle: 'My Skills',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerTitle: 'Explore Skills',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}