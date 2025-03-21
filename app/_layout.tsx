import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '../context/LanguageContext';
import AuthCheck from '../components/AuthCheck';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthCheck />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="PersonalInfoScreen" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="Photouplode" options={{ headerShown: false }} />
          <Stack.Screen name="AdditionalDetails" options={{ headerShown: false }} />
          <Stack.Screen name="Review" options={{ headerShown: false }} />
          <Stack.Screen name="SubmissionSuccess" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="sightlist" options={{ headerShown: false }} />
          <Stack.Screen name="sightdetails" options={{ headerShown: false }} />
          <Stack.Screen name="sightreport" options={{ headerShown: false }} />
          <Stack.Screen name="volunter" options={{ headerShown: false }} />
          <Stack.Screen name="nearbysightings" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
