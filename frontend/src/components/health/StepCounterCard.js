import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import stepCounterService from '../../services/stepCounterService';

/**
 * 步数计数器卡片组件 - 显示用户步数及健康建议
 * 注意：此组件为模拟实现，实际集成需要配合原生插件
 */
const StepCounterCard = ({ onClick }) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthTips, setHealthTips] = useState('');

  // 获取步数数据
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        setLoading(true);
        
        // 检查是否已授权
        if (!stepCounterService.isAuthorizationAvailable()) {
          // 尝试授权
          const authResult = await stepCounterService.authorize();
          if (!authResult.success) {
            throw new Error(authResult.message || '授权失败');
          }
        }
        
        // 获取今日步数
        const stats = await stepCounterService.getStepStats();
        setSteps(stats.today);
        setLoading(false);
        
        // 根据步数生成健康提示
        generateHealthTips(stats.today);
      } catch (err) {
        console.error('获取步数数据失败:', err);
        setError(err.message || '获取步数数据失败');
        setLoading(false);
      }
    };

    fetchSteps();

    // 每5分钟更新一次数据
    const interval = setInterval(fetchSteps, 300000);
    return () => clearInterval(interval);
  }, []);

  // 根据步数生成健康提示
  const generateHealthTips = (stepCount) => {
    let tips = '';
    
    if (stepCount >= 12000) {
      tips = 'Excellent! 您的步数表现卓越，运动达人！继续保持这种积极的生活方式。';
    } else if (stepCount >= 10000) {
      tips = 'Great job! 您达到了理想的步数目标，这对心血管健康非常有益。';
    } else if (stepCount >= 8000) {
      tips = 'Good! 步数表现良好，接近健康目标，再接再厉！';
    } else if (stepCount >= 6000) {
      tips = 'Fair! 步数达标，适量运动有益健康，建议逐步增加活动量。';
    } else if (stepCount >= 4000) {
      tips = '需要加强运动哦！建议每日步行至少5000步，可以从增加日常活动开始。';
    } else {
      tips = '运动不足！建议立即开始增加活动量，即使是短距离散步也有益健康。';
    }
    
    // 根据一天中的不同时间提供不同的建议
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      // 早晨时段建议
      tips += ' 早晨是开始一天运动的好时机，继续加油！';
    } else if (hour >= 12 && hour < 18) {
      // 下午时段建议
      tips += ' 下午阳光正好，适合户外活动，不妨出去走走。';
    } else {
      // 晚上时段建议
      tips += ' 今晚可以适当散步，有助于消化和睡眠。';
    }
    
    setHealthTips(tips);
  };

  // 刷新步数数据
  const refreshSteps = async () => {
    try {
      setLoading(true);
      
      // 检查是否已授权
      if (!stepCounterService.isAuthorizationAvailable()) {
        // 尝试授权
        const authResult = await stepCounterService.authorize();
        if (!authResult.success) {
          throw new Error(authResult.message || '授权失败');
        }
      }
      
      // 获取今日步数
      const stats = await stepCounterService.getStepStats();
      setSteps(stats.today);
      generateHealthTips(stats.today);
      setLoading(false);
    } catch (err) {
      console.error('刷新步数数据失败:', err);
      setError(err.message || '刷新步数数据失败');
      setLoading(false);
    }
  };

  // 步数图标
  // 添加动态渐变效果的样式
  const dynamicGradientStyle = {
    background: 'linear-gradient(-45deg, #ff4757, #ff9ff3, #f368e0, #0984e3, #00cec9, #00b894)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 10s ease infinite',
  };

  // 将关键帧动画添加到页面中
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const StepsIcon = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ color: '#f97316' }}
    >
      <path d="M13 4l1 1 3-3-1 3 3-1-3 1 1 3-3-1 1 1-3-3 3-1-1 3-1-1z" />
      <path d="M2 20v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <div 
      style={{
        background: 'var(--card-background, linear-gradient(-45deg, #ff4757, #ff9ff3, #f368e0, #0984e3, #00cec9, #00b894))',
        backgroundSize: '400% 400%',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: 'var(--card-box-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 12px -5px rgba(0, 0, 0, 0.1))',
        border: '1px solid var(--card-border-color, rgba(255, 255, 255, 0.4))',
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'visible',
        minHeight: '300px',
        animation: 'gradientAnimation 9s ease infinite'
      }}
      onClick={() => onClick ? onClick('step-counter') : navigate('/health-dashboard')} >
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff9ff3)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            marginRight: '0.75rem',
            boxShadow: '0 4px 10px rgba(255, 107, 87, 0.3)'
          }}>
            <StepsIcon />
          </div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: 'var(--text-primary, #0f172a)',
            textShadow: 'var(--text-shadow, 0 1px 2px rgba(255, 255, 255, 0.3))'
          }}>今日步数</h3>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            refreshSteps();
          }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            color: 'var(--refresh-btn-color, #6b7280)',
            padding: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--refresh-btn-bg, rgba(255, 255, 255, 0.5))',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            backdropFilter: 'blur(4px)'
          }}
          onMouseEnter={(e) => e.target.style.color = '#374151'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          title="刷新数据"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">正在获取步数数据...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <div className="text-red-500 mb-2">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              refreshSteps();
            }}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {steps.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">步</div>
          </div>

          <div className="bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="mr-2 text-yellow-500">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h4l2 2" />
                </svg>
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200">
                {healthTips}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <div className="text-xs text-green-800 dark:text-green-200">目标</div>
              <div className="text-sm font-semibold text-green-900 dark:text-green-100">10000</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <div className="text-xs text-blue-800 dark:text-blue-200">距离</div>
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {(steps * 0.0008).toFixed(2)}km
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
              <div className="text-xs text-purple-800 dark:text-purple-200">卡路里</div>
              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                {Math.round(steps * 0.04)}
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
              <div className="text-xs text-yellow-800 dark:text-yellow-200">完成</div>
              <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                {Math.min(100, Math.round((steps / 10000) * 100))}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--card-divider-color, rgba(255, 255, 255, 0.3))',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary, #334155)',
        textShadow: 'var(--text-shadow, 0 1px 2px rgba(255, 255, 255, 0.2))',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>最后更新: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{
            color: 'var(--divider-color, rgba(255, 255, 255, 0.5))'
          }}>•</span>
          <span>步数来源: 健康应用</span>
        </div>
      </div>
    </div>
  );
};

export default StepCounterCard;