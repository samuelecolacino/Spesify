import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CameraScreen from '../camera';
import { useCameraPermissions } from 'expo-camera';
import { SafeAreaProvider } from 'react-native-safe-area-context';

<<<<<<< HEAD
// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

=======
<<<<<<< HEAD
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
=======
>>>>>>> 4d20c5a (feat: add unit tests for camera and create screens and update app logo)
>>>>>>> 8c822e9 (feat: add unit tests for camera and create screens and update app logo)
// Mock expo-camera
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  CameraView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'test-dir/',
  copyAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
}));

// Mock uuid
jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid-123',
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CameraScreen', () => {
  it('renders permission request screen when permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false, canAskAgain: true },
      jest.fn(),
    ]);

    const { getByText } = render(
      <SafeAreaProvider>
        <CameraScreen />
      </SafeAreaProvider>
    );

    expect(getByText('Kamerazugriff benötigt')).toBeTruthy();
    expect(getByText('Zugriff erlauben')).toBeTruthy();
  });

  it('calls requestPermission when "Zugriff erlauben" is pressed', () => {
    const requestPermission = jest.fn();
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false, canAskAgain: true },
      requestPermission,
    ]);

    const { getByText } = render(
      <SafeAreaProvider>
        <CameraScreen />
      </SafeAreaProvider>
    );
    const button = getByText('Zugriff erlauben');

    fireEvent.press(button);
    expect(requestPermission).toHaveBeenCalled();
  });
<<<<<<< HEAD

  it('still renders permission screen when permission is denied and cannot be asked again', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([
      { granted: false, canAskAgain: false },
      jest.fn(),
    ]);

    const { getByText } = render(
      <SafeAreaProvider>
        <CameraScreen />
      </SafeAreaProvider>
    );

    expect(getByText('Kamerazugriff benötigt')).toBeTruthy();
  });
=======
<<<<<<< HEAD
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
=======
>>>>>>> 4d20c5a (feat: add unit tests for camera and create screens and update app logo)
>>>>>>> 8c822e9 (feat: add unit tests for camera and create screens and update app logo)
});
