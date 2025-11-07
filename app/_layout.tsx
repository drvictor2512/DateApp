import { Stack } from 'expo-router';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from './../components/SafeScreen';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeScreen>
          <Stack initialRouteName="auth" screenOptions={{ headerShown: false }}>
            <Stack.Screen name='tabs' />
            <Stack.Screen name='auth' />
          </Stack>
        </SafeScreen>
      </AuthProvider>
    </SafeAreaProvider>

  );
}
