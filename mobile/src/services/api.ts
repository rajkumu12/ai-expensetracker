import axios from 'axios';
import { Expense } from '../types';

const API_URL = 'http://192.168.29.135:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export async function addExpense(input: string): Promise<Expense> {
  const response = await api.post('/expenses', { input });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.expense;
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await api.get('/expenses');
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.expenses;
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await api.delete(`/expenses/${id}`);
  if (!response.data.success) throw new Error(response.data.error);
}