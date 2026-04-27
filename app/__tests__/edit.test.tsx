import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react-native';
import {useExpenseStore} from '@/src/store/expenseStore';
import EditScreen from '@/app/edit/[id]';
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

    it('matches the snapshot in View Mode', () => {
        const { toJSON } = render(<EditScreen />);
        expect(toJSON()).toMatchSnapshot();
    });

    it('matches the snapshot in Edit Mode', () => {
        const { toJSON, getByText } = render(<EditScreen />);

        // Toggle Edit Mode to see the Save button and enabled inputs in the snapshot
        fireEvent.press(getByText('Edit'));

        expect(toJSON()).toMatchSnapshot();
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

        expect(screen.getByText('Cancel')).toBeTruthy();
        expect(screen.getByText('SAVE CHANGES')).toBeTruthy();
    });

    it('zeigt einen Fehler an, wenn Pflichtfelder fehlen', async () => {
        render(<EditScreen/>);

        fireEvent.press(screen.getByText('Edit'));

        const nameInput = screen.getByDisplayValue('Coop');
        fireEvent.changeText(nameInput, '');

        fireEvent.press(screen.getByText('SAVE CHANGES'));

        expect(Alert.alert).toHaveBeenCalledWith(
            "Missing Information",
            "Please provide a name, price, and category."
        );
        expect(mockUpdateExpense).not.toHaveBeenCalled();
    });

    it('speichert die Änderungen erfolgreich und navigiert zurück', async () => {
        render(<EditScreen/>);

        fireEvent.press(screen.getByText('Edit'));

        const nameInput = screen.getByDisplayValue('Coop');
        fireEvent.changeText(nameInput, 'Coop Supermarkt');

        fireEvent.press(screen.getByText('SAVE CHANGES'));

        await waitFor(() => {
            expect(mockUpdateExpense).toHaveBeenCalledWith({
                ...testExpense,
                name: 'Coop Supermarkt',
                imageURI: undefined,
            });
            expect(mockBack).toHaveBeenCalled();
        });
    });

    it('öffnet die Kamera beim Klick auf das Bild (wenn im Edit-Modus)', () => {
        render(<EditScreen/>);

        fireEvent.press(screen.getByText('Edit'));

        const imageContainer = screen.getByText('Tap to take photo').parent;
        fireEvent.press(imageContainer);

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/camera',
            params: {returnTo: 'edit/1'}
        });
    });

    it('übernimmt ein neues Bild aus dem pendingImage State', () => {
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

        expect(screen.getByText('Cancel')).toBeTruthy();
        expect(mockSetPendingImage).toHaveBeenCalledWith(null);
    });
});