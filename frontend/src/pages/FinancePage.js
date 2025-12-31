import React, { useState, useEffect, useRef } from 'react';
import './FinancePage.css';

/**
 * 财务斩杀线页面
 * 功能：固定支出、临时消费、统计、图表、警示提醒、本地存储
 * 优化：添加弹窗设置固定收入，修复错位问题，优化字体大小和元素间距
 * 新增：收支按月/年统计图，支出曲线图，红线标记斩杀线，余额<3000警示
 */
const FinancePage = () => {
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

  // 首次使用引导
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return !localStorage.getItem('financeOnboarded');
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

  // 渲染本月每日余额曲线图（斩杀线）
  const renderDailyBalanceChart = () => {
    const dailyData = getDailyBalanceData();

    return (
      <div className="daily-balance-chart-container">
        <h3>本月余额变化（斩杀线）</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color line-chart-danger-line"></div>
            <span className="legend-text">警示线 ¥3,000</span>
          </div>
          <div className="legend-item">
            <div className="legend-color line-chart-remaining-line"></div>
            <span className="legend-text">余额</span>
          </div>
        </div>
        {dailyData.length > 0 ? (
          <div className="daily-chart-wrapper">
            <canvas ref={chartRef} className="daily-chart-canvas" />
            <div className="daily-chart-summary">
              <div className={`summary-item ${dailyData[dailyData.length - 1]?.isBelowWarning ? 'warning' : 'safe'}`}>
                <span className="summary-label">今日余额：</span>
                <span className="summary-value">¥{dailyData[dailyData.length - 1]?.remaining.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">本月支出：</span>
                <span className="summary-value">¥{dailyData[dailyData.length - 1]?.accumulated.toFixed(2)}</span>
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

  // 计算本月每日余额（斩杀线曲线）
  const getDailyBalanceData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = today.getDate();

    // 获取本月所有支出
    const monthExpenses = expenses.filter(expense =>
      expense.date.startsWith(`${currentYear}-${currentMonth}`)
    );

    // 按日期累计支出
    const dailyExpenses = {};
    monthExpenses.forEach(expense => {
      const day = parseInt(expense.date.split('-')[2]);
      if (!dailyExpenses[day]) {
        dailyExpenses[day] = 0;
      }
      dailyExpenses[day] += expense.amount;
    });

    // 生成从1日到今日的每日余额
    const dailyData = [];
    let accumulatedExpense = 0;
    const income = monthlyIncome > 0 ? monthlyIncome : 10000;

    for (let day = 1; day <= currentDay; day++) {
      if (dailyExpenses[day]) {
        accumulatedExpense += dailyExpenses[day];
      }
      const remaining = income - accumulatedExpense;
      dailyData.push({
        day: day,
        expense: dailyExpenses[day] || 0,
        accumulated: accumulatedExpense,
        remaining: remaining,
        isBelowWarning: remaining < 3000
      });
    }

    return dailyData;
  };

  // 渲染 Canvas 曲线图
  useEffect(() => {
    if (chartRef.current) {
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

      const padding = viewMode === 'monthly' ? 30 : 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const income = monthlyIncome > 0 ? monthlyIncome : 10000;

      if (viewMode === 'monthly') {
        // 绘制每日余额曲线
        const dailyData = getDailyBalanceData();

        if (dailyData.length > 0) {
          const dataPoints = dailyData.map(d => d.remaining);
          const maxRemaining = Math.max(...dataPoints, income);

          // 计算斩杀线位置
          const warningLineY = chartHeight - ((3000 / maxRemaining) * chartHeight);

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
          ctx.beginPath();
          ctx.strokeStyle = isDarkTheme() ? '#10b981' : '#10b981';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          dailyData.forEach((day, index) => {
            const x = padding + (index / (dailyData.length - 1)) * chartWidth;
            const y = chartHeight - (day.remaining / maxRemaining) * chartHeight;

            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();

          // 绘制数据点
          dailyData.forEach((day, index) => {
            const x = padding + (index / (dailyData.length - 1)) * chartWidth;
            const y = chartHeight - (day.remaining / maxRemaining) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2, false);
            ctx.fillStyle = day.isBelowWarning ? '#ef4444' : '#10b981';
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = isDarkTheme() ? '#ffffff' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          // 绘制日期标签（每隔几天显示一个）
          ctx.fillStyle = isDarkTheme() ? '#6b7280' : '#374151';
          ctx.font = `${10 * dpr}px sans-serif`;
          ctx.textAlign = 'center';
          const labelInterval = Math.ceil(dailyData.length / 5);
          dailyData.forEach((day, index) => {
            if (index % labelInterval === 0 || index === dailyData.length - 1) {
              const x = padding + (index / (dailyData.length - 1)) * chartWidth;
              ctx.fillText(`${day.day}日`, x, chartHeight + 15);
            }
          });
        }
      } else {
        // 绘制年度曲线
        const monthlyData = getMonthlyExpensesData();
        const months = Object.keys(monthlyData).sort();
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
          {Object.keys(yearlyData).sort().map((year) => {
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
    <div className={`finance-page min-h-screen pb-32 px-4 md:px-6 ${isDarkTheme() ? 'dark' : ''}`}>
      {/* 新用户引导弹窗 */}
      {showWelcomeModal && (
        <div className="welcome-modal-overlay" onClick={() => {
          setShowWelcomeModal(false);
          localStorage.setItem('financeOnboarded', 'true');
        }}>
          <div className="welcome-modal" onClick={e => e.stopPropagation()}>
            <div className="welcome-icon">💰</div>
            <h2 className="welcome-title">欢迎使用财务斩杀线</h2>
            <div className="welcome-content">
              <p>帮助您更好地管理财务，控制支出，实现财务自由！</p>
              <div className="welcome-features">
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>实时追踪收支</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚠️</span>
                  <span>智能警示提醒</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>可视化数据分析</span>
                </div>
              </div>
            </div>
            <div className="welcome-actions">
              <button
                className="welcome-btn skip-btn"
                onClick={() => {
                  setShowWelcomeModal(false);
                  localStorage.setItem('financeOnboarded', 'true');
                }}
              >
                稍后再说
              </button>
              <button
                className="welcome-btn primary-btn"
                onClick={() => {
                  setShowWelcomeModal(false);
                  setShowIncomeModal(true);
                  setTempIncome(monthlyIncome.toString());
                  localStorage.setItem('financeOnboarded', 'true');
                }}
              >
                立即设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">💰 财务斩杀线</h1>
      </div>

      {/* 视图切换 */}
      <div className="flex justify-center space-x-2 mb-4">
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
          onClick={() => setViewMode('monthly')}
        >
          本月视图
        </button>
        <button
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'yearly' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
          onClick={() => setViewMode('yearly')}
        >
          年度视图
        </button>
      </div>

      {/* 月收入设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-4 shadow-sm flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">月收入设置</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1">¥</span>
          <span className="text-lg font-bold text-gray-800 dark:text-white mr-2">{monthlyIncome.toFixed(2)}</span>
          <button
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            onClick={() => {
              setShowIncomeModal(true);
              setTempIncome(monthlyIncome.toString());
            }}
          >
            ✏️
          </button>
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
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 mb-4">
        <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => changeMonth(-1)}>
          ←
        </button>
        <span className="font-bold text-gray-800 dark:text-white">
          {currentMonth}
        </span>
        <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => changeMonth(1)}>
          →
        </button>
      </div>

      {/* 统计卡片 - 3列布局 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">月收入</div>
          <div className="text-sm md:text-lg font-bold text-green-600 dark:text-green-400 truncate w-full text-center">
            <span className="text-xs scale-75 inline-block mr-0.5">¥</span>{monthlyIncome.toFixed(0)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">总支出</div>
          <div className="text-sm md:text-lg font-bold text-red-500 dark:text-red-400 truncate w-full text-center">
            <span className="text-xs scale-75 inline-block mr-0.5">¥</span>{totalExpenses.toFixed(0)}
          </div>
        </div>

        <div className={`rounded-xl p-3 shadow-sm flex flex-col items-center justify-center ${needsWarning() ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">剩余</div>
          <div className={`text-sm md:text-lg font-bold truncate w-full text-center ${needsWarning() ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
            <span className="text-xs scale-75 inline-block mr-0.5">¥</span>{remainingBudget.toFixed(0)}
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
          {/* 本月余额变化曲线图（斩杀线） */}
          <div className="chart-card">
            {renderDailyBalanceChart()}
          </div>

          {/* 支出分类统计图 */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="chart-card">
              <h3>支出分类统计</h3>
              {renderChart()}
            </div>
          )}
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">支出记录</h3>
          <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm">
            {getCurrentMonthExpenses().length}笔
          </span>
        </div>

        {getCurrentMonthExpenses().length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <p className="mb-2">👻</p>
            <p>暂无支出，去记一笔吧</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {getCurrentMonthExpenses().map(expense => (
              <div key={expense.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col min-w-0 flex-1 mr-3">
                  <div className="flex items-center mb-0.5">
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm mr-2 truncate">
                      {expense.category}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${expense.type === 'fixed'
                      ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                      }`}>
                      {expense.type === 'fixed' ? '固定' : '临时'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="mr-2">{new Date(expense.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}</span>
                    {expense.description && (
                      <span className="truncate border-l border-gray-200 pl-2 max-w-[120px]">{expense.description}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="font-bold text-gray-800 dark:text-gray-100 text-sm mr-2">
                    -¥{expense.amount.toFixed(2)}
                  </span>
                  <button
                    className="text-gray-300 hover:text-red-500 p-1 -mr-2"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
