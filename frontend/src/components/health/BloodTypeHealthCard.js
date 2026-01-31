import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { BloodTypeIcon } from '../icons';
import styles from './HealthCard.module.css';

// 血型健康卡片组件
const BloodTypeHealthCard = ({ onClick }) => {
  const { currentConfig, updateConfig, getCurrentConfigIndex } = useUserConfig();
  const [bloodType, setBloodType] = useState('A');
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 从用户配置加载血型
  useEffect(() => {
    if (currentConfig && currentConfig.bloodType) {
      setBloodType(currentConfig.bloodType);
    }
  }, [currentConfig]);

  // 处理血型选择并立即保存
  const handleBloodTypeSelect = useCallback(async (selectedType) => {
    setBloodType(selectedType);
    setShowModal(false);

    // 立即保存选择的血型
    if (currentConfig) {
      try {
        const currentIndex = getCurrentConfigIndex();
        await updateConfig(currentIndex, { bloodType: selectedType });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('保存血型配置失败:', error);
      }
    }
  }, [currentConfig, updateConfig, getCurrentConfigIndex]);

  // 获取当前血型的健康信息
  const bloodTypeInfo = useMemo(() => {
    const infoMap = {
      'A': {
        title: 'A型血',
        subtitle: '完美的悲观主义者',
        description: 'A型血的人通常是社会秩序的维护者，注重细节。',
        healthRisks: '注意消化与心血管健康，血液黏稠度较高。',
        dietaryAdvice: '多吃素食和新鲜鱼类',
        exerciseAdvice: '舒缓运动：瑜伽、太极',
        colorClass: 'bg-red-500',
        icon: '🅰️'
      },
      'B': {
        title: 'B型血',
        subtitle: '乐天的自由派',
        description: 'B型血的人最不受规则束缚，思维跳跃。',
        healthRisks: '注意免疫与代谢，容易发生肺部感染。',
        dietaryAdvice: '避免发炎性食物',
        exerciseAdvice: '中强度：网球、登山',
        colorClass: 'bg-blue-500',
        icon: '🅱️'
      },
      'AB': {
        title: 'AB型血',
        subtitle: '矛盾的理性家',
        description: 'AB型拥有A的细致和B的开放，性格复杂多变。',
        healthRisks: '注意认知与呼吸，对病毒比较敏感。',
        dietaryAdvice: '混合饮食，控制分量',
        exerciseAdvice: '身心结合：高尔夫、快走',
        colorClass: 'bg-purple-500',
        icon: '🆎'
      },
      'O': {
        title: 'O型血',
        subtitle: '行动的领导者',
        description: 'O型血是天生的行动派，目标感极强。',
        healthRisks: '注意出血与炎症，甲状腺功能容易不稳定。',
        dietaryAdvice: '高蛋白饮食，少吃谷物',
        exerciseAdvice: '高强度：有氧健身、长跑',
        colorClass: 'bg-green-500',
        icon: '⭕'
      }
    };
    return infoMap[bloodType] || infoMap['A'];
  }, [bloodType]);

  const handleClick = () => {
    if (onClick) {
      onClick('blood-type-health');
    }
  };

  return (
    <div className={`${styles.card} ${styles.gradientBlood}`} onClick={handleClick}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <BloodTypeIcon size={24} color="#dc2626" />
          </div>
          <div className="ml-2">
            <h3 className={styles.title} style={{ margin: 0 }}>血型与健康</h3>
            <p className="text-[10px] opacity-70 mt-0.5">{bloodTypeInfo.subtitle}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 text-gray-600 hover:bg-white/80 transition-colors"
        >
          {bloodType}型血 ▾
        </button>
      </div>

      <div className={styles.content}>
        <div className="bg-white/40 dark:bg-black/10 p-2.5 rounded-xl border border-white/20">
          <p className="text-[11px] text-gray-700 dark:text-gray-200 leading-tight mb-1">
            {bloodTypeInfo.description}
          </p>
          <p className="text-[10px] text-red-800/80 dark:text-red-300/80 leading-tight">
            ⚠️ {bloodTypeInfo.healthRisks}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className={styles.statItem}>
            <div className="text-[10px] font-bold text-gray-500 mb-1">饮食建议</div>
            <p className="text-[10px] text-gray-800 dark:text-gray-200 leading-tight">{bloodTypeInfo.dietaryAdvice}</p>
          </div>
          <div className={styles.statItem}>
            <div className="text-[10px] font-bold text-gray-500 mb-1">运动建议</div>
            <p className="text-[10px] text-gray-800 dark:text-gray-200 leading-tight">{bloodTypeInfo.exerciseAdvice}</p>
          </div>
        </div>
      </div>

      {/* 血型选择模态框 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl p-4 w-full max-w-[280px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">选择血型</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['A', 'B', 'AB', 'O'].map(type => (
                <button
                  key={type}
                  className={`p-2 rounded-lg text-center text-white text-sm font-medium transition-opacity ${
                    type === 'A' ? 'bg-red-500' : type === 'B' ? 'bg-blue-500' : type === 'AB' ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                  onClick={() => handleBloodTypeSelect(type)}
                >
                  {type}型
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodTypeHealthCard;