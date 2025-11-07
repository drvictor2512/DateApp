import { Stack } from 'expo-router';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from '../lib/auth';
import SafeScreen from './../components/SafeScreen';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='auth' />
            <Stack.Screen name='tabs' />

          </Stack>
        </SafeScreen>
      </AuthProvider>
    </SafeAreaProvider>

  );
}
