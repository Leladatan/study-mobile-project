import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CatalogProvider } from '../src/hooks/CatalogProvider';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CatalogProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.bg },
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.text },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="topic/[id]" options={{ title: 'Карточка страны' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Страница не найдена' }} />
        </Stack>
      </CatalogProvider>
    </SafeAreaProvider>
  );
}
