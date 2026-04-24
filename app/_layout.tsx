import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useExpenseStore } from '@/src/store/expenseStore';

export default function RootLayout() {
  const initialize = useExpenseStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Spesify' }} />
        <Stack.Screen name="create" options={{ title: 'Neu erstellen' }} />
        <Stack.Screen name="camera" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
    </>
  );
}
