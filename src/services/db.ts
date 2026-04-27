import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('spesify.db');
  }
  return dbPromise;
}

export async function initDb() {
  const database = await getDb();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      imageURI TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY NOT NULL
    );
    INSERT OR IGNORE INTO categories (name) VALUES 
      ('Parkieren'), 
      ('Essen'), 
      ('ÖV'), 
      ('Fahren');
  `);
}

export async function loadCategoriesFromDb(): Promise<string[]> {
  const database = await getDb();
  const result = await database.getAllAsync<{ name: string }>('SELECT name FROM categories ORDER BY name ASC;');
  return result.map(r => r.name);
}

export interface Expense {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  date: string;
  imageURI?: string;
}

export async function loadExpensesFromDb(): Promise<Expense[]> {
  const database = await getDb();
  const result = await database.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC;');
  return result;
}

export async function addExpenseToDb(expense: Expense) {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO expenses (id, name, description, price, category, date, imageURI) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      expense.id,
      expense.name,
      expense.description,
      expense.price,
      expense.category,
      expense.date,
      expense.imageURI || null,
    ]
  );
}

export async function updateExpenseInDb(expense: Expense) {
  const database = await getDb();
  await database.runAsync(
    'UPDATE expenses SET name = ?, description = ?, price = ?, category = ?, date = ?, imageURI = ? WHERE id = ?',
    [
      expense.name,
      expense.description,
      expense.price,
      expense.category,
      expense.date,
      expense.imageURI || null,
      expense.id,
    ]
  );
}

export async function deleteExpenseFromDb(id: string) {
  if (!id) {
    console.error('deleteExpenseFromDb: No ID provided');
    return;
  }
  const database = await getDb();
  try {
    await database.runAsync(`DELETE FROM expenses WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error in deleteExpenseFromDb:', error);
    throw error;
  }
}
