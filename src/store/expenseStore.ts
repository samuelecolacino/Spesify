import { create } from 'zustand';
import {
  Expense,
  initDb,
  loadExpensesFromDb,
  loadCategoriesFromDb,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb
} from '../services/db';
import { seedDb } from '../services/dbSeeds';

interface ExpenseState {
  expenses: Expense[];
  categories: string[];
  isInitialized: boolean;
  pendingImage: string | null;
  initialize: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setPendingImage: (uri: string | null) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  categories: [],
  isInitialized: false,
  pendingImage: null,

  setPendingImage: (uri) => set({ pendingImage: uri }),

  initialize: async () => {
    try {
      await initDb();
      const expenses = await loadExpensesFromDb();
      const categories = await loadCategoriesFromDb();
      set({ expenses, categories, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  },

  addExpense: async (expense) => {
    try {
      await addExpenseToDb(expense);
      set((state) => ({ expenses: [expense, ...state.expenses] }));
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  },

  updateExpense: async (expense) => {
    try {
      await updateExpenseInDb(expense);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
      }));
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  },

  deleteExpense: async (id) => {
    try {
      await deleteExpenseFromDb(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  },
}));
