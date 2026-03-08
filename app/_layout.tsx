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

function BackgroundVideo() {
  return (
    <View style={styles.backgroundVideoLayer} pointerEvents="none">
      <Video
        source={BACKGROUND_VIDEO_SOURCE}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.STRETCH}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorText, setErrorText] = useState('');
  const isPhone = width < 768;
  const isNarrowPhone = width < 420;

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
        <BackgroundVideo />
        <View style={styles.backgroundShade} />
        <Crosshair />
        <View style={[styles.lockContainer, isPhone && styles.lockContainerPhone]}>
          <Text style={[styles.lockTitle, isPhone && styles.lockTitlePhone]}>rizramen&apos;s vault</Text>
          <Text style={[styles.lockSubtitle, isPhone && styles.lockSubtitlePhone]}>Enter password to continue</Text>
          <TextInput
            style={[styles.passwordInput, isPhone && styles.passwordInputPhone]}
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
          <Pressable style={[styles.unlockButton, isNarrowPhone && styles.unlockButtonPhone]} onPress={handleUnlock}>
            <Text style={[styles.unlockButtonText, isNarrowPhone && styles.unlockButtonTextPhone]}>Unlock</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BackgroundVideo />
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
  backgroundVideoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
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
  lockContainerPhone: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'dystropiax',
    color: '#fff',
    marginBottom: 6,
  },
  lockTitlePhone: {
    fontSize: 20,
    marginBottom: 4,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
  lockSubtitlePhone: {
    fontSize: 13,
    marginBottom: 12,
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
  passwordInputPhone: {
    maxWidth: 360,
    paddingVertical: 9,
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
  unlockButtonPhone: {
    width: '100%',
    maxWidth: 220,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  unlockButtonTextPhone: {
    fontSize: 13,
  },
});
