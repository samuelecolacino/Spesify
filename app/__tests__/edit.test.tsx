import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react-native';
import EditScreen from '@/app/edit/[id]'; // Adjust path as needed
import {useExpenseStore} from '@/src/store/expenseStore';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Alert} from 'react-native';

// --- Mocks ---
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('@/src/store/expenseStore', () => ({
    useExpenseStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
    const {View} = require('react-native');
    return {Ionicons: (props: any) => <View testID={`icon-${props.name}`}/>};
});

jest.mock('@react-native-picker/picker', () => {
    const { View } = require('react-native');

    const Picker = ({ children }: any) => <View testID="mock-picker">{children}</View>;
    Picker.displayName = 'Picker';

    const PickerItem = ({ label }: any) => <View testID={`picker-item-${label}`} />;
    PickerItem.displayName = 'PickerItem';

    Picker.Item = PickerItem;

    return { Picker };
});

// Spy on Alert to test validation popups
jest.spyOn(Alert, 'alert');

describe('EditScreen (edit/[id].tsx)', () => {
    const mockBack = jest.fn();
    const mockReplace = jest.fn();
    const mockPush = jest.fn();
    const mockUpdateExpense = jest.fn();
    const mockSetPendingImage = jest.fn();

    const testExpense = {
        id: '1',
        name: 'Coop',
        description: 'Snacks',
        price: '15.00',
        category: 'Lebensmittel',
        imageURI: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            back: mockBack,
            replace: mockReplace,
            push: mockPush,
        });

        (useLocalSearchParams as jest.Mock).mockReturnValue({id: '1'});

        // We mock the Zustand store implementation to return values based on the selector function
        (useExpenseStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                expenses: [testExpense],
                categories: ['Lebensmittel', 'Transport'],
                updateExpense: mockUpdateExpense,
                pendingImage: null,
                setPendingImage: mockSetPendingImage,
            };
            return selector(state);
        });
    });

    it('lädt die Expense-Daten basierend auf der ID', () => {
        render(<EditScreen/>);

        expect(screen.getByDisplayValue('Coop')).toBeTruthy();
        expect(screen.getByDisplayValue('15.00')).toBeTruthy();
        expect(screen.getByDisplayValue('Snacks')).toBeTruthy();
    });

    it('navigiert zurück zum Index, wenn die ID nicht gefunden wird', () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({id: '999'}); // Non-existent ID
        render(<EditScreen/>);

        expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('aktiviert den Edit-Modus beim Klick auf Edit', () => {
        render(<EditScreen/>);

        const editButton = screen.getByText('Edit');
        fireEvent.press(editButton);

        // Check if the button changed to 'Cancel'
        expect(screen.getByText('Cancel')).toBeTruthy();
        // Check if the Save button appeared
        expect(screen.getByText('SAVE CHANGES')).toBeTruthy();
    });

    it('zeigt einen Fehler an, wenn Pflichtfelder fehlen', async () => {
        render(<EditScreen/>);

        // Enable edit mode
        fireEvent.press(screen.getByText('Edit'));

        // Clear the name field
        const nameInput = screen.getByDisplayValue('Coop');
        fireEvent.changeText(nameInput, '');

        // Try to save
        fireEvent.press(screen.getByText('SAVE CHANGES'));

        expect(Alert.alert).toHaveBeenCalledWith(
            "Missing Information",
            "Please provide a name, price, and category."
        );
        expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('speichert die Änderungen erfolgreich und navigiert zurück', async () => {
        render(<EditScreen/>);

        // Enable edit mode
        fireEvent.press(screen.getByText('Edit'));

        // Change name
        const nameInput = screen.getByDisplayValue('Coop');
        fireEvent.changeText(nameInput, 'Coop Supermarkt');

        // Save changes
        fireEvent.press(screen.getByText('SAVE CHANGES'));

        await waitFor(() => {
            expect(mockUpdateExpense).toHaveBeenCalledWith({
                ...testExpense,
                name: 'Coop Supermarkt',
                imageURI: undefined, // undefined because it was null initially
            });
            expect(mockBack).toHaveBeenCalled();
        });
    });

    it('öffnet die Kamera beim Klick auf das Bild (wenn im Edit-Modus)', () => {
        render(<EditScreen/>);

        // Enable edit mode to activate the camera button
        fireEvent.press(screen.getByText('Edit'));

        const imageContainer = screen.getByText('Tap to take photo').parent;
        fireEvent.press(imageContainer);

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/camera',
            params: {returnTo: 'edit/1'}
        });
    });

    it('übernimmt ein neues Bild aus dem pendingImage State', () => {
        // Override store state to simulate a pending image returning from the camera
        (useExpenseStore as unknown as jest.Mock).mockImplementation((selector: any) => {
            const state = {
                expenses: [testExpense],
                categories: ['Lebensmittel'],
                updateExpense: mockUpdateExpense,
                pendingImage: 'file://new-photo.jpg',
                setPendingImage: mockSetPendingImage,
            };
            return selector(state);
        });

        render(<EditScreen/>);

        // Edit mode should be auto-activated when pendingImage is present
        expect(screen.getByText('Cancel')).toBeTruthy();
        expect(mockSetPendingImage).toHaveBeenCalledWith(null); // Should clear store immediately
    });
});