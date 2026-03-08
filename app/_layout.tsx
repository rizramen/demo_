import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import 'react-native-reanimated';
import { useState } from 'react';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Crosshair } from '@/components/crosshair';

export const unstable_settings = {
  anchor: '(tabs)',
};

const ACCESS_PASSWORD = 'demonhug';
const BACKGROUND_VIDEO_SOURCE = require('../assets/videos/poison ivy.mov');

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

const transparentDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

function BackgroundVideoField({
  viewportWidth,
  viewportHeight,
}: {
  viewportWidth: number;
  viewportHeight: number;
}) {
  const aspectRatio = viewportHeight / Math.max(viewportWidth, 1);
  // Taller screens get more vertical stretch so the bottom is always filled.
  const verticalStretch = Math.min(1.7, Math.max(1.08, 1 + Math.max(0, aspectRatio - 1.45) * 0.55));
  const stretchedHeight = viewportHeight * verticalStretch;

  return (
    <View style={styles.backgroundVideoField} pointerEvents="none">
      <Video
        source={BACKGROUND_VIDEO_SOURCE}
        style={[styles.backgroundVideoTile, { top: 0, height: stretchedHeight }]}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <Video
        source={BACKGROUND_VIDEO_SOURCE}
        style={[styles.backgroundVideoTile, { top: stretchedHeight - 1, height: stretchedHeight }]}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleUnlock = () => {
    // Keep auth intentionally local/client-side; this is a UI gate, not secure auth.
    if (passwordInput === ACCESS_PASSWORD) {
      setIsUnlocked(true);
      setErrorText('');
      return;
    }

    setErrorText('Are you supposed to be here?');
  };

  if (!isUnlocked) {
    return (
      <View style={styles.root}>
        <BackgroundVideoField viewportWidth={width} viewportHeight={height} />
        <View style={styles.backgroundShade} />
        <Crosshair />
        <View style={styles.lockContainer}>
          <Text style={styles.lockTitle}>rizramen&apos;s vault</Text>
          <Text style={styles.lockSubtitle}>Enter password to continue</Text>
          <TextInput
            style={styles.passwordInput}
            value={passwordInput}
            onChangeText={setPasswordInput}
            placeholder="Password"
            placeholderTextColor="#d6d6d6"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleUnlock}
          />
          {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
          <Pressable style={styles.unlockButton} onPress={handleUnlock}>
            <Text style={styles.unlockButtonText}>Unlock</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackgroundVideoField viewportWidth={width} viewportHeight={height} />
      <View style={styles.backgroundShade} />
      <Crosshair />
      <View style={styles.contentLayer}>
        {/* Transparent navigation theme lets the background video stay visible behind tabs. */}
        <ThemeProvider value={colorScheme === 'dark' ? transparentDarkTheme : transparentTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundVideoField: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundVideoTile: {
    position: 'absolute',
    left: 0,
    width: '100%',
  },
  backgroundShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  contentLayer: {
    flex: 1,
  },
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'dystropiax',
    color: '#fff',
    marginBottom: 6,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  passwordInput: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorText: {
    color: '#ff8585',
    marginBottom: 10,
  },
  unlockButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
