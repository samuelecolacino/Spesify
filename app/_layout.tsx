import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useExpenseStore } from '../src/store/expenseStore';

export default function RootLayout() {
  const initialize = useExpenseStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Spesify' }} />
        <Stack.Screen name="camera" options={{ title: 'Camera', presentation: 'fullScreenModal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
