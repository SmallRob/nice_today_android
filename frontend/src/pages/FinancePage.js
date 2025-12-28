import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FinancePage.css';

/**
 * 财务斩杀线页面
 * 功能：固定支出、临时消费、统计、图表、警示提醒、本地存储
 * 优化：添加弹窗设置固定收入，修复错位问题，优化字体大小和元素间距
 * 新增：收支按月/年统计图，支出曲线图，红线标记斩杀线，余额<3000警示
 */
const FinancePage = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);

  // 检测系统是否使用dark主题
  const isDarkTheme = () => {
    const html = document.documentElement;
    return html.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // 状态管理
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

  // 统计视图模式：'monthly' 或 'yearly'
  const [viewMode, setViewMode] = useState('monthly');

  // 固定收入弹窗
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempIncome, setTempIncome] = useState('');

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

  // 计算当前年份的支出
  const getYearlyExpenses = (year) => {
    return expenses.filter(expense =>
      expense.date.startsWith(`${year}`)
    );
  };

  // 按月份统计支出
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

  // 计算每月支出（用于曲线图）
  const getMonthlyExpensesData = () => {
    const monthlyData = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM格式
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, byCategory: {} };
      }
      monthlyData[month].total += expense.amount;
      if (!monthlyData[month].byCategory[expense.category]) {
        monthlyData[month].byCategory[expense.category] = 0;
      }
      monthlyData[month].byCategory[expense.category] += expense.amount;
    });
    return monthlyData;
  };

  // 计算总支出
  const getTotalExpenses = () => {
    return getCurrentMonthExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  // 计算剩余额度
  const getRemainingBudget = () => {
    const total = getTotalExpenses();
    return monthlyIncome - total;
  };

  // 是否需要警示（余额低于3000）
  const needsWarning = () => {
    const remaining = getRemainingBudget();
    return remaining < 3000 && remaining > 0;
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
    setViewMode('monthly');
  };

  // 分类列表
  const fixedCategories = ['房贷', '车贷', '信用卡', '网贷', '房租', '其他固定'];
  const temporaryCategories = ['餐饮', '购物', '交通', '娱乐', '医疗', '其他'];

  // 渲染横向柱状图
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

  // 渲染曲线图（按月实时计算）
  const renderLineChart = () => {
    const monthlyData = getMonthlyExpensesData();
    const months = Object.keys(monthlyData).sort();

    // 计算斩杀线位置（3000 / 月收入）
    const income = monthlyIncome > 0 ? monthlyIncome : 10000;
    const warningLinePosition = (3000 / income) * 100;

    // 生成数据点
    const dataPoints = months.map(month => {
      const monthData = monthlyData[month];
      const remaining = income - monthData.total;
      const isBelowWarningLine = remaining < 3000;
      return {
        month: month,
        amount: monthData.total,
        remaining: remaining,
        isBelowWarning: isBelowWarningLine
      };
    });

    const maxAmount = Math.max(...dataPoints.map(d => d.amount), 1);

    return (
      <div className="line-chart-container">
        <h3>月度支出曲线图</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color line-chart-danger-line"></div>
            <span className="legend-text">余额: 警示线 ¥3,000</span>
          </div>
        </div>
        {dataPoints.length > 0 ? (
          <div className="line-chart-wrapper">
            <div className="chart-canvas-container">
              <canvas ref={chartRef} className="line-chart-canvas" />
            </div>
            <div className="line-chart-legend">
              <div className="legend-item">
                <div className="legend-color line-chart-line"></div>
                <span className="legend-text">支出</span>
              </div>
              <div className="legend-item">
                <div className="legend-color line-chart-remaining-line"></div>
                <span className="legend-text">余额</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>暂无数据</p>
          </div>
        )}
      </div>
    );
  };

  // 渲染 Canvas 曲线图
  useEffect(() => {
    if (viewMode === 'yearly' && chartRef.current) {
      const monthlyData = getMonthlyExpensesData();
      const months = Object.keys(monthlyData).sort();
      const income = monthlyIncome > 0 ? monthlyIncome : 10000;
      
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      const canvas = chartRef.current;
      const dpr = window.devicePixelRatio || 1;
      
      // 设置Canvas尺寸
      const width = canvas.offsetWidth * dpr;
      const height = canvas.offsetHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width / dpr + 'px';
      canvas.style.height = height / dpr + 'px';
      
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const dataPoints = [];
      const labels = [];

      months.forEach(month => {
        const monthData = monthlyData[month];
        const remaining = income - monthData.total;
        dataPoints.push({ x: dataPoints.length, y: remaining });
        labels.push(month.substring(5) + '月');
      });

      // 计算斩杀线位置
      const warningLineY = chartHeight - ((3000 / income) * chartHeight);

      // 绘制斩杀线
      ctx.beginPath();
      ctx.strokeStyle = isDarkTheme() ? '#ef4444' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(padding, warningLineY);
      ctx.lineTo(chartWidth - padding, warningLineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 绘制余额曲线
      if (dataPoints.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme() ? '#10b981' : '#10b981';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        dataPoints.forEach((point, index) => {
          const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
          const y = chartHeight - (point.y / Math.max(...dataPoints.map(d => d.y), 1)) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // 绘制数据点
        dataPoints.forEach((point, index) => {
          const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
          const y = chartHeight - (point.y / Math.max(...dataPoints.map(d => d.y), 1)) * chartHeight;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2, false);
          ctx.fillStyle = isDarkTheme() ? '#10b981' : '#10b981';
          ctx.fill();
          ctx.beginPath();
          ctx.strokeStyle = isDarkTheme() ? '#ffffff' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // 绘制标签
        ctx.fillStyle = isDarkTheme() ? '#6b7280' : '#374151';
        ctx.font = `${12 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
          const x = padding + (index / (labels.length - 1)) * chartWidth;
          ctx.textBaseline = 'middle';
          ctx.fillText(label, x, chartHeight + 10);
        });
      }
    }
  }, [viewMode, monthlyIncome, expenses, isDarkTheme]);

  // 绘制年度图表
  const renderYearlyChart = () => {
    const yearlyData = {};
    expenses.forEach(expense => {
      const year = expense.date.substring(0, 4);
      if (!yearlyData[year]) {
        yearlyData[year] = { total: 0, byCategory: {} };
      }
      yearlyData[year].total += expense.amount;
      if (!yearlyData[year].byCategory[expense.category]) {
        yearlyData[year].byCategory[expense.category] = 0;
      }
      yearlyData[year].byCategory[expense.category] += expense.amount;
    });

    return (
      <div className="year-chart-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(yearlyData).sort().map((year, index) => {
            const yearDataItem = yearlyData[year];
            const remaining = monthlyIncome * 12 - yearDataItem.total;
            const isBelowWarningLine = remaining < 3000;
            
            return (
              <div key={year} className="year-stat-card">
                <div className="year-stat-year text-base font-semibold text-gray-800 dark:text-gray-100">
                  {year}
                </div>
                <div className="year-stat-values flex items-center justify-between gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>总支出</div>
                    <div className="year-stat-amount font-bold text-lg">{yearDataItem.total.toFixed(2)}</div>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded-full ${isBelowWarningLine ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    {isBelowWarningLine ? '⚠️' : ''} 余额: {remaining.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* 视图切换 */}
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          月度视图
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'yearly' ? 'active' : ''}`}
          onClick={() => setViewMode('yearly')}
        >
          年度视图
        </button>
      </div>

      {/* 月收入设置 */}
      <div className="income-card">
        <h3>月收入设置</h3>
        <div className="income-display">
          <div>
            <span className="currency-symbol">¥</span>
            <span className="income-amount">{monthlyIncome.toFixed(2)}</span>
            <button
              className="edit-income-btn"
              onClick={() => {
                setShowIncomeModal(true);
                setTempIncome(monthlyIncome.toString());
              }}
              title="编辑月收入"
            >
              ✏️
            </button>
          </div>
        </div>
      </div>

      {/* 固定收入编辑弹窗 */}
      {showIncomeModal && (
        <div className="income-modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="income-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">编辑月收入</h3>
            <div className="income-input-group">
              <span className="currency-symbol">¥</span>
              <input
                type="number"
                className="income-input"
                placeholder="输入月收入"
                value={tempIncome}
                onChange={(e) => setTempIncome(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowIncomeModal(false)}
              >
                取消
              </button>
              <button
                className="modal-btn confirm-btn"
                onClick={() => {
                  const newIncome = parseFloat(tempIncome);
                  if (isNaN(newIncome) || newIncome < 0) {
                    alert('请输入有效的收入金额');
                    return;
                  }
                  setMonthlyIncome(newIncome);
                  setShowIncomeModal(false);
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

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
              余额低于斩杀线（¥3,000），请控制开支！
            </div>
          </div>
        </div>
      )}

      {/* 根据视图模式显示不同的图表 */}
      {viewMode === 'monthly' && (
        <>
          {/* 支出分类统计图 */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="chart-card">
              <h3>支出分类统计</h3>
              {renderChart()}
            </div>
          )}

          {/* 月度支出曲线图 */}
          <div className="chart-card">
            <h3>月度支出曲线图</h3>
            {renderLineChart()}
          </div>
        </>
      )}

      {viewMode === 'yearly' && (
        <div className="chart-card">
          <h3>年度支出统计</h3>
          {renderYearlyChart()}
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
