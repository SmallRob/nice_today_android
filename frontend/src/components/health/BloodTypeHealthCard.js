import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext.js';

// 血型健康卡片组件
const BloodTypeHealthCard = () => {
  const { currentConfig, updateConfig, getCurrentConfigIndex } = useUserConfig();
  const [bloodType, setBloodType] = useState('A');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 从用户配置加载血型
  useEffect(() => {
    if (currentConfig && currentConfig.bloodType) {
      setBloodType(currentConfig.bloodType);
    }
  }, [currentConfig]);

  // 监听配置变化，确保血型信息始终是最新的
  useEffect(() => {
    if (currentConfig && currentConfig.bloodType && currentConfig.bloodType !== bloodType) {
      setBloodType(currentConfig.bloodType);
    }
  }, [currentConfig, bloodType]);

  // 处理血型选择
  const handleBloodTypeSelect = useCallback(async (selectedType) => {
    setBloodType(selectedType);
    setIsEditing(false);
    
    // 自动保存选择的血型
    if (currentConfig) {
      setLoading(true);
      try {
        const currentIndex = getCurrentConfigIndex();
        await updateConfig(currentIndex, { bloodType: selectedType });
        setSaveSuccess(true);
        // 3秒后隐藏成功提示
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('自动保存血型配置失败:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [currentConfig, updateConfig, getCurrentConfigIndex]);

  // 保存血型配置
  const handleSaveBloodType = useCallback(async () => {
    if (!currentConfig) return;
    
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      // 获取当前活跃配置的索引并更新配置
      const currentIndex = getCurrentConfigIndex();
      const success = await updateConfig(currentIndex, { bloodType });
      
      if (success) {
        setSaveSuccess(true);
        // 3秒后隐藏成功提示
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('保存血型配置失败:', error);
    } finally {
      setLoading(false);
    }
  }, [bloodType, currentConfig, updateConfig, getCurrentConfigIndex]);

  // 获取当前血型的健康信息
  const getBloodTypeInfo = useCallback((type) => {
    const infoMap = {
      'A': {
        title: 'A型血',
        subtitle: '完美的悲观主义者',
        description: 'A型血的人通常是社会秩序的维护者，做事有条不紊，注重细节，责任感强，但容易焦虑。',
        healthRisks: '注意消化与心血管健康，血液黏稠度较高，易形成血栓；胃酸分泌较少，消化能力较弱。',
        dietaryAdvice: '多吃素食和新鲜鱼类，少吃乳制品和肉类。',
        exerciseAdvice: '适合舒缓运动：瑜伽、太极拳、慢跑。',
        lifestyleTips: '凡事不要追求100分，学会"放过自己"，减少焦虑情绪是养生的关键。',
        colorClass: 'bg-red-500',
        icon: '🅰️'
      },
      'B': {
        title: 'B型血',
        subtitle: '乐天的自由派',
        description: 'B型血的人最不受规则束缚，思维跳跃，兴趣广泛，乐观随性，但缺乏耐心。',
        healthRisks: '注意免疫与代谢，容易发生肺部感染、尿路感染；对乳制品代谢可能稍差。',
        dietaryAdvice: 'B型血是"杂食者"，但要注意避免发炎性食物；少吃玉米、荞麦、芝麻。',
        exerciseAdvice: '适合中高强度运动：网球、登山、骑自行车、游泳。',
        lifestyleTips: '建立固定的作息时间，避免过度疲劳导致免疫力下降。',
        colorClass: 'bg-blue-500',
        icon: '🅱️'
      },
      'AB': {
        title: 'AB型血',
        subtitle: '矛盾的理性家',
        description: 'AB型拥有A的细致和B的开放，性格复杂多变，理性冷静，但有时显得疏离高冷。',
        healthRisks: '注意认知与呼吸，对病毒比较敏感，容易患呼吸系统疾病；血管容易产生炎症。',
        dietaryAdvice: '适合混合饮食，控制分量；多吃深海鱼、豆腐、绿色蔬菜；少吃高胆固醇食物。',
        exerciseAdvice: '需要身心结合的运动：高尔夫、快走、冥想。',
        lifestyleTips: '保持充足的睡眠对大脑健康至关重要，预防记忆力衰退。',
        colorClass: 'bg-purple-500',
        icon: '🆎'
      },
      'O': {
        title: 'O型血',
        subtitle: '行动的领导者',
        description: 'O型血是天生的行动派，目标感极强，自信热情，意志坚定，但有时显得霸道粗心。',
        healthRisks: '注意出血与炎症，血液最稀不易凝固，出血风险大；甲状腺功能容易不稳定。',
        dietaryAdvice: '胃酸多，消化肉能力强，需要高蛋白饮食；多吃瘦肉、鱼、肝脏；少吃谷物、乳制品。',
        exerciseAdvice: '必须通过高强度运动释放压力：有氧健身、长跑、拳击、武术。',
        lifestyleTips: '学会深呼吸，控制急躁情绪；定期检查胃部，预防溃疡。',
        colorClass: 'bg-green-500',
        icon: '⭕'
      }
    };
    
    return infoMap[type] || infoMap['A'];
  }, []);

  const bloodTypeInfo = getBloodTypeInfo(bloodType);

  return (
    <div className="blood-type-health-card rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/10 to-white/20 backdrop-blur-sm border border-white/20">
      {/* 卡片头部 */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{bloodTypeInfo.icon}</span>
          <h3 className="text-lg font-bold text-white">血型与健康</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 血型选择器 */}
          <div className="relative">
            <button
              className={`px-3 py-1 rounded-full text-white font-medium ${bloodTypeInfo.colorClass} hover:opacity-90 transition-opacity flex items-center space-x-1`}
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              <span>{bloodTypeInfo.title}</span>
              <span className="text-xs">▼</span>
            </button>
            
            {/* 移动端友好的模态选择器 */}
            {isEditing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">选择血型</h3>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['A', 'B', 'AB', 'O'].map(type => (
                      <button
                        key={type}
                        className={`p-3 rounded-lg text-center text-white font-medium ${getBloodTypeInfo(type).colorClass} hover:opacity-90 transition-opacity`}
                        onClick={() => handleBloodTypeSelect(type)}
                      >
                        <div className="text-lg">{getBloodTypeInfo(type).icon}</div>
                        <div>{type}型</div>
                      </button>
                    ))}
                  </div>
                  <button
                    className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsEditing(false)}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 保存按钮 */}
          <button
            className={`px-3 py-1 rounded-full text-white font-medium ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            onClick={handleSaveBloodType}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
      
      {/* 血型信息概览 */}
      <div className="mb-4">
        <div className={`text-center p-3 rounded-lg ${bloodTypeInfo.colorClass} text-white mb-3`}>
          <h4 className="text-xl font-bold">{bloodTypeInfo.title}</h4>
          <p className="text-sm opacity-90">{bloodTypeInfo.subtitle}</p>
        </div>
        
        <p className="text-white/80 mb-2">{bloodTypeInfo.description}</p>
        <p className="text-white/80 mb-2"><strong>健康风险：</strong>{bloodTypeInfo.healthRisks}</p>
      </div>
      
      {/* 养生建议 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
          <h5 className="font-semibold text-white mb-1">饮食建议</h5>
          <p className="text-white/80 text-sm">{bloodTypeInfo.dietaryAdvice}</p>
        </div>
        
        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
          <h5 className="font-semibold text-white mb-1">运动建议</h5>
          <p className="text-white/80 text-sm">{bloodTypeInfo.exerciseAdvice}</p>
        </div>
      </div>
      
      {/* 生活贴士 */}
      <div className="mb-4">
        <h5 className="font-semibold text-white mb-1">生活贴士</h5>
        <p className="text-white/80 text-sm">{bloodTypeInfo.lifestyleTips}</p>
      </div>
      
      {/* 成功提示 */}
      {saveSuccess && (
        <div className="mb-3 p-2 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-sm">
          ✅ 血型配置已保存
        </div>
      )}
      
      {/* 查看详情链接 */}
      <div className="mt-2">
        <Link 
          to="/blood-type-health-detail" 
          className="w-full bg-gradient-to-r from-white/30 to-white/40 text-white text-center py-1.5 px-3 rounded-lg hover:from-white/40 hover:to-white/50 transition-all duration-300 backdrop-blur-sm border border-white/30 text-sm block"
        >
          查看血型养生详情
        </Link>
      </div>
    </div>
  );
};

export default BloodTypeHealthCard;