import React, { useState, useEffect } from 'react';
import MergedBannerCard from '../components/dashboard/MergedBannerCard';
import DailyFortuneCard from '../components/dashboard/DailyFortuneCard';
import {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  PersonalityTraitCard,
  EnergyBoostCard,
  PeriodTrackerCard,
  ZiWeiCard,
  TodoCard,
  FinanceCard,
  TakashimaDivinationCard,
  LifeMatrixCard,
  DailyCardCard
} from '../components/dashboard/FeatureCards';
import { useUserConfig } from '../contexts/UserConfigContext';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import {
  loadFeatureSortOrder,
  saveFeatureSortOrder,
  mergeFeatureOrder,
  getFeatureId
} from '../utils/featureSortConfig';

/**
 * Dashboard首页 - 功能导航中心
 * 采用响应式网格布局，提供清晰的功能入口
 */
const Dashboard = () => {
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [features, setFeatures] = useState([]);

  // 初始化功能列表
  useEffect(() => {
    // 定义所有功能组件
    const allFeatures = [
      { component: TodoCard, name: 'TodoCard', category: '日常管理类' },
      { component: FinanceCard, name: 'FinanceCard', category: '日常管理类' },
      { component: TakashimaDivinationCard, name: 'TakashimaDivinationCard', category: '运势分析类' },
      { component: ChineseZodiacCard, name: 'ChineseZodiacCard', category: '运势分析类' },
      { component: HoroscopeCard, name: 'HoroscopeCard', category: '运势分析类' },
      { component: BaziCard, name: 'BaziCard', category: '运势分析类' },
      { component: ZiWeiCard, name: 'ZiWeiCard', category: '运势分析类' },
      { component: MBTICard, name: 'MBTICard', category: '个人成长类' },
      { component: PersonalityTraitCard, name: 'PersonalityTraitCard', category: '个人成长类' },
      { component: EnergyBoostCard, name: 'EnergyBoostCard', category: '个人成长类' },
      { component: LifeMatrixCard, name: 'LifeMatrixCard', category: '个人成长类' },
      { component: DailyCardCard, name: 'DailyCardCard', category: '娱乐休闲类' },
      { component: BiorhythmCard, name: 'BiorhythmCard', category: '健康管理类' },
      { component: PeriodTrackerCard, name: 'PeriodTrackerCard', category: '健康管理类' }
    ];

    // 加载保存的排序配置
    const savedOrder = loadFeatureSortOrder();

    // 合并排序（处理新增功能）
    const mergedOrder = mergeFeatureOrder(savedOrder, allFeatures.map(f => f.name));

    // 根据排序配置重新排序功能列表
    const sortedFeatures = [...allFeatures].sort((a, b) => {
      const aIndex = mergedOrder.indexOf(getFeatureId(a.name));
      const bIndex = mergedOrder.indexOf(getFeatureId(b.name));
      return aIndex - bIndex;
    });

    setFeatures(sortedFeatures);
  }, []);

  // 处理拖拽排序
  const handleReorder = ({ draggedId, targetId, type, sourceIndex, targetIndex }) => {
    const newFeatures = [...features];

    if (type === 'drop') {
      // 查找拖拽和目标功能在当前列表中的索引
      const draggedIndex = newFeatures.findIndex(f => getFeatureId(f.name) === draggedId);
      const targetIndex = newFeatures.findIndex(f => getFeatureId(f.name) === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // 移动功能
      const [draggedFeature] = newFeatures.splice(draggedIndex, 1);
      newFeatures.splice(targetIndex, 0, draggedFeature);
    } else if (type === 'move' && sourceIndex !== undefined && targetIndex !== undefined) {
      // 通过索引移动
      const [draggedFeature] = newFeatures.splice(sourceIndex, 1);
      newFeatures.splice(targetIndex, 0, draggedFeature);
    }

    setFeatures(newFeatures);

    // 保存新的排序配置
    const newOrder = newFeatures.map(f => getFeatureId(f.name));
    saveFeatureSortOrder(newOrder);
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // 重置为默认排序
  const resetToDefault = () => {
      if (window.confirm('确定要重置为默认排序吗？您的自定义排序将被清除。')) {
      const allFeatures = [
        { component: TodoCard, name: 'TodoCard', category: '日常管理类' },
        { component: FinanceCard, name: 'FinanceCard', category: '日常管理类' },
        { component: TakashimaDivinationCard, name: 'TakashimaDivinationCard', category: '运势分析类' },
        { component: ChineseZodiacCard, name: 'ChineseZodiacCard', category: '运势分析类' },
        { component: HoroscopeCard, name: 'HoroscopeCard', category: '运势分析类' },
        { component: BaziCard, name: 'BaziCard', category: '运势分析类' },
        { component: ZiWeiCard, name: 'ZiWeiCard', category: '运势分析类' },
        { component: MBTICard, name: 'MBTICard', category: '个人成长类' },
        { component: PersonalityTraitCard, name: 'PersonalityTraitCard', category: '个人成长类' },
        { component: EnergyBoostCard, name: 'EnergyBoostCard', category: '个人成长类' },
        { component: LifeMatrixCard, name: 'LifeMatrixCard', category: '个人成长类' },
        { component: DailyCardCard, name: 'DailyCardCard', category: '娱乐休闲类' },
        { component: BiorhythmCard, name: 'BiorhythmCard', category: '健康管理类' },
        { component: PeriodTrackerCard, name: 'PeriodTrackerCard', category: '健康管理类' }
      ];
      setFeatures(allFeatures);

      // 清除保存的配置
      localStorage.removeItem('feature_cards_sort_order');
    }
  };

  return (
    <div className="dashboard-container">
      {/* 合并的Banner和用户信息卡片 */}
      <MergedBannerCard />

      {/* 每日运势能量卡片 */}
      <DailyFortuneCard />

      {/* 快速操作 - 置顶的功能 */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => navigate('/horoscope')}
        >
          <span>📅</span>
          <span>今日运势</span>
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate('/bazi?mode=weekly')}
        >
          <span>📊</span>
          <span>本周趋势</span>
        </button>
        <button
          className="quick-action-btn"
          onClick={() => navigate('/biorhythm')}
        >
          <span>💡</span>
          <span>每日建议</span>
        </button>
      </div>

      {/* 全部功能标题和分割线 */}
      <div className="features-header">
        <div className="features-divider"></div>
        <h2 className="features-title">所有功能</h2>
        <div className="features-divider"></div>
      </div>

      {/* 编辑模式控制按钮 */}
      <div className="features-controls">
        <button
          className={`edit-mode-btn ${isEditMode ? 'edit-mode-active' : ''}`}
          onClick={toggleEditMode}
        >
          {isEditMode ? '✓ 完成排序' : '✏️ 编辑排序'}
        </button>
        {isEditMode && (
          <button className="reset-order-btn" onClick={resetToDefault}>
            ↺ 重置默认
          </button>
        )}
      </div>

      {/* 全部功能 - 3列网格布局 */}
      <div className="features-grid-three-col">
        {features.map((feature, index) => {
          const FeatureComponent = feature.component;
          const featureId = getFeatureId(feature.name);

          return (
            <div key={featureId} className="feature-wrapper">
              <FeatureComponent
                draggable={isEditMode}
                index={index}
                id={featureId}
                onDragStart={isEditMode ? (e, idx) => {
                  console.log('Drag started:', featureId, idx);
                } : undefined}
                onDragEnd={isEditMode ? (e) => {
                  if (e.draggedId && e.targetId) {
                    handleReorder(e);
                  }
                } : undefined}
              />
              {isEditMode && (
                <div className="drag-handle">⋮⋮</div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;
