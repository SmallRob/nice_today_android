import { useState, useEffect } from 'react';
import MergedBannerCard from '../components/dashboard/MergedBannerCard';
import DailyFortuneCard from '../components/dashboard/DailyFortuneCard';
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
  CulturalCupCard
} from '../components/dashboard/FeatureCards';
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
    { component: EnergyBoostCard, name: 'EnergyBoostCard', category: '个人成长类' },
    { component: LifeMatrixCard, name: 'LifeMatrixCard', category: '个人成长类' },
    { component: DailyCardCard, name: 'DailyCardCard', category: '娱乐休闲类' },
    { component: TarotGardenCard, name: 'TarotGardenCard', category: '娱乐休闲类' },
    { component: CulturalCupCard, name: 'CulturalCupCard', category: '娱乐休闲类' },
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
    document.querySelectorAll('.feature-wrapper').forEach(el => {
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
        { component: EnergyBoostCard, name: 'EnergyBoostCard', category: '个人成长类' },
        { component: LifeMatrixCard, name: 'LifeMatrixCard', category: '个人成长类' },
    { component: DailyCardCard, name: 'DailyCardCard', category: '娱乐休闲类' },
    { component: TarotGardenCard, name: 'TarotGardenCard', category: '娱乐休闲类' },
    { component: CulturalCupCard, name: 'CulturalCupCard', category: '娱乐休闲类' },
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
          onClick={() => navigate('/bazi-analysis')}
        >
          <span>☯️</span>
          <span>八字命格</span>
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
            <div
              key={featureId}
              className="feature-wrapper"
              draggable={isEditMode}
              onDragStart={isEditMode ? (e) => handleDragStart(e, index) : undefined}
              onDragEnd={isEditMode ? handleDragEnd : undefined}
              onDragOver={isEditMode ? handleDragOver : undefined}
              onDragLeave={isEditMode ? handleDragLeave : undefined}
              onDrop={isEditMode ? (e) => handleDrop(e, index) : undefined}
              style={{
                cursor: isEditMode ? 'move' : 'pointer'
              }}
            >
              <FeatureComponent
                draggable={false}
                index={index}
                id={featureId}
                onDragStart={undefined}
                onDragEnd={undefined}
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
