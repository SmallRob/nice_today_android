import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentConfig } from '../../contexts/UserConfigContext.js';
import { getBiorhythmRange } from '../../services/localDataService';
import { BiorhythmIcon } from '../icons';
import styles from './HealthCard.module.css';

// 生物节律状态卡片组件
const BiorhythmStatusCard = ({ onClick }) => {
  const navigate = useNavigate();
  const userConfig = useCurrentConfig();
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取今日生物节律数据
  const fetchBiorhythmData = async () => {
    try {
      setLoading(true);

      // 检查是否有出生日期
      if (!userConfig?.birthDate) {
        setError('未设置出生日期');
        setLoading(false);
        return;
      }

      const result = await getBiorhythmRange(userConfig.birthDate, 2, 2);
      if (result.success && result.rhythmData && result.rhythmData.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayData = result.rhythmData.find(item => item.date.startsWith(todayStr)) || result.rhythmData[0];
        setBiorhythmData(todayData);
        setError(null);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('服务异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiorhythmData();
  }, [userConfig?.birthDate]);

  const combinedScore = useMemo(() => {
    if (!biorhythmData) return 50;
    const { physical = 0, emotional = 0, intellectual = 0 } = biorhythmData;
    const avg = (physical + emotional + intellectual) / 3;
    return Math.round((avg + 100) / 2);
  }, [biorhythmData]);

  const energyLevel = useMemo(() => {
    if (combinedScore >= 80) return { text: '极佳', color: '#16a34a' };
    if (combinedScore >= 60) return { text: '良好', color: '#2563eb' };
    if (combinedScore >= 40) return { text: '一般', color: '#ca8a04' };
    return { text: '低谷', color: '#dc2626' };
  }, [combinedScore]);

  const handleClick = () => {
    if (onClick) {
      onClick('biorhythm-status');
    } else {
      navigate('/biorhythm');
    }
  };

  if (!userConfig?.birthDate) {
    return (
      <div className={`${styles.card} ${styles.gradientBiorhythm} items-center justify-center text-center`} onClick={() => navigate('/user-config')}>
        <div className={styles.iconWrapper}><BiorhythmIcon size={32} color="#6366f1" /></div>
        <p className="mt-2 text-sm font-bold text-gray-500">请先设置出生日期</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.gradientBiorhythm}`} onClick={handleClick}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <BiorhythmIcon size={24} color="#6366f1" />
          </div>
          <h3 className={styles.title}>生物节律</h3>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-gray-600 whitespace-nowrap">
          今日能量: {combinedScore}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <p className="text-center text-xs text-red-500">{error}</p>
        ) : (
          <>
            <div className="text-center py-1">
              <div className="text-2xl font-black" style={{ color: energyLevel.color }}>
                {energyLevel.text}
              </div>
              <div className="w-full bg-white/30 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${combinedScore}%`, backgroundColor: energyLevel.color }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-auto">
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.biorhythmValue} !text-sm`}>{Math.round(biorhythmData.physical)}</div>
                <div className={styles.statLabel}>体力</div>
              </div>
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.biorhythmValue} !text-sm`}>{Math.round(biorhythmData.emotional)}</div>
                <div className={styles.statLabel}>情绪</div>
              </div>
              <div className={styles.statItem}>
                <div className={`${styles.statValue} ${styles.biorhythmValue} !text-sm`}>{Math.round(biorhythmData.intellectual)}</div>
                <div className={styles.statLabel}>智力</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BiorhythmStatusCard;