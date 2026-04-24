import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Spesify' }} />
        <Stack.Screen name="camera" options={{ title: 'Camera', presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
    </>
  );
}
