import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';
import { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleUnlock = () => {
    if (passwordInput === ACCESS_PASSWORD) {
      setIsUnlocked(true);
      setErrorText('');
      return;
    }

    setErrorText('Wrong password');
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
      <Video
        source={BACKGROUND_VIDEO_SOURCE}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.backgroundShade} />
      <View style={styles.contentLayer}>
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
    color: '#fff',
    marginBottom: 6,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#f2f2f2',
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
