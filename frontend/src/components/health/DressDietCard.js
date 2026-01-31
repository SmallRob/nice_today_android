import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDressInfo } from '../../services/localDataService.js';
import { DressGuideIcon } from '../icons';
import styles from './HealthCard.module.css';

// 每日穿搭与饮食建议卡片组件
const DressDietCard = ({ onClick }) => {
  const navigate = useNavigate();
  const [dressInfo, setDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取今日穿搭饮食信息
  const fetchDressInfo = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const info = generateDressInfo(today);
      setDressInfo(info);
      setError(null);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDressInfo();
  }, []);

  const colorSuggestions = useMemo(() => {
    if (!dressInfo?.color_suggestions) return [];
    return dressInfo.color_suggestions.flatMap(c => c.具体颜色 || []).slice(0, 3);
  }, [dressInfo]);

  const foodSuggestions = useMemo(() => {
    if (!dressInfo?.food_suggestions?.宜) return [];
    return dressInfo.food_suggestions.宜.slice(0, 3);
  }, [dressInfo]);

  const handleClick = () => {
    if (onClick) {
      onClick('dress-diet');
    } else {
      navigate('/dress');
    }
  };

  return (
    <div className={`${styles.card} ${styles.gradientDress}`} onClick={handleClick}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <DressGuideIcon size={24} color="#0284c7" />
          </div>
          <h3 className={styles.title}>穿搭饮食</h3>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-gray-600 whitespace-nowrap">
          五行: {dressInfo?.daily_element || '木'}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
          </div>
        ) : error ? (
          <p className="text-center text-xs text-red-500">{error}</p>
        ) : (
          <>
            <div className="bg-white/40 dark:bg-black/10 p-2.5 rounded-xl border border-white/20">
              <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight">
                {dressInfo?.health_advice || '根据五行理论，选择合适颜色和食物'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className={styles.statItem}>
                <div className="text-[10px] font-bold text-gray-500 mb-1">穿搭建议</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {colorSuggestions.map((c, i) => (
                    <span key={i} className="text-[9px] bg-white/60 px-1.5 py-0.5 rounded text-sky-700">{c}</span>
                  ))}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className="text-[10px] font-bold text-gray-500 mb-1">饮食推荐</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {foodSuggestions.map((f, i) => (
                    <span key={i} className="text-[9px] bg-white/60 px-1.5 py-0.5 rounded text-orange-700">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DressDietCard;