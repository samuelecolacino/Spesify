import { useExpenseStore } from '../store/expenseStore';
import { Expense } from '../services/db';

// Alle Funktionen aus dem DB-Service werden gemockt
jest.mock('../services/db', () => ({
  initDb: jest.fn(),
  loadExpensesFromDb: jest.fn(),
  loadCategoriesFromDb: jest.fn(),
  addExpenseToDb: jest.fn(),
  updateExpenseInDb: jest.fn(),
  deleteExpenseFromDb: jest.fn(),
}));



// Import der gemockten Funktionen, damit wir sie steuern können
import {
  initDb,
  loadExpensesFromDb,
  loadCategoriesFromDb,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb,
} from '../services/db';


// Beispiel-Expense das in den Tests wiederverwendet wird
const testExpense: Expense = {
  id: '1',
  name: 'Migros Mittagessen',
  description: 'Sandwich',
  price: '8.50',
  category: 'Essen',
  date: '2026-04-24',
};

// Den Store nach jedem Test zurücksetzen
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
describe('initialize', () => {
  it('lädt Expenses und Kategorien und setzt isInitialized auf true', async () => {
    (loadExpensesFromDb as jest.Mock).mockResolvedValue([testExpense]);
    (loadCategoriesFromDb as jest.Mock).mockResolvedValue(['Essen', 'Fahren']);

    await useExpenseStore.getState().initialize();

    const state = useExpenseStore.getState();
    expect(state.isInitialized).toBe(true);
    expect(state.expenses).toEqual([testExpense]);
    expect(state.categories).toEqual(['Essen', 'Fahren']);
  });

  it('ruft initDb auf', async () => {
    (loadExpensesFromDb as jest.Mock).mockResolvedValue([]);
    (loadCategoriesFromDb as jest.Mock).mockResolvedValue([]);

    await useExpenseStore.getState().initialize();

    expect(initDb).toHaveBeenCalledTimes(1);
  });
});

// -------------------------------------------------------
// addExpense
// -------------------------------------------------------
describe('addExpense', () => {
  it('fügt ein Expense dem Store hinzu', async () => {
    await useExpenseStore.getState().addExpense(testExpense);

    const state = useExpenseStore.getState();
    expect(state.expenses).toContainEqual(testExpense);
    expect(addExpenseToDb).toHaveBeenCalledWith(testExpense);
  });

  it('das neue Expense steht an erster Stelle', async () => {
    const erstes: Expense = { ...testExpense, id: '1' };
    const zweites: Expense = { ...testExpense, id: '2', name: 'Coop' };

    await useExpenseStore.getState().addExpense(erstes);
    await useExpenseStore.getState().addExpense(zweites);

    const state = useExpenseStore.getState();
    expect(state.expenses[0].id).toBe('2');
  });
});

// -------------------------------------------------------
// updateExpense
// -------------------------------------------------------
describe('updateExpense', () => {
  it('aktualisiert ein bestehendes Expense im Store', async () => {
    useExpenseStore.setState({ expenses: [testExpense] });

    const aktualisiert: Expense = { ...testExpense, name: 'Coop Einkauf' };
    await useExpenseStore.getState().updateExpense(aktualisiert);

    const state = useExpenseStore.getState();
    expect(state.expenses[0].name).toBe('Coop Einkauf');
    expect(updateExpenseInDb).toHaveBeenCalledWith(aktualisiert);
  });

  it('ändert nur das Expense mit der passenden ID', async () => {
    const anderes: Expense = { ...testExpense, id: '2', name: 'Anderes' };
    useExpenseStore.setState({ expenses: [testExpense, anderes] });

    const aktualisiert: Expense = { ...testExpense, name: 'Geändert' };
    await useExpenseStore.getState().updateExpense(aktualisiert);

    const state = useExpenseStore.getState();
    expect(state.expenses.find((e) => e.id === '2')?.name).toBe('Anderes');
  });
});

// -------------------------------------------------------
// deleteExpense
// -------------------------------------------------------
describe('deleteExpense', () => {
  it('entfernt ein Expense aus dem Store', async () => {
    useExpenseStore.setState({ expenses: [testExpense] });

    await useExpenseStore.getState().deleteExpense('1');

    const state = useExpenseStore.getState();
    expect(state.expenses).toHaveLength(0);
    expect(deleteExpenseFromDb).toHaveBeenCalledWith('1');
  });

  it('löscht nur das Expense mit der passenden ID', async () => {
    const zweites: Expense = { ...testExpense, id: '2', name: 'Zweites' };
    useExpenseStore.setState({ expenses: [testExpense, zweites] });

    await useExpenseStore.getState().deleteExpense('1');

    const state = useExpenseStore.getState();
    expect(state.expenses).toHaveLength(1);
    expect(state.expenses[0].id).toBe('2');
  });
});

// -------------------------------------------------------
// setPendingImage
// -------------------------------------------------------
describe('setPendingImage', () => {
  it('setzt die pendingImage URI', () => {
    useExpenseStore.getState().setPendingImage('file://foto.jpg');

    expect(useExpenseStore.getState().pendingImage).toBe('file://foto.jpg');
  });

  it('kann pendingImage auf null setzen', () => {
    useExpenseStore.setState({ pendingImage: 'file://foto.jpg' });

    useExpenseStore.getState().setPendingImage(null);

    expect(useExpenseStore.getState().pendingImage).toBeNull();
  });
});
