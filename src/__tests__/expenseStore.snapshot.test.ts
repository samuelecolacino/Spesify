import { useExpenseStore } from '../store/expenseStore';
import { Expense } from '../services/db';

jest.mock('../services/db', () => ({
  initDb: jest.fn(),
  loadExpensesFromDb: jest.fn(),
  loadCategoriesFromDb: jest.fn(),
  addExpenseToDb: jest.fn(),
  updateExpenseInDb: jest.fn(),
  deleteExpenseFromDb: jest.fn(),
}));


import {
  loadExpensesFromDb,
  loadCategoriesFromDb,
} from '../services/db';

const testExpense: Expense = {
  id: '1',
  name: 'Migros Mittagessen',
  description: 'Sandwich',
  price: '8.50',
  category: 'Essen',
  date: '2026-04-24',
};

afterEach(() => {
  useExpenseStore.setState({
    expenses: [],
    categories: [],
    isInitialized: false,
    pendingImage: null,
  });
  jest.clearAllMocks();
});

// -------------------------------------------------------
// initialize
// -------------------------------------------------------
describe('initialize – Snapshots', () => {
  it('Store-Zustand nach initialize entspricht dem Snapshot', async () => {
    (loadExpensesFromDb as jest.Mock).mockResolvedValue([testExpense]);
    (loadCategoriesFromDb as jest.Mock).mockResolvedValue(['Essen', 'Fahren', 'ÖV', 'Parkieren']);

    await useExpenseStore.getState().initialize();

    const { expenses, categories, isInitialized } = useExpenseStore.getState();
    expect({ expenses, categories, isInitialized }).toMatchSnapshot();
  });

  it('Store-Zustand nach initialize ohne Daten entspricht dem Snapshot', async () => {
    (loadExpensesFromDb as jest.Mock).mockResolvedValue([]);
    (loadCategoriesFromDb as jest.Mock).mockResolvedValue([]);

    await useExpenseStore.getState().initialize();

    const { expenses, categories, isInitialized } = useExpenseStore.getState();
    expect({ expenses, categories, isInitialized }).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// addExpense
// -------------------------------------------------------
describe('addExpense – Snapshots', () => {
  it('Store-Zustand nach addExpense entspricht dem Snapshot', async () => {
    await useExpenseStore.getState().addExpense(testExpense);

    const { expenses } = useExpenseStore.getState();
    expect(expenses).toMatchSnapshot();
  });

  it('Store-Zustand nach mehreren addExpense entspricht dem Snapshot', async () => {
    const zweites: Expense = { ...testExpense, id: '2', name: 'Coop', date: '2026-04-25' };

    await useExpenseStore.getState().addExpense(testExpense);
    await useExpenseStore.getState().addExpense(zweites);

    const { expenses } = useExpenseStore.getState();
    expect(expenses).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// updateExpense
// -------------------------------------------------------
describe('updateExpense – Snapshots', () => {
  it('Store-Zustand nach updateExpense entspricht dem Snapshot', async () => {
    useExpenseStore.setState({ expenses: [testExpense] });

    const aktualisiert: Expense = { ...testExpense, name: 'Coop Einkauf', price: '15.00' };
    await useExpenseStore.getState().updateExpense(aktualisiert);

    const { expenses } = useExpenseStore.getState();
    expect(expenses).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// deleteExpense
// -------------------------------------------------------
describe('deleteExpense – Snapshots', () => {
  it('Store-Zustand nach deleteExpense entspricht dem Snapshot', async () => {
    const zweites: Expense = { ...testExpense, id: '2', name: 'Coop' };
    useExpenseStore.setState({ expenses: [testExpense, zweites] });

    await useExpenseStore.getState().deleteExpense('1');

    const { expenses } = useExpenseStore.getState();
    expect(expenses).toMatchSnapshot();
  });

  it('leerer Store nach letztem deleteExpense entspricht dem Snapshot', async () => {
    useExpenseStore.setState({ expenses: [testExpense] });

    await useExpenseStore.getState().deleteExpense('1');

    const { expenses } = useExpenseStore.getState();
    expect(expenses).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// setPendingImage
// -------------------------------------------------------
describe('setPendingImage – Snapshots', () => {
  it('Store-Zustand nach setPendingImage mit URI entspricht dem Snapshot', () => {
    useExpenseStore.getState().setPendingImage('file://foto.jpg');

    const { pendingImage } = useExpenseStore.getState();
    expect(pendingImage).toMatchSnapshot();
  });

  it('Store-Zustand nach setPendingImage(null) entspricht dem Snapshot', () => {
    useExpenseStore.setState({ pendingImage: 'file://foto.jpg' });
    useExpenseStore.getState().setPendingImage(null);

    const { pendingImage } = useExpenseStore.getState();
    expect(pendingImage).toMatchSnapshot();
  });
});
