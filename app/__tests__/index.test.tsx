import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import OverviewScreen from '@/app/index';
import { useExpenseStore } from '@/src/store/expenseStore';
import { useRouter } from 'expo-router';

// --- Mocks ---
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/src/store/expenseStore', () => ({
    useExpenseStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return { Ionicons: (props: any) => <View testID={`icon-${props.name}`} /> };
});

jest.mock('react-native-gesture-handler', () => {
    const { View } = require('react-native');
    return {
        Swipeable: ({ children }: any) => <View testID="swipeable-mock">{children}</View>,
        TouchableOpacity: require('react-native').TouchableOpacity,
    };
});

describe('OverviewScreen (index.tsx)', () => {
    const mockPush = jest.fn();
    const mockInitialize = jest.fn();
    const mockDeleteExpense = jest.fn();

    const mockExpenses = [
        {
            id: '1',
            name: 'Migros',
            description: 'Einkauf',
            price: '25.50',
            category: 'Lebensmittel',
            date: '2026-04-24T10:00:00Z',
        },
        {
            id: '2',
            name: 'SBB Ticket',
            description: 'Zürich nach Bern',
            price: '40.00',
            category: 'Transport',
            date: '2026-04-23T10:00:00Z',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        (useExpenseStore as unknown as jest.Mock).mockReturnValue({
            expenses: mockExpenses,
            initialize: mockInitialize,
            deleteExpense: mockDeleteExpense,
            isInitialized: true,
        });
    });

    it('initialisiert den Store, wenn noch nicht initialisiert', () => {
        (useExpenseStore as unknown as jest.Mock).mockReturnValue({
            expenses: [],
            initialize: mockInitialize,
            deleteExpense: mockDeleteExpense,
            isInitialized: false,
        });

        render(<OverviewScreen />);
        expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it('zeigt die leere Liste an, wenn keine Expenses vorhanden sind', () => {
        (useExpenseStore as unknown as jest.Mock).mockReturnValue({
            expenses: [],
            initialize: mockInitialize,
            isInitialized: true,
        });

        render(<OverviewScreen />);
        expect(screen.getByText('Noch keine Ausgaben erfasst.')).toBeTruthy();
    });

    it('rendert die gruppierten Expenses korrekt', () => {
        render(<OverviewScreen />);

        expect(screen.getByText('Lebensmittel')).toBeTruthy();
        expect(screen.getByText('Transport')).toBeTruthy();

        expect(screen.getByText('Migros')).toBeTruthy();
        expect(screen.getByText('SBB Ticket')).toBeTruthy();

        const lebensmittelPrices = screen.getAllByText('25.50 $');
        expect(lebensmittelPrices.length).toBe(2);

        const transportPrices = screen.getAllByText('40.00 $');
        expect(transportPrices.length).toBe(2);
    });

    it('navigiert zum Create Screen beim Klick auf den Hinzufügen-Button', () => {
        render(<OverviewScreen />);

        const addButton = screen.getByTestId('icon-add').parent;
        fireEvent.press(addButton);

        expect(mockPush).toHaveBeenCalledWith('/create');
    });

    it('navigiert zum Edit Screen beim Klick auf ein Expense-Item', () => {
        render(<OverviewScreen />);

        const migrosItem = screen.getByText('Migros');
        fireEvent.press(migrosItem);

        expect(mockPush).toHaveBeenCalledWith('/edit/1');
    });

    it('ruft deleteExpense auf, wenn auf das Mülleimer-Icon geklickt wird', () => {
        render(<OverviewScreen />);

        const trashIcons = screen.getAllByTestId('icon-trash-outline');
        fireEvent.press(trashIcons[0].parent);

        expect(mockDeleteExpense).toHaveBeenCalledWith('1');
    });
});