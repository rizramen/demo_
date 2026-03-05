import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';
import { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const ACCESS_PASSWORD = 'demonhug';

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
      <View style={styles.lockContainer}>
        <Text style={styles.lockTitle}>Protected Demo</Text>
        <Text style={styles.lockSubtitle}>Enter password to continue</Text>
        <TextInput
          style={styles.passwordInput}
          value={passwordInput}
          onChangeText={setPasswordInput}
          placeholder="Password"
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
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  passwordInput: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 10,
  },
  unlockButton: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unlockButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
