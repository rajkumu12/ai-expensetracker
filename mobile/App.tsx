import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, RefreshControl, SafeAreaView, StatusBar,
} from 'react-native';
import { Expense } from './src/types';
import { addExpense, getExpenses, deleteExpense } from './src/services/api';

const CATEGORY_EMOJI: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transport': '🚗',
  'Shopping': '🛒',
  'Entertainment': '📺',
  'Bills & Utilities': '📄',
  'Health': '💊',
  'Travel': '✈️',
  'Other': '📦',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function App() {
  const [input, setInput] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successExpense, setSuccessExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (e) {
      console.error('Failed to fetch expenses');
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessExpense(null);
    try {
      const expense = await addExpense(input.trim());
      setSuccessExpense(expense);
      setInput('');
      await fetchExpenses();
      setTimeout(() => setSuccessExpense(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await deleteExpense(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete expense.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseEmoji}>{CATEGORY_EMOJI[item.category] || '📦'}</Text>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          {item.merchant && <Text style={styles.expenseMerchant}>{item.merchant}</Text>}
          <Text style={styles.expenseTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>₹{item.amount}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          style={styles.deleteBtn}
        >
          {deletingId === item.id
            ? <ActivityIndicator size="small" color="#ff4444" />
            : <Text style={styles.deleteText}>🗑️</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 AI Expense Tracker</Text>
        <Text style={styles.headerSubtitle}>Add expenses in plain English</Text>
      </View>
      <View style={styles.inputSection}>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Spent 500 on groceries at BigBazaar"
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={text => { setInput(text); setErrorMsg(''); }}
          onSubmitEditing={handleAdd}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.addBtn, (!input.trim() || loading) && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!input.trim() || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.addBtnText}>Add</Text>}
        </TouchableOpacity>
      </View>
      {errorMsg ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>❌ {errorMsg}</Text>
        </View>
      ) : null}
      {successExpense ? (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>✅ Added Successfully!</Text>
          <Text style={styles.successDetail}>Amount: ₹{successExpense.amount}</Text>
          <Text style={styles.successDetail}>
            Category: {CATEGORY_EMOJI[successExpense.category]} {successExpense.category}
          </Text>
          <Text style={styles.successDetail}>Description: {successExpense.description}</Text>
          {successExpense.merchant && (
            <Text style={styles.successDetail}>Merchant: {successExpense.merchant}</Text>
          )}
        </View>
      ) : null}
      <Text style={styles.listTitle}>Recent Expenses</Text>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderExpense}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses yet. Add your first one!</Text>
        }
        contentContainerStyle={expenses.length === 0 ? styles.emptyContainer : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  inputSection: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', gap: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', minWidth: 60 },
  addBtnDisabled: { backgroundColor: '#a5b4fc' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  errorCard: { margin: 16, padding: 14, backgroundColor: '#fff0f0', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#ff4444' },
  errorText: { color: '#cc0000', fontSize: 14 },
  successCard: { margin: 16, padding: 16, backgroundColor: '#f0fff4', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#22c55e' },
  successTitle: { fontWeight: 'bold', fontSize: 15, color: '#166534', marginBottom: 8 },
  successDetail: { fontSize: 13, color: '#166534', marginTop: 2 },
  listTitle: { fontSize: 16, fontWeight: '600', color: '#333', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  expenseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  expenseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  expenseEmoji: { fontSize: 28, marginRight: 12 },
  expenseInfo: { flex: 1 },
  expenseCategory: { fontSize: 13, fontWeight: '600', color: '#333' },
  expenseDescription: { fontSize: 13, color: '#555', marginTop: 2 },
  expenseMerchant: { fontSize: 12, color: '#888', marginTop: 1 },
  expenseTime: { fontSize: 11, color: '#aaa', marginTop: 3 },
  expenseRight: { alignItems: 'flex-end', gap: 8 },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#aaa', fontSize: 15, marginTop: 60 },
});