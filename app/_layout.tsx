import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useExpenseStore } from '../src/store/expenseStore';

export default function RootLayout() {
  const initialize = useExpenseStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

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
