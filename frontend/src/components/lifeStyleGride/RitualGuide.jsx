import { useState, useMemo } from 'react';
import { getDimensionColor } from '../../utils/matrixData';

/**
 * 仪式指南组件
 * 提供仪式建议和指引，帮助用户深化能量印记的意义
 */
const RitualGuide = ({ matrixData, totalScore, matrixSize, theme = 'light' }) => {
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
    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">仪式指南</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>通过仪式深化你的能量印记意义</p>
      </div>

      {/* 标签页 */}
      <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
            activeTab === 'daily'
              ? `${theme === 'dark' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-white text-blue-600 border-b-2 border-blue-500'}`
              : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('daily')}
        >
          📅 日常仪式
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
            activeTab === 'weekly'
              ? `${theme === 'dark' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-white text-blue-600 border-b-2 border-blue-500'}`
              : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('weekly')}
        >
          🗓️ 每周仪式
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-lg -mb-px ${
            activeTab === 'special'
              ? `${theme === 'dark' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-white text-blue-600 border-b-2 border-blue-500'}`
              : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('special')}
        >
          ✨ 特殊仪式
        </button>
      </div>

      {/* 仪式列表 */}
      <div className="space-y-4 mb-6">
        {rituals[activeTab]
          .filter(shouldShowSpecialRitual)
          .map(ritual => {
            const status = getRitualStatus(ritual);
            const isCompleted = status.class === 'completed';

            return (
              <div
                key={ritual.id}
                className={`p-4 rounded-lg border ${
                  isCompleted
                    ? `${theme === 'dark' ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`
                    : status.class === 'locked'
                    ? `${theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-200'}`
                    : `${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-gray-200'}`
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl mt-1">{ritual.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{ritual.name}</h4>
                      <div className={`flex items-center gap-3 mt-1 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span>⏱️ {ritual.duration}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          status.class === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                            : status.class === 'locked'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                        }`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : `${theme === 'dark' ? 'border-gray-500 hover:border-gray-400' : 'border-gray-300 hover:border-gray-500'}`
                    }`}
                    onClick={() => toggleRitualComplete(ritual.id)}
                  >
                    {isCompleted ? '✓' : '○'}
                  </button>
                </div>

                <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{ritual.description}</p>

                <div>
                  <h5 className="font-medium mb-2">步骤：</h5>
                  <ol className="list-decimal list-inside space-y-1">
                    {ritual.steps.map((step, index) => (
                      <li key={index} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{step}</li>
                    ))}
                  </ol>
                </div>

                {ritual.threshold && status.class === 'locked' && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-100 border border-yellow-200'
                  }`}>
                    <span>🔒 需要总能量达到 {ritual.threshold} 才能解锁</span>
                  </div>
                )}
              </div>
            );
          })}

        {rituals[activeTab].filter(shouldShowSpecialRitual).length === 0 && (
          <div className={`p-6 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>暂时没有可执行的仪式</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>继续添加能量印记来解锁更多仪式</p>
          </div>
        )}
      </div>

      {/* 高能量维度建议 */}
      {highEnergyCells.length > 0 && activeTab === 'special' && (
        <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800' : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'}`}>
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>🌟</span> 高能量维度 ({highEnergyCells.length})
          </h4>
          <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>这些维度已达到深度反思的阈值：</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {highEnergyCells.map(cell => (
              <div
                key={cell.id}
                className={`p-3 rounded-lg border flex justify-between items-center ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-white'
                }`}
                style={{
                  borderColor: getDimensionColor(cell.dimension.id)
                }}
              >
                <span className="font-medium truncate">{cell.dimension.name}</span>
                <span className="font-bold" style={{ color: getDimensionColor(cell.dimension.id) }}>
                  {cell.energy}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 弱维度建议 */}
      {weakDimensions.length > 0 && activeTab === 'weekly' && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-800' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200'}`}>
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <span>📊</span> 建议强化的维度 ({weakDimensions.length})
          </h4>
          <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>这些维度有印记但能量较低，考虑添加更多相关内容：</p>
          <ul className="space-y-2">
            {weakDimensions.map(cell => (
              <li key={cell.id} className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>{cell.dimension.name}</strong>
                <span>(当前能量: {cell.energy})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 统计信息 */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
        <h4 className="font-bold mb-4">仪式统计</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold text-green-500">{completedRituals.length}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>已完成仪式</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold text-blue-500">{totalScore}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>总能量</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold text-purple-500">{highEnergyCells.length}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>高能量维度</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualGuide;