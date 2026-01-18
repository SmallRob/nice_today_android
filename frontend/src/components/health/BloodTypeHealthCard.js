import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext.js';

// 血型健康卡片组件
const BloodTypeHealthCard = () => {
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

  // 监听配置变化，确保血型信息始终是最新的
  useEffect(() => {
    if (currentConfig && currentConfig.bloodType && currentConfig.bloodType !== bloodType) {
      setBloodType(currentConfig.bloodType);
    }
  }, [currentConfig, bloodType]);

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
        // 3秒后隐藏成功提示
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('保存血型配置失败:', error);
      }
    }
  }, [currentConfig, updateConfig, getCurrentConfigIndex]);

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
    <div style={{
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(to bottom right, #ef4444, #ec4899, #f97316)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* 卡片头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        padding: '12px 12px 0 12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '20px' }}>{bloodTypeInfo.icon}</span>
          <h3 style={{
            fontWeight: '600',
            fontSize: '16px',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            margin: 0
          }}>血型与健康</h3>
        </div>
        
        {/* 设置按钮 */}
        <button
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            color: 'white',
            fontWeight: '500',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            flexShrink: 0
          }}
          onClick={() => setShowModal(true)}
        >
          <span>{bloodTypeInfo.title}</span>
          <span style={{ fontSize: '10px', flexShrink: 0 }}>⚙</span>
        </button>
      </div>
      
      {/* 血型信息概览 */}
      <div style={{ marginBottom: '8px', padding: '0 12px' }}>
        <div style={{
          textAlign: 'center',
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          marginBottom: '8px',
          backdropFilter: 'blur(4px)'
        }}>
          <h4 style={{
            fontWeight: '600',
            fontSize: '16px',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            margin: '0 0 4px 0'
          }}>{bloodTypeInfo.title}</h4>
          <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>{bloodTypeInfo.subtitle}</p>
        </div>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', marginBottom: '6px', lineHeight: '1.5' }}>{bloodTypeInfo.description}</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', marginBottom: '6px', lineHeight: '1.5' }}><strong>健康风险：</strong>{bloodTypeInfo.healthRisks}</p>
      </div>
      
      {/* 养生建议 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginBottom: '8px',
        padding: '0 12px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(4px)'
        }}>
          <h5 style={{ fontWeight: '600', color: 'white', marginBottom: '4px', fontSize: '12px' }}>饮食建议</h5>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{bloodTypeInfo.dietaryAdvice}</p>
        </div>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(4px)'
        }}>
          <h5 style={{ fontWeight: '600', color: 'white', marginBottom: '4px', fontSize: '12px' }}>运动建议</h5>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{bloodTypeInfo.exerciseAdvice}</p>
        </div>
      </div>
      
      {/* 生活贴士 */}
      <div style={{ marginBottom: '8px', padding: '0 12px' }}>
        <h5 style={{ fontWeight: '600', color: 'white', marginBottom: '4px', fontSize: '12px' }}>生活贴士</h5>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{bloodTypeInfo.lifestyleTips}</p>
      </div>
      
      {/* 成功提示 */}
      {saveSuccess && (
        <div style={{ marginBottom: '8px', padding: '0 12px' }}>
          <div style={{
            padding: '6px',
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            border: '1px solid rgba(74, 222, 128, 0.5)',
            borderRadius: '8px',
            color: '#bbf7d0',
            fontSize: '12px',
            backdropFilter: 'blur(4px)',
            textAlign: 'center'
          }}>
            ✅ 已保存
          </div>
        </div>
      )}
      
      {/* 查看详情链接 */}
      <div style={{ marginTop: 'auto', padding: '0 12px 12px 12px' }}>
        <Link 
          to="/blood-type-health-detail" 
          style={{
            display: 'block',
            width: '100%',
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.3))',
            color: 'white',
            textAlign: 'center',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            fontSize: '12px',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.4))';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.3))';
          }}
        >
          查看血型养生详情
        </Link>
      </div>
      
      {/* 血型选择模态框 */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '20px',
              width: '100%',
              maxWidth: '280px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', margin: 0 }}>选择血型</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {['A', 'B', 'AB', 'O'].map(type => (
                <button
                  key={type}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                    backgroundColor: getBloodTypeInfo(type).colorClass === 'bg-red-500' ? '#ef4444' :
                                   getBloodTypeInfo(type).colorClass === 'bg-blue-500' ? '#3b82f6' :
                                   getBloodTypeInfo(type).colorClass === 'bg-purple-500' ? '#a855f7' : '#22c55e'
                  }}
                  onClick={() => handleBloodTypeSelect(type)}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <div style={{ fontSize: '18px' }}>{getBloodTypeInfo(type).icon}</div>
                  <div style={{ fontSize: '12px' }}>{type}型</div>
                </button>
              ))}
            </div>
            <button
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '6px',
                fontSize: '12px',
                color: '#4b5563',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setShowModal(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodTypeHealthCard;