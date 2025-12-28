import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FinancePage.css';

/**
 * 财务斩杀线页面
 * 功能：固定支出、临时消费、统计、图表、警示提醒、本地存储
 */
const FinancePage = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);

  // 检测系统是否使用dark主题
  const isDarkTheme = () => {
    const html = document.documentElement;
    return html.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // 月收入
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = localStorage.getItem('monthlyIncome');
    return saved ? parseFloat(saved) : 0;
  });

  // 支出列表
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('financeExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  // 新增支出表单
  const [newExpense, setNewExpense] = useState({
    type: 'fixed',
    category: '房贷',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 当前显示月份
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // 保存月收入
  useEffect(() => {
    localStorage.setItem('monthlyIncome', monthlyIncome.toString());
  }, [monthlyIncome]);

  // 保存支出数据
  useEffect(() => {
    localStorage.setItem('financeExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // 计算当月支出
  const getCurrentMonthExpenses = () => {
    return expenses.filter(expense =>
      expense.date.startsWith(currentMonth)
    );
  };

  // 计算固定支出
  const getFixedExpenses = () => {
    return getCurrentMonthExpenses().filter(expense => expense.type === 'fixed');
  };

  // 计算临时支出
  const getTemporaryExpenses = () => {
    return getCurrentMonthExpenses().filter(expense => expense.type === 'temporary');
  };

  // 按分类统计支出
  const getExpensesByCategory = () => {
    const currentExpenses = getCurrentMonthExpenses();
    const categoryTotals = {};

    currentExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    return categoryTotals;
  };

  // 计算总支出
  const getTotalExpenses = () => {
    return getCurrentMonthExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  // 计算剩余额度
  const getRemainingBudget = () => {
    return monthlyIncome - getTotalExpenses();
  };

  // 是否需要警示
  const needsWarning = () => {
    const remaining = getRemainingBudget();
    return monthlyIncome > 0 && remaining < 3000;
  };

  // 添加支出
  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) return;

    const expense = {
      id: Date.now(),
      type: newExpense.type,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      createdAt: new Date().toISOString()
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      type: 'fixed',
      category: newExpense.type === 'fixed' ? '房贷' : '日常',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // 删除支出
  const deleteExpense = (id) => {
    if (window.confirm('确定要删除这条支出记录吗？')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  // 切换月份
  const changeMonth = (delta) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonth}`);
  };

  // 分类列表
  const fixedCategories = ['房贷', '车贷', '信用卡', '网贷', '房租', '其他固定'];
  const temporaryCategories = ['餐饮', '购物', '交通', '娱乐', '医疗', '其他'];

  // 绘制横向柱状图
  const renderChart = () => {
    const categoryTotals = getExpensesByCategory();
    const categories = Object.keys(categoryTotals);
    const maxValue = Math.max(...Object.values(categoryTotals), 1);

    return (
      <div className="chart-container">
        {categories.map((category, index) => {
          const amount = categoryTotals[category];
          const percentage = (amount / maxValue) * 100;
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
          const color = colors[index % colors.length];

          return (
            <div key={category} className="chart-item">
              <div className="chart-label">{category}</div>
              <div className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                >
                  <span className="chart-value">¥{amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalExpenses = getTotalExpenses();
  const remainingBudget = getRemainingBudget();
  const categoryTotals = getExpensesByCategory();
  const fixedTotal = getFixedExpenses().reduce((sum, e) => sum + e.amount, 0);
  const temporaryTotal = getTemporaryExpenses().reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className={`finance-page ${isDarkTheme() ? 'dark' : ''}`}>
      {/* 顶部导航栏 */}
      <div className="finance-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="page-title">💰 财务斩杀线</h1>
      </div>

      {/* 月收入设置 */}
      <div className="income-card">
        <h3>月收入设置</h3>
        <div className="income-input-group">
          <span className="currency-symbol">¥</span>
          <input
            type="number"
            className="income-input"
            placeholder="输入月收入"
            value={monthlyIncome || ''}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* 月份选择 */}
      <div className="month-selector">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          ← 上月
        </button>
        <span className="current-month">
          {currentMonth}
        </span>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          下月 →
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">月收入</div>
            <div className="stat-value">¥{monthlyIncome.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">总支出</div>
            <div className="stat-value">¥{totalExpenses.toFixed(2)}</div>
          </div>
        </div>

        <div className={`stat-card ${needsWarning() ? 'warning' : 'remaining'}`}>
          <div className="stat-icon">{needsWarning() ? '⚠️' : '🎯'}</div>
          <div className="stat-content">
            <div className="stat-label">剩余额度</div>
            <div className="stat-value">¥{remainingBudget.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 警示信息 */}
      {needsWarning() && (
        <div className="warning-banner">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>财务警示：</strong>
              剩余额度低于3000元，请控制开支！
            </div>
          </div>
        </div>
      )}

      {/* 支出统计图表 */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="chart-card">
          <h3>支出分类统计</h3>
          {renderChart()}
        </div>
      )}

      {/* 快速统计 */}
      <div className="quick-stats">
        <div className="quick-stat-item">
          <span className="quick-stat-label">固定支出：</span>
          <span className="quick-stat-value fixed">¥{fixedTotal.toFixed(2)}</span>
        </div>
        <div className="quick-stat-item">
          <span className="quick-stat-label">临时支出：</span>
          <span className="quick-stat-value temporary">¥{temporaryTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* 添加支出表单 */}
      <div className="add-expense-card">
        <h3>添加支出</h3>
        <form onSubmit={addExpense}>
          <div className="expense-type-selector">
            <button
              type="button"
              className={`type-btn ${newExpense.type === 'fixed' ? 'active' : ''}`}
              onClick={() => setNewExpense({
                ...newExpense,
                type: 'fixed',
                category: '房贷'
              })}
            >
              固定支出
            </button>
            <button
              type="button"
              className={`type-btn ${newExpense.type === 'temporary' ? 'active' : ''}`}
              onClick={() => setNewExpense({
                ...newExpense,
                type: 'temporary',
                category: '餐饮'
              })}
            >
              临时消费
            </button>
          </div>

          <div className="form-row">
            <select
              className="form-select"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              {newExpense.type === 'fixed' ? (
                fixedCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                temporaryCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              className="form-input amount-input"
              placeholder="金额"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              step="0.01"
              min="0"
            />
            <input
              type="date"
              className="form-input date-input"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="备注说明（可选）"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </div>

          <button type="submit" className="submit-btn">
            + 添加支出
          </button>
        </form>
      </div>

      {/* 支出记录列表 */}
      <div className="expenses-list">
        <h3>
          支出记录
          <span className="record-count">
            ({getCurrentMonthExpenses().length}条)
          </span>
        </h3>

        {getCurrentMonthExpenses().length === 0 ? (
          <div className="empty-state">
            <p>暂无支出记录</p>
            <p className="empty-hint">添加您的第一笔支出记录</p>
          </div>
        ) : (
          <div className="expense-items">
            {getCurrentMonthExpenses().map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-left">
                  <div className="expense-category">{expense.category}</div>
                  <div className="expense-meta">
                    <span className={`expense-type ${expense.type}`}>
                      {expense.type === 'fixed' ? '固定' : '临时'}
                    </span>
                    <span className="expense-date">
                      {new Date(expense.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {expense.description && (
                    <div className="expense-description">{expense.description}</div>
                  )}
                </div>
                <div className="expense-right">
                  <div className="expense-amount">-¥{expense.amount.toFixed(2)}</div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
