import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
<<<<<<< HEAD
import { Alert } from 'react-native';
=======
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
import CreateScreen from '../create';
import { useExpenseStore } from '../../src/store/expenseStore';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

<<<<<<< HEAD
// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

=======
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
// Mock the store
jest.mock('../../src/store/expenseStore', () => ({
  useExpenseStore: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: () => null,
  },
}));

// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-456',
}));

// Mock Ionicons and Image
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-image', () => ({ Image: 'Image' }));

describe('CreateScreen', () => {
  const mockAddExpense = jest.fn();
  const mockInitialize = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useExpenseStore as unknown as jest.Mock).mockReturnValue({
      categories: ['Food', 'Transport'],
      addExpense: mockAddExpense,
      initialize: mockInitialize,
      isInitialized: true,
    });
  });

  it('shows an alert if required fields are missing', async () => {
    // We need to mock Alert
<<<<<<< HEAD
    const spyAlert = jest.spyOn(Alert, 'alert');

    const { getByTestId } = render(
=======
    const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');

    const { getByText } = render(
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
      <SafeAreaProvider>
        <CreateScreen />
      </SafeAreaProvider>
    );
<<<<<<< HEAD
    const createButton = getByTestId('button-create');
=======
    const createButton = getByText('Create');
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)

    fireEvent.press(createButton);

    expect(spyAlert).toHaveBeenCalledWith(
      'Fehlende Angaben',
      'Bitte Name, Preis und Kategorie ausfüllen.'
    );
    expect(mockAddExpense).not.toHaveBeenCalled();
  });

  it('calls addExpense and navigates back on valid submission', async () => {
<<<<<<< HEAD
    const { getByTestId, getByText } = render(
=======
    const { getByPlaceholderText, getByText } = render(
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
      <SafeAreaProvider>
        <CreateScreen />
      </SafeAreaProvider>
    );

    // Fill inputs
<<<<<<< HEAD
    fireEvent.changeText(getByTestId('input-name'), 'Lunch');
    fireEvent.changeText(getByTestId('input-price'), '15.50');

    // Select category (this involves opening the modal)
    fireEvent.press(getByTestId('category-trigger'));
    fireEvent.press(getByText('Food'));

    // Submit
    fireEvent.press(getByTestId('button-create'));
=======
    fireEvent.changeText(getByPlaceholderText('Name'), 'Lunch');
    fireEvent.changeText(getByPlaceholderText('Price'), '15.50');

    // Select category (this involves opening the modal)
    fireEvent.press(getByText('Kategorie wählen'));
    fireEvent.press(getByText('Food'));

    // Submit
    fireEvent.press(getByText('Create'));
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)

    await waitFor(() => {
      expect(mockAddExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Lunch',
          price: '15.50',
          category: 'Food',
        })
      );
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });
<<<<<<< HEAD

  it('shows an alert if price is empty', async () => {
    const spyAlert = jest.spyOn(Alert, 'alert');
    const { getByTestId, getByText } = render(
      <SafeAreaProvider>
        <CreateScreen />
      </SafeAreaProvider>
    );

    fireEvent.changeText(getByTestId('input-name'), 'Lunch');
    // Price stays empty

    fireEvent.press(getByTestId('category-trigger'));
    fireEvent.press(getByText('Food'));

    fireEvent.press(getByTestId('button-create'));

    expect(spyAlert).toHaveBeenCalledWith(
      'Fehlende Angaben',
      'Bitte Name, Preis und Kategorie ausfüllen.'
    );
    expect(mockAddExpense).not.toHaveBeenCalled();
  });
=======
>>>>>>> a137587 (feat: add unit tests for camera and create screens and update app logo)
});
