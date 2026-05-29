import React, { useState, useEffect } from 'react';
import { toolsService } from '../services/toolsService';
import type { FinanceEntry } from '../types';

interface FinancePageProps {
  onBack?: () => void;
}

const EXPENSE_CATEGORIES = [
  { icon: '🍚', label: '餐饮' },
  { icon: '🚌', label: '交通' },
  { icon: '🛒', label: '购物' },
  { icon: '🏠', label: '住房' },
  { icon: '🎮', label: '娱乐' },
  { icon: '📱', label: '通讯' },
  { icon: '💊', label: '医疗' },
  { icon: '📚', label: '教育' },
  { icon: '👔', label: '服饰' },
  { icon: '💡', label: '其他' },
];

const INCOME_CATEGORIES = [
  { icon: '💰', label: '工资' },
  { icon: '🎁', label: '奖金' },
  { icon: '📈', label: '投资' },
  { icon: '💼', label: '兼职' },
  { icon: '🏦', label: '理财' },
  { icon: '💡', label: '其他' },
];

const FinancePage: React.FC<FinancePageProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  const loadEntries = () => {
    // Load from storage
    const saved = localStorage.getItem('nice_today_finance_entries');
    if (saved) {
      const allEntries: FinanceEntry[] = JSON.parse(saved);
      const monthEntries = allEntries.filter(e => e.date.startsWith(selectedMonth));
      setEntries(monthEntries);
    }
  };

  const saveEntries = (newEntries: FinanceEntry[]) => {
    const saved = localStorage.getItem('nice_today_finance_entries');
    const allEntries: FinanceEntry[] = saved ? JSON.parse(saved) : [];
    const otherEntries = allEntries.filter(e => !e.date.startsWith(selectedMonth));
    const updated = [...otherEntries, ...newEntries];
    localStorage.setItem('nice_today_finance_entries', JSON.stringify(updated));
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    if (!newEntry.amount || !newEntry.category) return;

    const entry: FinanceEntry = {
      id: `finance_${Date.now()}`,
      type: newEntry.type,
      amount: parseFloat(newEntry.amount),
      currency: 'CNY',
      category: newEntry.category,
      description: newEntry.description,
      date: newEntry.date,
      paymentMethod: '其他',
      tags: [],
      recurring: false,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEntries([...entries, entry]);
    setNewEntry({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  // Calculate stats
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Group by category
  const expenseByCategory = entries
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  const getCategoryIcon = (category: string) => {
    return EXPENSE_CATEGORIES.find(c => c.label === category)?.icon || INCOME_CATEGORIES.find(c => c.label === category)?.icon || '💡';
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  // Month navigation
  const goToPrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prev = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
    setSelectedMonth(prev);
  };

  const goToNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const next = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
    setSelectedMonth(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">💰 财务管理</h1>
          <button onClick={() => setShowAddModal(true)} className="text-blue-500 text-sm font-medium">+ 记账</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
          <button onClick={goToPrevMonth} className="p-2 text-gray-500">←</button>
          <span className="font-bold text-gray-900 dark:text-white">{selectedMonth.replace('-', '年')}月</span>
          <button onClick={goToNextMonth} className="p-2 text-gray-500">→</button>
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm opacity-80">收入</div>
              <div className="text-xl font-bold mt-1">¥{formatAmount(totalIncome)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">支出</div>
              <div className="text-xl font-bold mt-1">¥{formatAmount(totalExpense)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">结余</div>
              <div className={`text-xl font-bold mt-1 ${balance >= 0 ? '' : 'text-red-200'}`}>
                ¥{formatAmount(balance)}
              </div>
            </div>
          </div>
        </div>

        {/* Expense by category */}
        {sortedCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">支出分类</h3>
            <div className="space-y-2">
              {sortedCategories.map(([category, amount]) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">¥{formatAmount(amount)}</span>
                  <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(amount / totalExpense) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entry list */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">收支明细</h3>
          </div>
          {entries.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="text-3xl">📊</span>
              <p className="text-sm mt-2">本月暂无记录</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {entries
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(entry => (
                  <div key={entry.id} className="p-4 flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(entry.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.category}</div>
                      {entry.description && (
                        <div className="text-xs text-gray-400 truncate">{entry.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${entry.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {entry.type === 'income' ? '+' : '-'}¥{formatAmount(entry.amount)}
                      </div>
                      <div className="text-[10px] text-gray-400">{entry.date.split('-').slice(1).join('/')}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">记一笔</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {/* Type selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4">
              <button
                onClick={() => setNewEntry(prev => ({ ...prev, type: 'expense', category: '' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  newEntry.type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500'
                }`}
              >
                支出
              </button>
              <button
                onClick={() => setNewEntry(prev => ({ ...prev, type: 'income', category: '' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  newEntry.type === 'income' ? 'bg-green-500 text-white' : 'text-gray-500'
                }`}
              >
                收入
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">金额</label>
                <input
                  type="number"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">分类</label>
                <div className="grid grid-cols-5 gap-2">
                  {(newEntry.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <button
                      key={cat.label}
                      onClick={() => setNewEntry(prev => ({ ...prev, category: cat.label }))}
                      className={`flex flex-col items-center p-2 rounded-lg ${
                        newEntry.category === cat.label
                          ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-[10px] mt-1">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">备注</label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="备注信息..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">日期</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddEntry}
              disabled={!newEntry.amount || !newEntry.category}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;