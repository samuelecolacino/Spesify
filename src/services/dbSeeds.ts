import { getDb } from './db';

export async function seedDb() {
  const db = await getDb();

  const testExpenses = [
    {
      id: 'seed-1',
      name: 'Migros Mittagessen',
      description: 'Sandwich und Wasser',
      price: '8.50',
      category: 'Essen',
      date: '2026-04-20',
    },
    {
      id: 'seed-2',
      name: 'Parkhaus Bahnhof',
      description: '2 Stunden parkiert',
      price: '6.00',
      category: 'Parkieren',
      date: '2026-04-21',
    },
    {
      id: 'seed-3',
      name: 'ZVV Tageskarte',
      description: 'Zonen 110 und 120',
      price: '17.20',
      category: 'ÖV',
      date: '2026-04-22',
    },
    {
      id: 'seed-4',
      name: 'Tanken BP',
      description: 'Vollgetankt',
      price: '94.30',
      category: 'Fahren',
      date: '2026-04-22',
    },
    {
      id: 'seed-5',
      name: 'Kebab zum Mittag',
      description: '',
      price: '12.00',
      category: 'Essen',
      date: '2026-04-23',
    },
  ];

  for (const expense of testExpenses) {
    await db.runAsync(
      'INSERT OR IGNORE INTO expenses (id, name, description, price, category, date, imageURI) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [expense.id, expense.name, expense.description, expense.price, expense.category, expense.date, null]
    );
  }
}
