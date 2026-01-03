import React, { useState, useEffect } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { useNavigate } from 'react-router-dom';

// 当季养生健康提醒卡片组件
const SeasonalHealthCard = ({ onClick }) => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  const [seasonData, setSeasonData] = useState(null);

  // 获取当前季节信息
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) {
      return { 
        name: '春', 
        element: '木', 
        organ: '肝', 
        desc: '生发之气，养肝为先',
        color: 'from-green-400 to-emerald-500',
        tips: [
          '早睡早起，春捂秋冻',
          '多食绿色蔬菜、芽苗类',
          '适度运动，疏肝理气',
          '保持心情舒畅，避免暴怒'
        ],
        foods: ['韭菜', '菠菜', '豆芽', '香椿', '蜂蜜', '大枣'],
        activities: ['踏青', '放风筝', '散步', '太极拳']
      };
    } else if (month >= 6 && month <= 8) {
      return { 
        name: '夏', 
        element: '火', 
        organ: '心', 
        desc: '生长之气，养心为要',
        color: 'from-red-400 to-orange-500',
        tips: [
          '晚睡早起，适当午休',
          '多食苦味食物，清热解暑',
          '适度运动，避免大汗',
          '保持心境平和，避免烦躁'
        ],
        foods: ['苦瓜', '冬瓜', '丝瓜', '绿豆', '莲子', '百合'],
        activities: ['游泳', '晨练', '太极', '散步']
      };
    } else if (month >= 9 && month <= 11) {
      return { 
        name: '秋', 
        element: '金', 
        organ: '肺', 
        desc: '收敛之气，养肺为主',
        color: 'from-yellow-400 to-amber-500',
        tips: [
          '早睡早起，收敛神气',
          '多食滋阴润燥食物',
          '适度运动，增强体质',
          '保持内心平静，避免悲伤'
        ],
        foods: ['梨', '银耳', '百合', '蜂蜜', '白萝卜', '莲藕'],
        activities: ['登山', '慢跑', '太极', '气功']
      };
    } else {
      return { 
        name: '冬', 
        element: '水', 
        organ: '肾', 
        desc: '收藏之气，养肾为本',
        color: 'from-blue-400 to-indigo-500',
        tips: [
          '早睡晚起，避寒就温',
          '多食温热滋补食物',
          '适度运动，不宜过汗',
          '保持精神内守，避免惊恐'
        ],
        foods: ['羊肉', '牛肉', '黑豆', '黑芝麻', '核桃', '枸杞'],
        activities: ['太极拳', '八段锦', '散步', '气功']
      };
    }
  };

  // 根据用户年龄和性别获取个性化建议
  const getPersonalizedAdvice = () => {
    if (!userConfig?.birthDate) {
      return "根据季节特点，调整养生重点";
    }

    const birthDate = new Date(userConfig.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const gender = userConfig.gender;

    let advice = "";
    
    if (age < 30) {
      advice = gender === 'female' 
        ? "年轻女性应注重肝血调养，顺应春季生发之气" 
        : "年轻男性应注重肾精养护，避免过度消耗";
    } else if (age < 50) {
      advice = gender === 'female' 
        ? "中年女性应关注气血平衡，注意情绪调节" 
        : "中年男性应注重脾胃养护，避免过度劳累";
    } else {
      advice = gender === 'female' 
        ? "中老年女性应注重滋阴养血，保持心态平和" 
        : "中老年男性应注重补肾固精，适度运动";
    }

    return advice;
  };

  useEffect(() => {
    setSeasonData(getCurrentSeason());
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/wuxing-health');
    }
  };

  if (!seasonData) {
    return (
      <div className="health-card seasonal-health-card">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="health-card seasonal-health-card"
      onClick={handleClick}
    >
      <div className={`bg-gradient-to-r ${seasonData.color} p-4 rounded-2xl text-white shadow-lg h-full`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl">
            {seasonData.name === '春' && '🌸'}
            {seasonData.name === '夏' && '☀️'}
            {seasonData.name === '秋' && '🍂'}
            {seasonData.name === '冬' && '❄️'}
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg">{seasonData.name}季养生</h3>
            <p className="text-sm opacity-90">{seasonData.desc}</p>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm opacity-80 mb-2">五行：{seasonData.element}行</p>
          <p className="text-sm opacity-80 mb-2">养护脏腑：{seasonData.organ}</p>
        </div>

        {/* 季节养生小贴士 */}
        <div className="mb-3">
          <p className="text-xs font-medium opacity-90 mb-1">养生要点：</p>
          <div className="space-y-1">
            {seasonData.tips.slice(0, 2).map((tip, index) => (
              <div key={index} className="text-xs opacity-75 flex items-center">
                <span className="mr-1">•</span>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* 个性化建议 */}
        <div className="mb-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs font-medium opacity-90 mb-1">个人建议：</p>
          <p className="text-xs opacity-75">{getPersonalizedAdvice()}</p>
        </div>

        {/* 五行关系提示 */}
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs opacity-75">
            {seasonData.name}季与{seasonData.element}行相应，{seasonData.organ}气渐旺，宜顺应自然调养身心
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalHealthCard;