import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { TabVisibilityProvider } from '@/src/context/tab-visibility-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [visibleBySection, setVisibleBySection] = useState({
    vault: true,
    archive: true,
  });

  const setSectionVisibility = (section: 'vault' | 'archive', nextValue: boolean) => {
    setVisibleBySection((previous) => ({
      ...previous,
      [section]: nextValue,
    }));
  };

  return (
    <TabVisibilityProvider
      value={{
        // Screens use this signal to stop playback when they are not meant to render audio.
        isVisible: (section) => visibleBySection[section],
      }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          animation: 'none',
          lazy: true,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarStyle: {
            backgroundColor: 'rgba(0,0,0,0.35)',
            borderTopColor: 'rgba(255,255,255,0.2)',
            position: 'absolute',
          },
          tabBarInactiveTintColor: '#d6d6d6',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Vault',
            unmountOnBlur: true,
          }}
          listeners={() => ({
            tabPress: () => {
              // Ensure the tab becomes active even after a previous unmount cycle.
              setSectionVisibility('vault', true);
            },
          })}
        />
        <Tabs.Screen
          name="archive"
          options={{
            title: 'Archive',
            unmountOnBlur: true,
          }}
          listeners={() => ({
            tabPress: () => {
              // Ensure the tab becomes active even after a previous unmount cycle.
              setSectionVisibility('archive', true);
            },
          })}
        />
      </Tabs>
    </TabVisibilityProvider>
  );
}
