import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import MergedBannerCard from '../components/dashboard/MergedBannerCard.js';
import DailyFortuneCard from '../components/dashboard/DailyFortuneCard.js';
import FestivalCard from '../components/dashboard/FestivalCard.js';
import {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  EnergyBoostCard,
  PeriodTrackerCard,
  ZiWeiCard,
  TodoCard,
  FinanceCard,
  TakashimaDivinationCard,
  LifeMatrixCard,
  DailyCardCard,
  TarotGardenCard,
  CulturalCupCard,
  DressGuideCard,
  WuxingHealthCard,
  OrganRhythmCard,
  FishingGameCard,
  FengShuiCompassCard,
  LiuyaoCard,
  PlumBlossomCard,
  HuangliCard,
  MoodCalendarCard
} from '../components/dashboard/FeatureCards.js';
import FeatureDragPanel from '../components/dashboard/FeatureDragPanel.js';
import {
  loadFeatureSortOrder,
  saveFeatureSortOrder,
  mergeFeatureOrder,
  getFeatureId
} from '../utils/featureSortConfig';

// 定义所有功能组件（移到外部，避免每次渲染创建新引用）
const ALL_FEATURES = [
  { component: TodoCard, name: 'TodoCard', category: '日常管理类', type: 'daily' },
  { component: FinanceCard, name: 'FinanceCard', category: '日常管理类', type: 'daily' },
  { component: FengShuiCompassCard, name: 'FengShuiCompassCard', category: '日常管理类', type: 'tool' },
  { component: TakashimaDivinationCard, name: 'TakashimaDivinationCard', category: '运势分析类', type: 'fortune' },
  { component: ChineseZodiacCard, name: 'ChineseZodiacCard', category: '运势分析类', type: 'fortune' },
  { component: HoroscopeCard, name: 'HoroscopeCard', category: '运势分析类', type: 'fortune' },
  { component: BaziCard, name: 'BaziCard', category: '运势分析类', type: 'fortune' },
  { component: ZiWeiCard, name: 'ZiWeiCard', category: '运势分析类', type: 'fortune' },
  { component: MBTICard, name: 'MBTICard', category: '个人成长类', type: 'growth' },
  { component: EnergyBoostCard, name: 'EnergyBoostCard', category: '个人成长类', type: 'growth' },
  { component: LifeMatrixCard, name: 'LifeMatrixCard', category: '个人成长类', type: 'growth' },
  { component: DressGuideCard, name: 'DressGuideCard', category: '个人成长类', type: 'growth' },
  { component: WuxingHealthCard, name: 'WuxingHealthCard', category: '健康管理类', type: 'health' },
  { component: OrganRhythmCard, name: 'OrganRhythmCard', category: '健康管理类', type: 'health' },
  { component: DailyCardCard, name: 'DailyCardCard', category: '娱乐休闲类', type: 'entertainment' },
  { component: TarotGardenCard, name: 'TarotGardenCard', category: '娱乐休闲类', type: 'entertainment' },
  { component: CulturalCupCard, name: 'CulturalCupCard', category: '娱乐休闲类', type: 'entertainment' },
  { component: FishingGameCard, name: 'FishingGameCard', category: '娱乐休闲类', type: 'entertainment' },
  // { component: AncientCardGameCard, name: 'AncientCardGameCard', category: '娱乐休闲类', type: 'entertainment' },
  { component: BiorhythmCard, name: 'BiorhythmCard', category: '健康管理类', type: 'health' },
  { component: PeriodTrackerCard, name: 'PeriodTrackerCard', category: '健康管理类', type: 'health' },
  { component: LiuyaoCard, name: 'LiuyaoCard', category: '运势分析类', type: 'fortune' },
  { component: PlumBlossomCard, name: 'PlumBlossomCard', category: '运势分析类', type: 'fortune' },
  { component: HuangliCard, name: 'HuangliCard', category: '运势分析类', type: 'fortune' },
  { component: MoodCalendarCard, name: 'MoodCalendarCard', category: '健康管理类', type: 'health' }
];

/**
 * Dashboard首页 - 功能导航中心
 * 采用移动端优先设计，扁平化风格，紧凑布局
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [features, setFeatures] = useState(ALL_FEATURES);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(() => {
    const saved = localStorage.getItem('features-expand-state');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // 保存展开状态
  useEffect(() => {
    localStorage.setItem('features-expand-state', JSON.stringify(isFeaturesExpanded));
  }, [isFeaturesExpanded]);

  // 页面挂载时清理可能残留的拖拽样式
  useEffect(() => {
    // 清理DOM样式类，防止其他页面的样式污染
    const cleanupDOMStyles = () => {
      document.querySelectorAll('.feature-card').forEach(el => {
        el.classList.remove('dragging');
        el.classList.remove('drag-over');
      });
    };

    cleanupDOMStyles();

    // 初始化功能排序
    const savedOrder = loadFeatureSortOrder();
    const mergedOrder = mergeFeatureOrder(savedOrder, ALL_FEATURES.map(f => f.name));

    const sortedFeatures = [...ALL_FEATURES].sort((a, b) => {
      const aIndex = mergedOrder.indexOf(getFeatureId(a.name));
      const bIndex = mergedOrder.indexOf(getFeatureId(b.name));
      return aIndex - bIndex;
    });

    setFeatures(sortedFeatures);
  }, []);

  // 处理拖拽开始
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dragIndex', index.toString());

    // 添加拖拽时的视觉反馈
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    // 移除所有卡片的拖拽样式
    document.querySelectorAll('.feature-card').forEach(el => {
      el.classList.remove('dragging');
      el.classList.remove('drag-over');
    });
  };

  // 处理拖拽经过
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // 添加目标卡片的视觉反馈
    const targetCard = e.currentTarget;
    targetCard.classList.add('drag-over');
  };

  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  // 处理放置
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const draggedIndexStr = e.dataTransfer.getData('dragIndex');
    if (!draggedIndexStr) return;

    const draggedIndex = parseInt(draggedIndexStr, 10);

    // 如果拖拽和放置位置相同，不执行操作
    if (draggedIndex === targetIndex) return;

    // 执行排序
    const newFeatures = [...features];
    const [draggedFeature] = newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(targetIndex, 0, draggedFeature);

    setFeatures(newFeatures);
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (isEditMode) {
      // 退出编辑模式时保存排序
      const newOrder = features.map(f => getFeatureId(f.name));
      const success = saveFeatureSortOrder(newOrder);
      if (success) {
        console.log('功能排序已保存');
      }
    }
    setIsEditMode(!isEditMode);
  };

  // 重置为默认排序
  const resetToDefault = () => {
    if (window.confirm('确定要重置为默认排序吗？')) {
      const defaultOrder = [...ALL_FEATURES];
      setFeatures(defaultOrder);
    }
  };

  // 按功能分类排序
  const sortByCategory = () => {
    const categoryOrder = ['日常管理类', '运势分析类', '个人成长类', '健康管理类', '娱乐休闲类'];
    const sorted = [...features].sort((a, b) => {
      const aIdx = categoryOrder.indexOf(a.category);
      const bIdx = categoryOrder.indexOf(b.category);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return 0;
    });
    setFeatures(sorted);
  };

  // 按图标颜色排序 (基于 type)
  const sortByColor = () => {
    const typeOrder = ['daily', 'fortune', 'growth', 'health', 'entertainment', 'tool'];
    const sorted = [...features].sort((a, b) => {
      const aIdx = typeOrder.indexOf(a.type);
      const bIdx = typeOrder.indexOf(b.type);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return 0;
    });
    setFeatures(sorted);
  };

  return (
    <div className={`app-container dashboard-page-wrapper ${isFeaturesExpanded ? 'features-expanded' : ''}`}>
      {/* 固定头部区域 */}
      <div className={`fixed-height-container ${isFeaturesExpanded ? 'collapsed' : ''}`}>
        <div className="collapsible-header-content">
          {/* 合并的Banner和用户信息卡片 */}
          <MergedBannerCard />

          {/* 每日运势能量卡片 */}
          <DailyFortuneCard />

          {/* 节日节气提醒 */}
          <FestivalCard />

          {/* 快速操作 - 置顶的功能 */}
          <div className="quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => navigate('/horoscope')}
            >
              <span>📅</span>
              <span className="quick-action-label">今日运势</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/bazi/analysis')}
            >
              <span>☯️</span>
              <span className="quick-action-label">八字命格</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/dress')}
            >
              <span>👕</span>
              <span className="quick-action-label">穿衣指南</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/biorhythm')}
            >
              <span>⚡</span>
              <span className="quick-action-label">今日节律</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/tarot')}
            >
              <span>🎴</span>
              <span className="quick-action-label">塔罗抽卡</span>
            </button>
          </div>
        </div>

        {/* 全部功能标题 - 始终显示或在展开时作为标题栏 */}
        <div className="features-header">
          <h2 className="features-title">
            {isFeaturesExpanded ? '全部功能入口' : '所有功能'}
            {isFeaturesExpanded && (
              <button
                className={`dashboard-edit-icon-btn edit-icon-btn ${isEditMode ? 'edit-mode-active' : ''}`}
                onClick={toggleEditMode}
                title={isEditMode ? '完成排序' : '编辑排序'}
              >
                {isEditMode ? '✅' : '✏️'}
              </button>
            )}
          </h2>
        </div>

        {/* 编辑模式控制按钮 */}
        {isEditMode && (
          <div className="features-controls hide-scrollbar">
            <button className="control-btn sort-btn" onClick={sortByCategory}>
              📂 按分类
            </button>
            <button className="control-btn sort-btn" onClick={sortByColor}>
              🎨 按颜色
            </button>
            <button className="control-btn dashboard-reset-btn" onClick={resetToDefault}>
              ↺ 恢复默认
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 - 锁定滚动，由 Panel 内部处理 */}
      <div className="content-area hide-scrollbar" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FeatureDragPanel
          maxHeight="100%"
          minHeight="100%"
          externalIsExpanded={isFeaturesExpanded}
          onToggle={setIsFeaturesExpanded}
        >
          {/* 全部功能 - 5列网格布局 */}
          <div className="features-grid">
            {features.map((feature, index) => {
              const FeatureComponent = feature.component;
              const featureId = getFeatureId(feature.name);

              return (
                <FeatureComponent
                  key={featureId}
                  draggable={isEditMode}
                  index={index}
                  id={featureId}
                  showDragHandle={isEditMode}
                  onDragStart={isEditMode ? (e) => handleDragStart(e, index) : undefined}
                  onDragEnd={isEditMode ? handleDragEnd : undefined}
                  onDragOver={isEditMode ? handleDragOver : undefined}
                  onDragLeave={isEditMode ? handleDragLeave : undefined}
                  onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
                />
              );
            })}
          </div>
        </FeatureDragPanel>
      </div>
    </div>
  );
};

export default Dashboard;