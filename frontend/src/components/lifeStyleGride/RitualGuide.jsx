import { useState, useMemo } from 'react';

/**
 * 仪式指南组件
 * 提供仪式建议和指引，帮助用户深化能量印记的意义
 */
const RitualGuide = ({ matrixData, totalScore, matrixSize }) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [completedRituals, setCompletedRituals] = useState([]);

  // 获取高能量单元格
  const getHighEnergyCells = () => {
    const highEnergyCells = [];
    matrixData.forEach(row => {
      row.forEach(cell => {
        if (cell.energy >= 50) {
          highEnergyCells.push(cell);
        }
      });
    });
    return highEnergyCells.slice(0, 9); // 最多显示9个
  };

  const highEnergyCells = useMemo(() => getHighEnergyCells(), [matrixData]);

  // 获取弱维度
  const getWeakDimensions = () => {
    const weakCells = [];
    matrixData.forEach(row => {
      row.forEach(cell => {
        if (cell.energy < 20 && cell.imprints.length > 0) {
          weakCells.push(cell);
        }
      });
    });
    return weakCells.slice(0, 5);
  };

  const weakDimensions = useMemo(() => getWeakDimensions(), [matrixData]);

  // 仪式类型定义
  const rituals = {
    daily: [
      {
        id: 'morning-review',
        name: '晨间回顾',
        description: '早晨花5分钟回顾昨天的能量印记',
        steps: [
          '打开你的生命矩阵',
          '浏览昨天添加的印记',
          '思考这些印记如何影响你今天的行动',
          '设定今天想要强化的维度'
        ],
        duration: '5分钟',
        icon: '🌅'
      },
      {
        id: 'evening-reflection',
        name: '晚间反思',
        description: '每天晚上花10分钟反思今天的经历',
        steps: [
          '回顾今天的重要时刻',
          '识别最有意义的事件',
          '考虑这些事件属于哪个维度',
          '准备为相关维度添加新的能量印记'
        ],
        duration: '10分钟',
        icon: '🌙'
      }
    ],
    weekly: [
      {
        id: 'weekly-review',
        name: '每周回顾',
        description: '每周日花30分钟回顾整周的能量印记',
        steps: [
          '查看本周所有新增的印记',
          '分析哪些维度得到了强化',
          '识别被忽略的维度',
          '为下周设定维度发展目标'
        ],
        duration: '30分钟',
        icon: '📅'
      },
      {
        id: 'energy-balance',
        name: '能量平衡检查',
        description: '评估各维度的平衡性',
        steps: [
          '计算各类别（物质、精神、关系、创造）的总能量',
          '识别过度或不足的类别',
          '在下周为薄弱类别添加印记',
          '记录平衡计划'
        ],
        duration: '15分钟',
        icon: '⚖️'
      }
    ],
    special: [
      {
        id: 'milestone-celebration',
        name: '里程碑庆祝',
        description: '当总能量达到特定阈值时庆祝',
        steps: [
          '识别今天达成的里程碑',
          '回顾实现这个里程碑的历程',
          '感谢所有贡献的印记',
          '为下一个里程碑设定目标'
        ],
        duration: '20分钟',
        threshold: 500,
        icon: '🎉'
      },
      {
        id: 'deep-immersion',
        name: '深度沉浸',
        description: '当某个维度能量超过80时进行深度反思',
        steps: [
          '选择能量超过80的维度',
          '回顾该维度的所有印记',
          '写下这个维度如何影响了你的生活',
          '创建该维度的未来愿景',
          '分享这个体验（可选）'
        ],
        duration: '30分钟',
        threshold: 80,
        icon: '🧘'
      }
    ]
  };

  // 检查是否应显示特殊仪式
  const shouldShowSpecialRitual = (ritual) => {
    if (!ritual.threshold) return true;
    if (ritual.id === 'milestone-celebration') {
      return totalScore >= ritual.threshold;
    }
    if (ritual.id === 'deep-immersion') {
      return highEnergyCells.some(cell => cell.energy >= ritual.threshold);
    }
    return true;
  };

  // 标记仪式完成
  const toggleRitualComplete = (ritualId) => {
    if (completedRituals.includes(ritualId)) {
      setCompletedRituals(completedRituals.filter(id => id !== ritualId));
    } else {
      setCompletedRituals([...completedRituals, ritualId]);
    }
  };

  // 获取仪式状态
  const getRitualStatus = (ritual) => {
    const isCompleted = completedRituals.includes(ritual.id);
    if (isCompleted) return { text: '已完成', class: 'completed' };
    if (ritual.threshold && totalScore < ritual.threshold) {
      return { text: `需 ${ritual.threshold} 能量`, class: 'locked' };
    }
    return { text: '可执行', class: 'available' };
  };

  return (
    <div className="ritual-guide">
      <div className="ritual-header">
        <h3>仪式指南</h3>
        <p className="subtitle">通过仪式深化你的能量印记意义</p>
      </div>

      {/* 标签页 */}
      <div className="ritual-tabs">
        <button
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          📅 日常仪式
        </button>
        <button
          className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          🗓️ 每周仪式
        </button>
        <button
          className={`tab-btn ${activeTab === 'special' ? 'active' : ''}`}
          onClick={() => setActiveTab('special')}
        >
          ✨ 特殊仪式
        </button>
      </div>

      {/* 仪式列表 */}
      <div className="rituals-list">
        {rituals[activeTab]
          .filter(shouldShowSpecialRitual)
          .map(ritual => {
            const status = getRitualStatus(ritual);
            const isCompleted = status.class === 'completed';

            return (
              <div
                key={ritual.id}
                className={`ritual-item ${isCompleted ? 'completed' : ''}`}
              >
                <div className="ritual-main">
                  <div className="ritual-header">
                    <span className="ritual-icon">{ritual.icon}</span>
                    <div className="ritual-title-section">
                      <h4 className="ritual-name">{ritual.name}</h4>
                      <span className="ritual-duration">
                        ⏱️ {ritual.duration}
                      </span>
                    </div>
                    <button
                      className={`ritual-checkbox ${status.class}`}
                      onClick={() => toggleRitualComplete(ritual.id)}
                    >
                      {isCompleted ? '✓' : '○'}
                    </button>
                  </div>

                  <p className="ritual-description">{ritual.description}</p>

                  <div className="ritual-steps">
                    <h5>步骤：</h5>
                    <ol>
                      {ritual.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {ritual.threshold && status.class === 'locked' && (
                  <div className="ritual-lock">
                    <span>🔒 需要总能量达到 {ritual.threshold} 才能解锁</span>
                  </div>
                )}
              </div>
            );
          })}

        {rituals[activeTab].filter(shouldShowSpecialRitual).length === 0 && (
          <div className="no-rituals">
            <p>暂时没有可执行的仪式</p>
            <p>继续添加能量印记来解锁更多仪式</p>
          </div>
        )}
      </div>

      {/* 高能量维度建议 */}
      {highEnergyCells.length > 0 && activeTab === 'special' && (
        <div className="high-energy-suggestions">
          <h4>🌟 高能量维度 ({highEnergyCells.length})</h4>
          <p>这些维度已达到深度反思的阈值：</p>
          <div className="high-energy-grid">
            {highEnergyCells.map(cell => (
              <div
                key={cell.id}
                className="high-energy-cell"
                style={{
                  borderColor: getDimensionColor(cell.dimension.id)
                }}
              >
                <span className="cell-name">{cell.dimension.name}</span>
                <span className="cell-energy">{cell.energy}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 弱维度建议 */}
      {weakDimensions.length > 0 && activeTab === 'weekly' && (
        <div className="weak-dimensions-suggestions">
          <h4>📊 建议强化的维度 ({weakDimensions.length})</h4>
          <p>这些维度有印记但能量较低，考虑添加更多相关内容：</p>
          <ul>
            {weakDimensions.map(cell => (
              <li key={cell.id}>
                <strong>{cell.dimension.name}</strong>
                (当前能量: {cell.energy})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 统计信息 */}
      <div className="ritual-stats">
        <h4>仪式统计</h4>
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-number">{completedRituals.length}</span>
            <span className="stat-label">已完成仪式</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{totalScore}</span>
            <span className="stat-label">总能量</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{highEnergyCells.length}</span>
            <span className="stat-label">高能量维度</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 获取维度颜色（从 matrixData 导入）
const getDimensionColor = (dimensionId) => {
  const colorMap = {
    body: '#FF6B6B',
    mind: '#4ECDC4',
    spirit: '#45B7D1',
    work: '#96CEB4',
    center: '#FFEAA7',
    love: '#DDA0DD',
    play: '#FDCB6E',
    serve: '#55EFC4',
    being: '#74B9FF',
    health: '#FF6B6B',
    vitality: '#FF8E8E',
    senses: '#FFAAAA',
    family: '#FFB6C1',
    friendship: '#FFC8DD',
    community: '#FFAFCC',
    art: '#FFD166',
    music: '#FFE5A5',
    writing: '#FFF1C1',
    knowledge: '#118AB2',
    philosophy: '#06D6A0',
    science: '#0CB2B2',
    meditation: '#9D4EDD',
    prayer: '#C77DFF',
    ritual: '#E0AAFF',
    teaching: '#2A9D8F',
    healing: '#4CAF50',
    volunteering: '#8AC926',
    presence: '#F3722C',
    wonder: '#F8961E',
    gratitude: '#F9844A'
  };

  return colorMap[dimensionId] || '#CCCCCC';
};

export default RitualGuide;
