import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { SpineHealthIcon } from '../icons';
import styles from './HealthCard.module.css';

// 肩颈脊椎健康卡片组件
const SpineHealthCard = ({ onClick }) => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();

  // 计算年龄
  const age = useMemo(() => {
    if (!userConfig?.birthDate) return '未知';
    const birthDate = new Date(userConfig.birthDate);
    const today = new Date();
    // 使用简单的年份相减，符合用户直觉 (1991 -> 34)
    return today.getFullYear() - birthDate.getFullYear();
  }, [userConfig?.birthDate]);

  // 随机生成今日重点（模拟）
  const dailyFocus = useMemo(() => {
    const focusList = [
      {
        title: '把肩胛稳定练起来，减少压力性耸肩与代偿。',
        detail: '压力与代偿紧张，避免过热与暴汗型训练，优先拉伸与稳定。'
      },
      {
        title: '颈椎前伸矫正，改善低头族体态。',
        detail: '每工作45分钟进行一次颈部后缩运动，保持视线平视。'
      },
      {
        title: '胸椎灵活度训练，释放背部压力。',
        detail: '久坐导致胸椎僵硬，建议进行猫牛式伸展。'
      }
    ];
    // 简单使用日期作为种子选择
    const day = new Date().getDate();
    return focusList[day % focusList.length];
  }, []);

  const handleClick = (action) => {
    if (onClick) {
      onClick('spine-health', action);
    } else {
      navigate('/spine-health');
    }
  };

  return (
    <div className={`${styles.card} ${styles.gradientSpine}`} onClick={() => handleClick()}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <SpineHealthIcon size={24} color="#0d9488" />
          </div>
          <div className="ml-2">
            <h3 className={styles.title} style={{ margin: 0 }}>肩颈脊椎健康</h3>
            <p className="text-[10px] opacity-70 mt-0.5">年龄 {age} · {userConfig?.constitution || '平和质'}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className="bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-white/20 flex-1 flex flex-col justify-center">
          <p className="text-[10px] font-bold opacity-60 mb-1">今日重点</p>
          <p className="text-sm font-bold text-teal-900 dark:text-teal-100 mb-1 leading-tight">
            {dailyFocus.title}
          </p>
          <p className="text-[10px] text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
            {dailyFocus.detail}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          <button 
            className="text-[10px] py-1.5 px-1 bg-white/50 dark:bg-white/10 rounded-lg text-teal-800 dark:text-teal-200 font-medium hover:bg-white/70 transition-colors truncate"
            onClick={(e) => { e.stopPropagation(); handleClick('relief'); }}
          >
            立即缓解
          </button>
          <button 
            className="text-[10px] py-1.5 px-1 bg-white/50 dark:bg-white/10 rounded-lg text-teal-800 dark:text-teal-200 font-medium hover:bg-white/70 transition-colors truncate"
            onClick={(e) => { e.stopPropagation(); handleClick('strengthen'); }}
          >
            长期强化
          </button>
          <button 
            className="text-[10px] py-1.5 px-1 bg-white/50 dark:bg-white/10 rounded-lg text-teal-800 dark:text-teal-200 font-medium hover:bg-white/70 transition-colors truncate"
            onClick={(e) => { e.stopPropagation(); handleClick('habit'); }}
          >
            习惯调整
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpineHealthCard;