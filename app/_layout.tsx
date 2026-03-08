import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Crosshair } from '@/components/crosshair';

export const unstable_settings = {
  anchor: '(tabs)',
};

const ACCESS_PASSWORD = 'demonhug';
const BACKGROUND_VIDEO_SOURCE = require('../assets/videos/poison ivy.mov');

// Keep splash visible until icon fonts are ready, otherwise icon glyphs can fail on first paint.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore: this can throw when called more than once in development.
});

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontsError] = useFonts({
    // Only preload icon packs used in this app.
    ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    'Material Icons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      void SplashScreen.hideAsync().catch(() => {
        // Ignore hide errors so rendering can continue.
      });
    }
  }, [fontsError, fontsLoaded]);

  if (fontsError) {
    throw fontsError;
  }

  const handleUnlock = () => {
    // Keep auth intentionally local/client-side; this is a UI gate, not secure auth.
    if (passwordInput === ACCESS_PASSWORD) {
      setIsUnlocked(true);
      setErrorText('');
      return;
    }

    setErrorText('Are you supposed to be here?');
  };

  if (!fontsLoaded) {
    return null;
  }

  if (!isUnlocked) {
    return (
      <View style={styles.root}>
        <Video
          source={BACKGROUND_VIDEO_SOURCE}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        <View style={styles.backgroundShade} />
        <Crosshair />
        <View style={styles.lockContainer}>
          <Text style={styles.lockTitle}>rizramen's vault</Text>
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
      <Video
        source={BACKGROUND_VIDEO_SOURCE}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
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
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
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
