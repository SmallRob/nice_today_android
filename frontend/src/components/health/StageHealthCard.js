import React from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { useNavigate } from 'react-router-dom';
import { getAgeGroupByAge } from '../../constants/ageGroups.js';

// 阶段养生提醒卡片组件
const StageHealthCard = ({ onClick }) => {
  const { userConfig } = useUserConfig();
  const navigate = useNavigate();
  
  // 从本地存储获取用户设置的缓存超时时间
  const getUserCacheTimeout = () => {
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    return savedCacheTimeout ? parseInt(savedCacheTimeout) : 10800000; // 默认3小时
  };

  // 生成缓存键
  const getCacheKey = () => {
    const today = new Date().toDateString();
    return `stage-health-${today}`;
  };

  // 检查缓存
  const getCachedData = () => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();
        const currentDate = new Date().toDateString();
        
        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        
        // 检查缓存是否超时
        const cacheTimeout = getUserCacheTimeout();
        if (now - timestamp < cacheTimeout) {
          return data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 设置缓存
  const setCachedData = (data) => {
    try {
      const cacheKey = getCacheKey();
      const currentDate = new Date().toDateString();
      const cacheData = {
        data,
        timestamp: Date.now(),
        date: currentDate  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('设置缓存失败:', e);
    }
  };

  // 计算用户年龄段
  const getUserAgeGroup = () => {
    if (!userConfig?.birthDate) return 'unknown';
    
    const birthDate = new Date(userConfig.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // 使用统一的年龄组枚举
    const ageGroup = getAgeGroupByAge(age);
    return ageGroup.range;
  };

  // 获取年龄段对应的养生信息
  const getAgeGroupInfo = (ageGroup) => {
    const ageGroupData = {
      '0-5岁': {
        title: '婴幼儿养生',
        description: '生长发育关键期',
        advice: '注重营养均衡，保证充足睡眠，促进大脑发育',
        icon: '👶',
        color: 'from-pink-400 to-rose-500',
        tips: [
          '保证充足母乳或配方奶',
          '定期进行生长发育检查',
          '创造安全的活动环境',
          '培养良好作息习惯'
        ],
        specialConsiderations: '关注疫苗接种，预防常见婴幼儿疾病'
      },
      '6-12岁': {
        title: '儿童养生',
        description: '身心发展重要阶段',
        advice: '五行"木"主生发，侧重肝胆养护，培养良好生活习惯',
        icon: '🧒',
        color: 'from-orange-400 to-amber-500',
        tips: [
          '保证每天1小时户外活动',
          '均衡饮食，避免挑食',
          '培养学习兴趣和良好习惯',
          '注意视力保护'
        ],
        specialConsiderations: '关注骨骼发育，预防儿童肥胖'
      },
      '13-17岁': {
        title: '青少年养生',
        description: '青春期发育关键期',
        advice: '五行"火"主生长，侧重心脏养护，保持情绪稳定',
        icon: '🧑',
        color: 'from-red-400 to-orange-500',
        tips: [
          '保证充足睡眠，避免熬夜',
          '均衡营养，支持身体发育',
          '适度运动，增强体质',
          '培养良好心理素质'
        ],
        specialConsiderations: '关注心理健康，正确处理学业压力'
      },
      '18-25岁': {
        title: '青年养生',
        description: '代谢调理、作息规律',
        advice: '五行"木"主生发，侧重肝胆养护，避免熬夜耗肝血',
        icon: '🌱',
        color: 'from-green-400 to-emerald-500',
        tips: [
          '保持规律作息，避免熬夜',
          '适度运动，增强体质',
          '饮食清淡，避免辛辣刺激'
        ],
        specialConsiderations: userConfig?.gender === 'female' 
          ? '关注月经周期，保持情绪稳定' 
          : '避免过度疲劳，注意肝胆养护'
      },
      '26-35岁': {
        title: '青年中期养生',
        description: '事业起步，家庭建立',
        advice: '五行"火"主发展，侧重心脏养护，平衡工作与生活',
        icon: '💼',
        color: 'from-blue-400 to-indigo-500',
        tips: [
          '调节工作压力，保持心态平和',
          '规律运动，增强免疫力',
          '注意饮食营养均衡',
          '建立稳定人际关系'
        ],
        specialConsiderations: userConfig?.gender === 'female' 
          ? '关注生育健康，做好孕前准备' 
          : '注意肾气养护，避免过度劳累'
      },
      '36-45岁': {
        title: '中年早期养生',
        description: '事业稳定，家庭责任增加',
        advice: '五行"土"主稳定，侧重脾胃养护，注重脏腑调理',
        icon: '👨‍👩‍👧‍👦',
        color: 'from-teal-400 to-cyan-500',
        tips: [
          '注重工作生活平衡',
          '定期体检，预防慢性病',
          '适度运动，保持关节灵活',
          '关注家庭成员健康'
        ],
        specialConsiderations: userConfig?.gender === 'female' 
          ? '关注更年期前期症状，适当调理' 
          : '关注心血管健康，预防"三高"'
      },
      '46-55岁': {
        title: '中年中期养生',
        description: '经验丰富，人生智慧积累',
        advice: '五行"金"主收敛，侧重肺脏养护，注重精气神调养',
        icon: '🌿',
        color: 'from-yellow-400 to-amber-500',
        tips: [
          '注重脏腑功能调理',
          '定期体检，预防慢性病',
          '适度运动，保持关节灵活',
          '培养兴趣爱好，保持精神愉悦'
        ],
        specialConsiderations: userConfig?.gender === 'female' 
          ? '更年期注意情绪调节，适当补充雌激素' 
          : '关注前列腺健康，定期检查'
      },
      '56-65岁': {
        title: '中年晚期养生',
        description: '准备退休，享受生活',
        advice: '五行"土"主运化，侧重脾胃，辅以经络按摩',
        icon: '🍃',
        color: 'from-orange-400 to-red-500',
        tips: [
          '养护脾胃，饮食易消化',
          '经络按摩，促进血液循环',
          '适度活动，保持关节灵活',
          '保持社交活动，预防孤独'
        ],
        specialConsiderations: '注意保暖，避免受寒，适当进补'
      },
      '66岁+': {
        title: '老年养生',
        description: '智慧传承，安享晚年',
        advice: '五行"水"主藏，侧重肾阴肾阳平衡，减少耗损',
        icon: '🪷',
        color: 'from-purple-400 to-pink-500',
        tips: [
          '静养为主，避免过度劳累',
          '适当补充气血',
          '保持心情平和',
          '注重安全，预防跌倒'
        ],
        specialConsiderations: '定期健康监测，及时就医，享受天伦之乐'
      }
    };
    
    return ageGroupData[ageGroup] || ageGroupData['26-35岁'];
  };

  const currentAgeGroup = getUserAgeGroup();
  const ageGroupInfo = getAgeGroupInfo(currentAgeGroup);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/stage-health', { state: { ageGroup: currentAgeGroup } });
    }
  };

  return (
    <div 
      className="health-card stage-health-card"
      onClick={handleClick}
    >
      <div className={`bg-gradient-to-r ${ageGroupInfo.color} p-4 rounded-2xl text-white shadow-lg h-full`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl">{ageGroupInfo.icon}</div>
          <div className="text-right">
            <h3 className="font-bold text-lg">{ageGroupInfo.title}</h3>
            <p className="text-sm opacity-90">{ageGroupInfo.description}</p>
          </div>
        </div>
        <p className="text-sm opacity-80 mb-3">{ageGroupInfo.advice}</p>
        <div className="space-y-1">
          {ageGroupInfo.tips.map((tip, index) => (
            <div key={index} className="text-xs opacity-75 flex items-center">
              <span className="mr-1">•</span>
              {tip}
            </div>
          ))}
        </div>
        {ageGroupInfo.specialConsiderations && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-30">
            <p className="text-xs opacity-75">
              <span className="font-medium">特别提醒:</span> {ageGroupInfo.specialConsiderations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageHealthCard;