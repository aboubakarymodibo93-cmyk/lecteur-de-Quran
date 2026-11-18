import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync } from 'expo-audio';
import { AppProvider } from '../context/AppContext';
import { colors } from '../constants/theme';

export default function RootLayout() {
  useEffect(() => {
    // Son même en mode silencieux (iPhone). La lecture en arrière-plan
    // ne fonctionne pleinement que dans un development build, pas dans Expo Go.
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Lecteur de Coran' }} />
        <Stack.Screen name="sourate/[id]" options={{ title: '' }} />
      </Stack>
    </AppProvider>
  );
}
