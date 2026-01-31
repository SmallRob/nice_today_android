import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import stepCounterService from '../../services/stepCounterService';
import { StepCounterIcon } from '../icons';
import styles from './HealthCard.module.css';

/**
 * 步数计数器卡片组件 - 显示用户步数及健康建议
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
        if (!stepCounterService.isAuthorizationAvailable()) {
          await stepCounterService.authorize();
        }
        const stats = await stepCounterService.getStepStats();
        setSteps(stats.today);
        generateHealthTips(stats.today);
        setLoading(false);
      } catch (err) {
        console.error('获取步数数据失败:', err);
        setError(err.message || '获取步数数据失败');
        setLoading(false);
      }
    };

    fetchSteps();
    const interval = setInterval(fetchSteps, 300000);
    return () => clearInterval(interval);
  }, []);

  // 根据步数生成健康提示
  const generateHealthTips = (stepCount) => {
    let tips = '';
    if (stepCount >= 10000) tips = 'Great job! 您达到了理想步数目标。';
    else if (stepCount >= 6000) tips = 'Good! 步数达标，适量运动有益健康。';
    else tips = '加油！建议每日步行至少6000步。';
    setHealthTips(tips);
  };

  const refreshSteps = async () => {
    try {
      setLoading(true);
      const stats = await stepCounterService.getStepStats();
      setSteps(stats.today);
      generateHealthTips(stats.today);
      setLoading(false);
    } catch (err) {
      setError('刷新失败');
      setLoading(false);
    }
  };

  return (
    <div 
      className={`${styles.card} ${styles.gradientStep}`}
      onClick={() => onClick ? onClick('step-counter') : navigate('/health-dashboard')}
    >
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <StepCounterIcon size={24} color="#16a34a" />
          </div>
          <h3 className={styles.title}>今日步数</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            refreshSteps();
          }}
          className="p-1.5 rounded-full hover:bg-white/50 transition-colors"
          title="刷新数据"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="text-center py-1">
              <div className="text-3xl font-extrabold text-green-700 dark:text-green-400">
                {steps.toLocaleString()}
              </div>
              <div className="text-[10px] text-green-600/70 font-medium">今日步数</div>
            </div>

            <div className="bg-white/40 dark:bg-black/10 p-2 rounded-xl border border-white/20">
              <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-tight">{healthTips}</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-auto">
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.stepValue} !text-xs`}>{(steps * 0.0008).toFixed(1)}</div>
                <div className={styles.statLabel}>公里</div>
              </div>
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.stepValue} !text-xs`}>{Math.round(steps * 0.04)}</div>
                <div className={styles.statLabel}>千卡</div>
              </div>
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.stepValue} !text-xs`}>{Math.min(100, Math.round((steps / 10000) * 100))}%</div>
                <div className={styles.statLabel}>目标</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StepCounterCard;