import {
  initDb,
  loadExpensesFromDb,
  loadCategoriesFromDb,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb,
  Expense,
} from '../services/db';

// Mock-Datenbank-Objekt das wir in den Tests verwenden
const mockDb = {
  execAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

// expo-sqlite wird gemockt, damit kein echtes SQLite geöffnet wird
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

// Vor jedem Test alle Mocks zurücksetzen
beforeEach(() => {
  jest.clearAllMocks();
});

// Beispiel-Expense das in den Tests wiederverwendet wird
const testExpense: Expense = {
  id: '1',
  name: 'Migros Mittagessen',
  description: 'Sandwich',
  price: '8.50',
  category: 'Essen',
  date: '2026-04-24',
  imageURI: undefined,
};

// -------------------------------------------------------
// initDb
// -------------------------------------------------------
describe('initDb', () => {
  it('ruft execAsync auf um die Tabellen zu erstellen', async () => {
    await initDb();
    expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
  });
});

// -------------------------------------------------------
// loadExpensesFromDb
// -------------------------------------------------------
describe('loadExpensesFromDb', () => {
  it('gibt alle Expenses aus der Datenbank zurück', async () => {
    mockDb.getAllAsync.mockResolvedValue([testExpense]);

    const result = await loadExpensesFromDb();

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM expenses ORDER BY date DESC;'
    );
    expect(result).toEqual([testExpense]);
  });

  it('gibt ein leeres Array zurück wenn keine Expenses vorhanden sind', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);

    const result = await loadExpensesFromDb();

    expect(result).toEqual([]);
  });
});

// -------------------------------------------------------
// loadCategoriesFromDb
// -------------------------------------------------------
describe('loadCategoriesFromDb', () => {
  it('gibt eine Liste von Kategorienamen zurück', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { name: 'Essen' },
      { name: 'Fahren' },
    ]);

    const result = await loadCategoriesFromDb();

    expect(result).toEqual(['Essen', 'Fahren']);
  });
});

// -------------------------------------------------------
// addExpenseToDb
// -------------------------------------------------------
describe('addExpenseToDb', () => {
  it('fügt ein Expense mit den richtigen Werten ein', async () => {
    await addExpenseToDb(testExpense);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO expenses (id, name, description, price, category, date, imageURI) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        testExpense.id,
        testExpense.name,
        testExpense.description,
        testExpense.price,
        testExpense.category,
        testExpense.date,
        null,
      ]
    );
  });

  it('setzt imageURI auf null wenn keines angegeben wird', async () => {
    const expenseOhneImage: Expense = { ...testExpense, imageURI: undefined };

    await addExpenseToDb(expenseOhneImage);

    const aufgerufeneArgumente = mockDb.runAsync.mock.calls[0][1];
    expect(aufgerufeneArgumente[6]).toBeNull();
  });
});

// -------------------------------------------------------
// updateExpenseInDb
// -------------------------------------------------------
describe('updateExpenseInDb', () => {
  it('aktualisiert ein Expense mit den richtigen Werten', async () => {
    const aktualisiert: Expense = { ...testExpense, name: 'Coop Einkauf' };

    await updateExpenseInDb(aktualisiert);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'UPDATE expenses SET name = ?, description = ?, price = ?, category = ?, date = ?, imageURI = ? WHERE id = ?',
      [
        aktualisiert.name,
        aktualisiert.description,
        aktualisiert.price,
        aktualisiert.category,
        aktualisiert.date,
        null,
        aktualisiert.id,
      ]
    );
  });
});

// -------------------------------------------------------
// deleteExpenseFromDb
// -------------------------------------------------------
describe('deleteExpenseFromDb', () => {
  it('löscht ein Expense anhand der ID', async () => {
    await deleteExpenseFromDb('1');

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM expenses WHERE id = ?',
      ['1']
    );
  });
});
