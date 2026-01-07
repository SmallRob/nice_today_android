import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import { getAgeGroupByAge, getAllAgeGroups } from '../constants/ageGroups';

/**
 * 年龄分析页面
 * 展示用户年龄的详细分析和生命周期阶段
 */
const AgeAnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 获取用户年龄，优先级：URL状态参数 > 用户配置 > 默认值
  const [userAge, setUserAge] = useState(() => {
    const stateAge = location.state?.userAge;
    if (currentConfig?.birthDate) {
      const today = new Date();
      const birth = new Date(currentConfig.birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return stateAge || age || 25;
    }
    return stateAge || 25;
  });

  // 生命周期阶段定义 - 使用统一的年龄组枚举
  const lifeStages = useMemo(() => getAllAgeGroups(), []);

  // 获取当前生命周期阶段
  const currentLifeStage = useMemo(() => {
    return lifeStages.find(stage => {
      const [min, max] = stage.range.split('-').map(str => parseInt(str.replace('岁+', '')));
      if (stage.range.includes('+')) {
        return userAge >= min;
      }
      return userAge >= min && userAge <= max;
    }) || lifeStages[lifeStages.length - 1];
  }, [userAge, lifeStages]);

  // 年龄阶段分析
  const ageAnalysis = useMemo(() => {
    const analysis = {
      title: '',
      description: '',
      keyPoints: [],
      suggestions: []
    };

    if (userAge < 18) {
      analysis.title = '成长与学习阶段';
      analysis.description = '这是人生中最重要的学习和发展阶段，注重基础教育和性格培养。';
      analysis.keyPoints = [
        '身体和智力快速发育期',
        '学习能力和记忆力最佳',
        '性格和价值观形成期',
        '需要良好的家庭和社会环境'
      ];
      analysis.suggestions = [
        '注重基础教育质量',
        '培养良好的学习习惯',
        '发展兴趣爱好',
        '建立正确的价值观'
      ];
    } else if (userAge < 30) {
      analysis.title = '探索与建立阶段';
      analysis.description = '这是人生的重要转折点，需要确定职业方向和生活目标。';
      analysis.keyPoints = [
        '职业发展的黄金期',
        '人际关系建立期',
        '经济独立和责任感增强',
        '学习能力和适应力强'
      ];
      analysis.suggestions = [
        '明确职业发展方向',
        '建立稳定的人际关系',
        '培养理财意识',
        '注重个人成长'
      ];
    } else if (userAge < 45) {
      analysis.title = '稳定与发展阶段';
      analysis.description = '事业和家庭进入稳定期，需要平衡工作和生活。';
      analysis.keyPoints = [
        '事业和家庭的稳定期',
        '经验积累和技能提升',
        '责任和压力增加',
        '身体健康需要关注'
      ];
      analysis.suggestions = [
        '注重工作生活平衡',
        '关注身体健康',
        '继续学习和提升',
        '规划未来生活'
      ];
    } else if (userAge < 60) {
      analysis.title = '成熟与智慧阶段';
      analysis.description = '人生经验丰富，需要传承智慧和享受生活。';
      analysis.keyPoints = [
        '经验和智慧积累期',
        '事业成就和影响力',
        '健康和精力需要维护',
        '家庭和社会责任'
      ];
      analysis.suggestions = [
        '注重健康管理',
        '传承经验和智慧',
        '享受生活乐趣',
        '规划退休生活'
      ];
    } else {
      analysis.title = '智慧与传承阶段';
      analysis.description = '享受晚年生活，传承人生智慧，关注身心健康。';
      analysis.keyPoints = [
        '人生智慧沉淀期',
        '家庭和社会影响力',
        '健康和养生关键期',
        '精神生活丰富'
      ];
      analysis.suggestions = [
        '注重身心保健',
        '享受天伦之乐',
        '传承人生经验',
        '保持积极心态'
      ];
    }

    return analysis;
  }, [userAge]);

  // 获取里程碑描述（必须在使用前声明）
  const getMilestoneDescription = (age) => {
    const descriptions = {
      18: '成年，获得完全民事行为能力',
      22: '大学毕业，进入职场',
      25: '职业发展关键期',
      30: '而立之年，事业和家庭的重要节点',
      35: '事业稳定期，家庭责任增加',
      40: '不惑之年，人生经验丰富',
      45: '事业巅峰期，经验和智慧成熟',
      50: '知天命之年，人生格局形成',
      55: '准备退休，享受生活',
      60: '花甲之年，正式退休',
      65: '智慧沉淀，安享晚年',
      70: '古稀之年，健康成为重点',
      75: '从心所欲，享受人生',
      80: '耄耋之年，福寿安康'
    };
    return descriptions[age] || '人生的重要阶段';
  };

  // 里程碑事件（基于年龄）
  const milestones = useMemo(() => {
    const milestones = [];
    
    // 重要的里程碑年龄
    const milestoneAges = [18, 22, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    
    milestoneAges.forEach(age => {
      if (userAge < age) {
        milestones.push({
          age,
          title: `即将迎来${age}岁`,
          description: getMilestoneDescription(age),
          status: 'future'
        });
      } else if (userAge === age) {
        milestones.push({
          age,
          title: `当前${age}岁`,
          description: getMilestoneDescription(age),
          status: 'current'
        });
      } else {
        milestones.push({
          age,
          title: `已过${age}岁`,
          description: getMilestoneDescription(age),
          status: 'past'
        });
      }
    });

    return milestones;
  }, [userAge]);

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white sticky top-0 z-40 shadow-lg" style={{ height: '60px' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center h-full">
            <h1 className="text-lg font-bold text-center" style={{ fontSize: '16px' }}>年龄分析</h1>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 年龄卡片 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-4 mb-6">
          <div className="text-center mb-2">
            <div className="text-5xl mb-2">🎂</div>
            <h2 className="text-2xl font-bold mb-1">{userAge}岁</h2>
            <div className="text-base opacity-90">
              {currentLifeStage.stage} - {currentLifeStage.range}
            </div>
          </div>
          <p className="text-center opacity-90 text-sm">
            {currentLifeStage.description}
          </p>
        </div>

        {/* 生命周期进度条 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📊</span> 生命周期进度
          </h3>
          <div className="relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                style={{ width: `${Math.min(100, (userAge / 80) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0岁</span>
              <span>40岁</span>
              <span>80岁+</span>
            </div>
          </div>
        </div>

        {/* 年龄阶段分析 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">🌟</span> {ageAnalysis.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm">
            {ageAnalysis.description}
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-green-500 mr-2">✓</span> 关键特征
              </h4>
              <ul className="space-y-2">
                {ageAnalysis.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-200">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-blue-500 mr-2">💡</span> 建议与规划
              </h4>
              <ul className="space-y-2">
                {ageAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-gray-200">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 人生里程碑 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">🎯</span> 人生里程碑
          </h3>
          <div className="space-y-3">
            {milestones.slice(0, 8).map((milestone, index) => (
              <div
                key={milestone.age}
                className={`flex items-center p-3 rounded-lg transition-all ${
                  milestone.status === 'current'
                    ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500'
                    : milestone.status === 'past'
                    ? 'bg-gray-100 dark:bg-gray-700/50'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  {milestone.status === 'current' ? (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                  ) : milestone.status === 'past' ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-bold text-xs">?</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    milestone.status === 'current'
                      ? 'text-blue-600 dark:text-blue-400'
                      : milestone.status === 'past'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 生命周期阶段概览 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🔍</span> 生命周期阶段概览
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {lifeStages.map((stage, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                  stage.range === currentLifeStage.range
                    ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => {
                  const [minAge] = stage.range.split('-').map(str => parseInt(str.replace('岁+', '')));
                  setUserAge(minAge === 80 ? 80 : minAge + 5); // 设置为年龄段中间的年龄
                }}
              >
                <div className="text-lg font-bold mb-1">{stage.range}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{stage.stage}</div>
                <div className="w-4 h-1 mx-auto rounded-full" style={{ backgroundColor: stage.color }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeAnalysisPage;