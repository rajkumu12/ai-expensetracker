import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../expenses.db');

const db = new Database(DB_PATH);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'INR',
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      merchant VARCHAR(100),
      original_input TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Database initialized');
}

export interface Expense {
  id: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  original_input: string;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  original_input: string;
}

export function createExpense(expense: ExpenseInput): Expense {
  const stmt = db.prepare(`
    INSERT INTO expenses (amount, currency, category, description, merchant, original_input)
    VALUES (@amount, @currency, @category, @description, @merchant, @original_input)
  `);
  const result = stmt.run(expense);
  return getExpenseById(result.lastInsertRowid as number)!;
}

export function getAllExpenses(): Expense[] {
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all() as Expense[];
}

export function getExpenseById(id: number): Expense | null {
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense | null;
}

export function deleteExpense(id: number): boolean {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return result.changes > 0;
}