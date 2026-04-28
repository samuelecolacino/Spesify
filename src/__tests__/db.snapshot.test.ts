import {
  initDb,
  loadExpensesFromDb,
  loadCategoriesFromDb,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb,
  Expense,
} from '../services/db';

const mockDb = {
  execAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

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
describe('initDb – Snapshots', () => {
  it('SQL-Statement entspricht dem Snapshot', async () => {
    await initDb();
    expect(mockDb.execAsync.mock.calls[0][0]).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// loadExpensesFromDb
// -------------------------------------------------------
describe('loadExpensesFromDb – Snapshots', () => {
  it('Rückgabewert mit einem Expense entspricht dem Snapshot', async () => {
    mockDb.getAllAsync.mockResolvedValue([testExpense]);
    const result = await loadExpensesFromDb();
    expect(result).toMatchSnapshot();
  });

  it('Rückgabewert mit mehreren Expenses entspricht dem Snapshot', async () => {
    const zweites: Expense = {
      id: '2',
      name: 'Coop Einkauf',
      description: 'Getränke',
      price: '12.00',
      category: 'Essen',
      date: '2026-04-25',
    };
    mockDb.getAllAsync.mockResolvedValue([zweites, testExpense]);
    const result = await loadExpensesFromDb();
    expect(result).toMatchSnapshot();
  });

  it('leeres Array entspricht dem Snapshot', async () => {
    mockDb.getAllAsync.mockResolvedValue([]);
    const result = await loadExpensesFromDb();
    expect(result).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// loadCategoriesFromDb
// -------------------------------------------------------
describe('loadCategoriesFromDb – Snapshots', () => {
  it('Kategorien-Liste entspricht dem Snapshot', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      { name: 'Essen' },
      { name: 'Fahren' },
      { name: 'ÖV' },
      { name: 'Parkieren' },
    ]);
    const result = await loadCategoriesFromDb();
    expect(result).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// addExpenseToDb
// -------------------------------------------------------
describe('addExpenseToDb – Snapshots', () => {
  it('runAsync-Aufruf (ohne imageURI) entspricht dem Snapshot', async () => {
    await addExpenseToDb(testExpense);
    expect(mockDb.runAsync.mock.calls[0]).toMatchSnapshot();
  });

  it('runAsync-Aufruf (mit imageURI) entspricht dem Snapshot', async () => {
    const mitBild: Expense = { ...testExpense, imageURI: 'file://foto.jpg' };
    await addExpenseToDb(mitBild);
    expect(mockDb.runAsync.mock.calls[0]).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// updateExpenseInDb
// -------------------------------------------------------
describe('updateExpenseInDb – Snapshots', () => {
  it('runAsync-Aufruf entspricht dem Snapshot', async () => {
    const aktualisiert: Expense = { ...testExpense, name: 'Coop Einkauf', price: '15.00' };
    await updateExpenseInDb(aktualisiert);
    expect(mockDb.runAsync.mock.calls[0]).toMatchSnapshot();
  });
});

// -------------------------------------------------------
// deleteExpenseFromDb
// -------------------------------------------------------
describe('deleteExpenseFromDb – Snapshots', () => {
  it('runAsync-Aufruf entspricht dem Snapshot', async () => {
    await deleteExpenseFromDb('1');
    expect(mockDb.runAsync.mock.calls[0]).toMatchSnapshot();
  });
});
