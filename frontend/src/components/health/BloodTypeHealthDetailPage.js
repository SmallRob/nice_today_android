import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { ArrowLeftIcon, BloodTypeIcon } from '../icons';
import './BloodTypeHealthDetailPage.css';

const BloodTypeHealthDetailPage = () => {
  const navigate = useNavigate();
  const { currentConfig } = useUserConfig();
  const [selectedBloodType, setSelectedBloodType] = useState('A');
  // 从用户配置加载血型
  useEffect(() => {
    if (currentConfig && currentConfig.bloodType) {
      setSelectedBloodType(currentConfig.bloodType);
    }
  }, [currentConfig]);
  // 完整的血型健康信息
  const bloodTypeInfo = {
    'A': {
      title: 'A型血',
      subtitle: '完美的悲观主义者',
      icon: '🅰️',
      colorClass: 'bg-red-500',
      personality: {
        title: '性格特征',
        description: 'A型血的人通常是社会秩序的维护者。他们做事有条不紊，注重细节，非常在意周围人的看法。因为想得太多，容易精神紧张，是典型的"操心命"。他们在团队合作中很可靠，但有时因过于固执而不够灵活。',
        keywords: ['谨慎', '完美主义', '细心', '责任感强', '易焦虑']
      },
      healthRisks: {
        title: '健康风险',
        description: '注意消化与心血管健康，血液黏稠度较高，容易形成血栓；胃酸分泌较少，消化能力较弱。',
        medicalStats: 'A型血人群患胃癌、食道癌的风险相对较高（这与幽门螺杆菌感染率有关），同时也更容易受到心血管疾病的困扰。'
      },
      diet: {
        title: '饮食建议',
        description: '你的消化系统比较"娇气"，多吃素食和新鲜鱼类。',
        recommendations: [
          '多吃素食和新鲜鱼类',
          '少吃乳制品和肉类（尤其是肥肉）',
          '代谢脂肪较慢，注意控制油脂摄入'
        ],
        avoid: ['乳制品', '肥肉', '油炸食品']
      },
      exercise: {
        title: '运动建议',
        description: '不适合过于激烈的竞技运动，容易导致皮质醇（压力激素）升高。',
        recommendations: [
          '瑜伽 - 舒缓压力，调节内分泌',
          '太极拳 - 平衡身心，增强柔韧性',
          '慢跑 - 有氧运动，改善心血管功能'
        ]
      },
      lifestyle: {
        title: '生活贴士',
        description: '凡事不要追求100分，学会"放过自己"，减少焦虑情绪是养生的关键。',
        tips: [
          '建立规律的作息时间',
          '学习放松技巧，如冥想和深呼吸',
          '避免过度劳累和精神紧张',
          '培养兴趣爱好，分散注意力'
        ]
      }
    },
    'B': {
      title: 'B型血',
      subtitle: '乐天的自由派',
      icon: '🅱️',
      colorClass: 'bg-blue-500',
      personality: {
        title: '性格特征',
        description: 'B型血的人最不受规则束缚，他们思维跳跃，兴趣广泛但三分钟热度。他们心大，不容易生气，也不太在意别人的评价。在人际交往中显得有些自我，但因其真诚和幽默，往往人缘不错。',
        keywords: ['乐观', '随性', '创造力强', '我行我素', '缺乏耐心']
      },
      healthRisks: {
        title: '健康风险',
        description: '注意免疫与代谢，容易发生肺部感染、尿路感染。此外，B型血对乳制品的代谢可能稍差，且容易患龋齿。',
        medicalStats: '患结核病、乳腺癌的风险在某些统计中略高于其他血型。'
      },
      diet: {
        title: '饮食建议',
        description: 'B型血是"杂食者"，适应能力最强，但要注意避免发炎性食物。',
        recommendations: [
          '均衡饮食，多样化摄入',
          '少食多餐，避免暴饮暴食',
          '适量摄入乳制品'
        ],
        avoid: ['玉米', '荞麦', '芝麻', '发炎性食物']
      },
      exercise: {
        title: '运动建议',
        description: '身体耐力好，适合中高强度的运动。',
        recommendations: [
          '网球 - 全身运动，提高协调性',
          '登山 - 增强心肺功能，亲近自然',
          '骑自行车 - 有氧运动，保护关节',
          '游泳 - 全身锻炼，减轻压力'
        ]
      },
      lifestyle: {
        title: '生活贴士',
        description: 'B型血容易随心所欲，生活节奏不规律。建议建立固定的作息时间，避免过度疲劳导致免疫力下降。',
        tips: [
          '建立固定的作息时间表',
          '制定短期目标，避免三分钟热度',
          '定期体检，关注免疫系统健康',
          '培养长期坚持的习惯'
        ]
      }
    },
    'AB': {
      title: 'AB型血',
      subtitle: '矛盾的理性家',
      icon: '🆎',
      colorClass: 'bg-purple-500',
      personality: {
        title: '性格特征',
        description: 'AB型拥有A的细致和B的开放，这两种特质在体内打架，导致他们性格复杂多变。他们看起来很平和，实际上内心有一道很深的防线。他们擅长分析，批判性思维强，但有时给人感觉比较疏离、高冷。',
        keywords: ['理性', '冷静', '多面', '挑剔', '忽冷忽热']
      },
      healthRisks: {
        title: '健康风险',
        description: '注意认知与呼吸，对病毒比较敏感，容易患呼吸系统疾病；血管容易产生炎症。',
        medicalStats: '研究表明，AB型血的老人在晚年出现记忆力衰退、认知障碍（老年痴呆）的风险比其他血型略高。'
      },
      diet: {
        title: '饮食建议',
        description: '适合混合饮食，但要控制分量。',
        recommendations: [
          '多吃深海鱼（富含Omega-3，保护心脑血管）',
          '适量摄入豆腐和豆制品',
          '多吃绿色蔬菜（护肝排毒）',
          '控制饮食分量'
        ],
        avoid: ['高胆固醇食物', '烟熏肉类', '咖啡因']
      },
      exercise: {
        title: '运动建议',
        description: '需要身心结合的运动。',
        recommendations: [
          '高尔夫 - 专注与运动结合',
          '快走 - 温和有氧，改善心肺',
          '冥想 - 平复内心矛盾，缓解压力'
        ]
      },
      lifestyle: {
        title: '生活贴士',
        description: 'AB型血容易出现情绪波动，保持充足的睡眠对大脑健康至关重要，预防记忆力衰退。',
        tips: [
          '保证7-8小时高质量睡眠',
          '学习情绪管理技巧',
          '定期进行大脑锻炼活动',
          '避免过度用脑，适当休息'
        ]
      }
    },
    'O': {
      title: 'O型血',
      subtitle: '行动的领导者',
      icon: '⭕',
      colorClass: 'bg-green-500',
      personality: {
        title: '性格特征',
        description: 'O型血是天生的行动派，目标感极强，遇到困难不轻言放弃。他们充满活力，喜欢在团队中掌握主导权。虽然有时显得霸道、粗枝大叶，但因其正义感和讲义气，很容易成为朋友圈的核心。',
        keywords: ['自信', '热情', '意志坚定', '直率', '有野心']
      },
      healthRisks: {
        title: '健康风险',
        description: '注意出血与炎症，血液最稀不易凝固，出血风险大；甲状腺功能容易不稳定。',
        medicalStats: 'O型血的人胃酸分泌旺盛，容易得胃溃疡和十二指肠溃疡（对幽门螺杆菌更敏感）。但好处是，O型血患疟疾和癌症的风险相对最低。'
      },
      diet: {
        title: '饮食建议',
        description: '胃酸多，消化肉能力强，需要高蛋白饮食来维持能量。',
        recommendations: [
          '多吃瘦肉、鱼、肝脏等高蛋白食物',
          '适量摄入坚果和种子',
          '多吃富含维生素C的水果蔬菜'
        ],
        avoid: ['谷物（特别是小麦）', '乳制品', '加工食品']
      },
      exercise: {
        title: '运动建议',
        description: '精力过剩，必须通过高强度运动释放压力。',
        recommendations: [
          '有氧健身 - 高强度间歇训练',
          '长跑 - 释放能量，提高耐力',
          '拳击 - 发泄情绪，增强力量',
          '武术 - 身心结合，培养纪律'
        ]
      },
      lifestyle: {
        title: '生活贴士',
        description: 'O型血性格急躁，情绪爆发时血压容易飙升。学会深呼吸，同时定期检查胃部，预防溃疡。',
        tips: [
          '学习深呼吸和放松技巧',
          '定期进行胃部检查',
          '培养耐心，避免急躁行事',
          '建立健康的压力释放机制'
        ]
      }
    }
  };
  const currentInfo = bloodTypeInfo[selectedBloodType] || bloodTypeInfo['A'];
  const handleBack = () => {
    navigate(-1);
  };
  const handleBloodTypeChange = (type) => {
    setSelectedBloodType(type);
  };
  return (
    <div className="blood-type-detail-page scrollbar-hide">
      {/* 页面头部 */}
      <div className="detail-header-fixed">
        <button className="glass-back-button" onClick={handleBack}>
          <ArrowLeftIcon size={20} />
          <span>返回</span>
        </button>
        <h1 className="page-title-center">血型健康详情</h1>
      </div>
      {/* 血型选择器 */}
      <div className="blood-type-selector-sticky">
        <div className="selector-inner">
          <div className="type-buttons-row">
            {['A', 'B', 'AB', 'O'].map(type => (
              <button
                key={type}
                className={`type-option-btn ${selectedBloodType === type ? 'active' : ''}`}
                onClick={() => handleBloodTypeChange(type)}
              >
                <div className="type-icon-wrapper">
                  <BloodTypeIcon type={type} size={24} />
                </div>
                <span className="type-name">{type}型</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 主要内容 */}
      <div className="detail-content">
        {/* 血型概览 */}
        <div className="blood-type-hero-section">
          <div className={`hero-card-gradient ${currentInfo.colorClass}`}>
            <div className="hero-icon-container">
              <BloodTypeIcon type={selectedBloodType} size={64} />
            </div>
            <div className="hero-info">
              <h2 className="hero-title">{currentInfo.title}</h2>
              <p className="hero-subtitle">{currentInfo.subtitle}</p>
            </div>
          </div>
        </div>
        {/* 性格特征 */}
        <div className="glass-info-section">
          <div className="section-header-row">
            <div className="section-dot-blue"></div>
            <h3 className="section-heading">{currentInfo.personality.title}</h3>
          </div>
          <p className="section-body-text">{currentInfo.personality.description}</p>
          <div className="personality-tags-container">
            {currentInfo.personality.keywords.map((keyword, index) => (
              <span key={index} className="personality-tag">{keyword}</span>
            ))}
          </div>
        </div>
        {/* 健康风险 */}
        <div className="glass-info-section">
          <div className="section-header-row">
            <div className="section-dot-red"></div>
            <h3 className="section-heading">{currentInfo.healthRisks.title}</h3>
          </div>
          <p className="section-body-text">{currentInfo.healthRisks.description}</p>
          <div className="medical-insight-box">
            <div className="insight-label">医学统计</div>
            <p className="insight-content">{currentInfo.healthRisks.medicalStats}</p>
          </div>
        </div>
        {/* 饮食建议 */}
        <div className="glass-info-section">
          <div className="section-header-row">
            <div className="section-dot-green"></div>
            <h3 className="section-heading">{currentInfo.diet.title}</h3>
          </div>
          <p className="section-body-text">{currentInfo.diet.description}</p>

          <div className="diet-content-grid">
            <div className="recommendation-list">
              <div className="sub-heading-with-icon">
                <span className="dot-green-small"></span>
                <span>推荐食物</span>
              </div>
              <ul className="diet-ul">
                {currentInfo.diet.recommendations.map((item, index) => (
                  <li key={index} className="diet-li">{item}</li>
                ))}
              </ul>
            </div>

            <div className="avoid-section">
              <div className="sub-heading-with-icon">
                <span className="dot-red-small"></span>
                <span>避免或减少</span>
              </div>
              <div className="avoid-labels-row">
                {currentInfo.diet.avoid.map((item, index) => (
                  <span key={index} className="avoid-label-chip">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* 运动建议 */}
        <div className="glass-info-section">
          <div className="section-header-row">
            <div className="section-dot-purple"></div>
            <h3 className="section-heading">{currentInfo.exercise.title}</h3>
          </div>
          <p className="section-body-text">{currentInfo.exercise.description}</p>
          <div className="exercise-chips-grid">
            {currentInfo.exercise.recommendations.map((item, index) => (
              <div key={index} className="exercise-card-item">
                <div className="exercise-dot-indicator"></div>
                <span className="exercise-item-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 生活贴士 */}
        <div className="glass-info-section">
          <div className="section-header-row">
            <div className="section-dot-orange"></div>
            <h3 className="section-heading">{currentInfo.lifestyle.title}</h3>
          </div>
          <p className="section-body-text">{currentInfo.lifestyle.description}</p>
          <div className="vertical-tips-column">
            {currentInfo.lifestyle.tips.map((tip, index) => (
              <div key={index} className="glass-tip-card">
                <div className="tip-index-badge">{index + 1}</div>
                <span className="tip-text-content">{tip}</span>
              </div>
            ))}
          </div>
        </div>
        {/* 健康总结 */}
        <div className="final-summary-quote">
          <div className="quote-accent-bar"></div>
          <div className="quote-content-wrapper">
            <h3 className="quote-title">健康总结</h3>
            <p className="quote-text">
              <span className="highlight-white">血型并不是宿命，而是一份"身体使用说明书"。</span><br />
              医学统计只代表概率，不代表必然。真正的养生核心在于了解自己的身体，并保持规律的生活和平和的心态。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BloodTypeHealthDetailPage;