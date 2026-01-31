import React, { useMemo } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { useNavigate } from 'react-router-dom';
import { getAgeGroupByAge } from '../../constants/ageGroups.js';
import { StageHealthIcon } from '../icons';
import styles from './HealthCard.module.css';

// 阶段养生提醒卡片组件
const StageHealthCard = ({ onClick }) => {
  const { userConfig } = useUserConfig();
  const navigate = useNavigate();

  // 计算用户年龄段
  const currentAgeGroup = useMemo(() => {
    if (!userConfig?.birthDate) return 'unknown';
    const birthDate = new Date(userConfig.birthDate);
    const today = new Date();
    // 使用简单的年份相减 (1991 -> 34)
    const age = today.getFullYear() - birthDate.getFullYear();
    return getAgeGroupByAge(age).range;
  }, [userConfig?.birthDate]);

  // 获取年龄段对应的养生信息
  const ageGroupInfo = useMemo(() => {
    const ageGroupData = {
      '0-5岁': {
        title: '婴幼儿养生',
        description: '生长发育关键期',
        advice: '注重营养均衡，保证充足睡眠',
        icon: '👶',
        color: '#f43f5e',
        tips: ['营养均衡', '充足睡眠', '安全环境']
      },
      '6-12岁': {
        title: '儿童养生',
        description: '身心发展阶段',
        advice: '五行"木"主生发，侧重肝胆养护',
        icon: '🧒',
        color: '#f59e0b',
        tips: ['户外活动', '视力保护', '骨骼发育']
      },
      '13-17岁': {
        title: '青少年养生',
        description: '青春期发育期',
        advice: '五行"火"主生长，侧重心脏养护',
        icon: '🧑',
        color: '#ef4444',
        tips: ['作息规律', '心理健康', '支持发育']
      },
      '18-25岁': {
        title: '青年养生',
        description: '代谢调理阶段',
        advice: '侧重肝胆养护，避免熬夜耗肝血',
        icon: '🌱',
        color: '#10b981',
        tips: ['避免熬夜', '适度运动', '饮食清淡']
      },
      '26-35岁': {
        title: '青年中期',
        description: '事业起步阶段',
        advice: '侧重心脏养护，平衡工作与生活',
        icon: '💼',
        color: '#6366f1',
        tips: ['调节压力', '心态平和', '免疫力']
      },
      '36-45岁': {
        title: '中年早期',
        description: '家庭责任阶段',
        advice: '侧重脾胃养护，注重脏腑调理',
        icon: '👨‍👩‍👧‍👦',
        color: '#06b6d4',
        tips: ['脾胃调理', '定期体检', '预防慢病']
      },
      '46-55岁': {
        title: '中年中期',
        description: '精气神调养',
        advice: '侧重肺脏养护，注重精气神调养',
        icon: '🌿',
        color: '#f59e0b',
        tips: ['肺脏养护', '精神愉悦', '脏腑调理']
      },
      '56-65岁': {
        title: '中年晚期',
        description: '享受生活阶段',
        advice: '侧重脾胃，辅以经络按摩',
        icon: '🍃',
        color: '#f97316',
        tips: ['易消化', '经络按摩', '保持社交']
      },
      '66岁+': {
        title: '老年养生',
        description: '智慧传承阶段',
        advice: '侧重肾阴肾阳平衡，减少耗损',
        icon: '🪷',
        color: '#8b5cf6',
        tips: ['静养为主', '补气血', '心情平和']
      }
    };
    return ageGroupData[currentAgeGroup] || ageGroupData['26-35岁'];
  }, [currentAgeGroup]);

  const handleClick = () => {
    if (onClick) {
      onClick('stage-health');
    } else {
      navigate('/stage-health', { state: { ageGroup: currentAgeGroup } });
    }
  };

  return (
    <div className={`${styles.card} ${styles.gradientStage}`} onClick={handleClick}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <StageHealthIcon size={24} color={ageGroupInfo.color} />
          </div>
          <h3 className={styles.title}>{ageGroupInfo.title}</h3>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-gray-600">
          {currentAgeGroup}
        </div>
      </div>

      <div className={styles.content}>
        <div className="bg-white/40 dark:bg-black/10 p-3 rounded-xl border border-white/20">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">{ageGroupInfo.description}</p>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{ageGroupInfo.advice}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          {ageGroupInfo.tips.map((tip, index) => (
            <div key={index} className={styles.statItem}>
              <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StageHealthCard;