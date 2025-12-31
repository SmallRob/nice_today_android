/**
 * 每日集卡功能主页面
 */

import React, { useState, useEffect } from 'react';
import { createShakeDetector, isShakeSupported, needsPermissionRequest, requestShakePermission } from '../utils/shakeUtils';
import { performDraw, calculatePityProgress } from '../utils/cardProbability';
import {
  loadDailyDraws,
  addCardToCollection,
  recordDraw,
  loadPityData,
  savePityData,
  getCollectionStats,
  markCardAsViewed
} from '../utils/cardStorage';
import { RARITY_CONFIG, TRADITIONAL_CARDS, HEXAGRAM_CARDS } from '../utils/cardConfig';
import '../styles/dailyCards.css';

/**
 * 抽卡结果模态框
 */
const CardResultModal = ({ card, rarity, onClose, onCollect, visible }) => {
  if (!visible || !card) return null;

  const rarityInfo = RARITY_CONFIG[rarity];
  const isSSR = rarity === 'SSR';

  return (
    <div className={`card-result-modal-overlay ${visible ? 'visible' : ''}`}>
      <div className={`card-result-content ${isSSR ? 'ssr-effect' : ''}`}>
        {/* 四角装饰 */}
        <div className="corner-decoration"></div>
        <div className="corner-decoration"></div>
        <div className="corner-decoration"></div>
        <div className="corner-decoration"></div>

        {/* 凤凰花纹 */}
        <div className="phoenix-ornament">❖</div>
        <div className="phoenix-ornament">❖</div>
        <div className="phoenix-ornament">❖</div>
        <div className="phoenix-ornament">❖</div>

        <div className="card-result-inner">
          <div
            className="rarity-badge"
            style={{
              background: rarityInfo.gradient,
              boxShadow: rarityInfo.shadow
            }}
          >
            ★★ {rarityInfo.label} ★★
          </div>

          <div className="card-display-area">
            <div className="card-icon">{card.icon}</div>
            <h2 className="card-name">{card.name}</h2>
            {card.alias && <p className="card-alias">{card.alias}</p>}
            <p className="card-english">{card.englishName}</p>
            <div className="card-divider"></div>
            <p className="card-description">{card.description}</p>
          </div>

          <div className="card-actions">
            <button className="action-button secondary" onClick={onClose}>
              离开
            </button>
            <button className="action-button primary" onClick={onCollect}>
              放入集卡册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 单张卡片展示组件（图鉴用）
 */
const CardItem = ({ card, collected }) => {
  const rarityInfo = RARITY_CONFIG[card.rarity];
  const isHexagram = card.type === 'hexagram';

  return (
    <div
      className={`collection-card-item ${card.rarity.toLowerCase()} ${isHexagram ? 'hexagram' : 'traditional'}`}
    >
      <div>
        {card.rarity === 'SR' && <div className="card-badge sr">SR</div>}
        {card.rarity === 'SSR' && <div className="card-badge ssr">SSR</div>}
        <div className="card-content">
          <div className="collection-card-icon">{card.icon}</div>
          <div className="collection-card-info">
            <div className="collection-card-name">{card.name}</div>
            {card.alias && <div className="collection-card-alias">{card.alias}</div>}
            <div className={`collection-card-rarity ${card.rarity.toLowerCase()}`}>
              {rarityInfo.chineseName}
            </div>
          </div>
        </div>
        {collected && <div className="collected-badge">✓</div>}
      </div>
    </div>
  );
};

/**
 * 卡牌分类展示组件
 */
const CardCategorySection = ({ title, cards, collectedCards, isExpanded, onToggle, categoryType }) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  const handleToggle = () => {
    setLocalExpanded(!localExpanded);
    onToggle && onToggle();
  };

  const isCollected = (card) => {
    return collectedCards.some(c => c.id === card.id && c.type === card.type);
  };

  const collectedCount = cards.filter(c => isCollected(c)).length;
  const totalCount = cards.length;

  return (
    <div className={`card-category-section ${categoryType}`}>
      <div className="category-header" onClick={handleToggle}>
        <div className="category-title-row">
          <div className="category-title">{title}</div>
          <div className="category-count">
            {collectedCount}/{totalCount}
          </div>
        </div>
        <div className={`expand-icon ${localExpanded ? 'expanded' : ''}`}>
          {localExpanded ? '▼' : '▶'}
        </div>
      </div>
      {localExpanded && (
        <div className="category-content">
          <div className="cards-grid">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                collected={isCollected(card)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 卡牌图鉴页面
 */
const CardCollection = ({ collectionStats, isDark }) => {
  const [expandedSections, setExpandedSections] = useState({
    traditional: true,
    hexagram: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadCollection = () => {
    try {
      const data = localStorage.getItem('cardCollection');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载收藏失败:', error);
      return [];
    }
  };

  const collectedCards = loadCollection();

  return (
    <div className={`card-collection-page ${isDark ? 'dark' : ''}`}>
      <div className="collection-summary">
        <div className="summary-card">
          <div className="summary-icon">📚</div>
          <div className="summary-info">
            <div className="summary-label">总收集进度</div>
            <div className="summary-value">
              {collectionStats?.collected || 0}/{collectionStats?.total || 0}
              <span className="summary-percentage">
                ({collectionStats?.percentage || 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardCategorySection
        title="🎴 传统元素"
        cards={TRADITIONAL_CARDS}
        collectedCards={collectedCards}
        isExpanded={expandedSections.traditional}
        onToggle={() => toggleSection('traditional')}
        categoryType="traditional"
      />

      <CardCategorySection
        title="☯️ 易经卦象"
        cards={HEXAGRAM_CARDS}
        collectedCards={collectedCards}
        isExpanded={expandedSections.hexagram}
        onToggle={() => toggleSection('hexagram')}
        categoryType="hexagram"
      />
    </div>
  );
};

/**
 * 每日抽卡专用 Tab 切换组件
 */
const DailyCardTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="daily-tabs-container">
      <button
        className={`daily-tab-button ${activeTab === 'draw' ? 'active' : ''}`}
        onClick={() => onTabChange('draw')}
      >
        🎰 抽卡
      </button>
      <button
        className={`daily-tab-button ${activeTab === 'collection' ? 'active' : ''}`}
        onClick={() => onTabChange('collection')}
      >
        📖 图鉴
      </button>
    </div>
  );
};

/**
 * 抽卡主组件
 */
const CardDraw = ({ remaining, onDraw, isDrawing }) => {
  const [shakeSupported, setShakeSupported] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    // 检查设备是否支持摇一摇
    setShakeSupported(isShakeSupported());
    setNeedsPermission(needsPermissionRequest());

    // 创建摇动检测器
    if (isShakeSupported()) {
      const detector = createShakeDetector({
        threshold: 15,
        timeout: 1000,
        onShake: () => {
          if (remaining > 0 && !isDrawing) {
            onDraw();
          }
        }
      });

      detector.start();

      return () => {
        detector.stop();
      };
    }
  }, [isDrawing, remaining, onDraw]);

  const handleShakeClick = async () => {
    if (needsPermission) {
      try {
        const result = await requestShakePermission();
        if (result === 'denied') {
          alert('摇动检测权限被拒绝，请使用点击抽卡');
        }
      } catch (error) {
        console.error('请求权限失败:', error);
      }
    }
  };

  return (
    <div className="card-draw-section">
      <div className={`card-back-container ${isDrawing ? 'drawing' : ''}`}>
        <div className="card-back">
          <div>
            <div className="card-pattern">🎴</div>
            <div className="draw-hint">
              {isDrawing ? '🎰 抽卡中...' : '📱 摇一摇或点击卡牌抽取'}
            </div>
          </div>
        </div>
      </div>

      <div className="draw-controls">
        <button
          className="draw-button"
          onClick={onDraw}
          disabled={remaining <= 0 || isDrawing}
        >
          {isDrawing ? '🎰 抽卡中...' : `✨ 抽卡 (${remaining}/3)`}
        </button>

        {shakeSupported && needsPermission && (
          <button className="permission-button" onClick={handleShakeClick}>
            🔓 启用摇一摇
          </button>
        )}

        {!shakeSupported && (
          <p className="shake-unsupported-hint">
            💡 当前设备不支持摇一摇，请使用点击抽卡
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * 保底进度条组件
 */
const PityProgress = ({ pityData }) => {
  const progress = calculatePityProgress(pityData);

  return (
    <div className="pity-progress-section">
      <h3>🍀 保底进度</h3>
      <div className="pity-bars">
        <div className="pity-bar-container">
          <div className="pity-bar-label">SR保底 ({progress.SR.current}/{progress.SR.max})</div>
          <div className="pity-bar">
            <div
              className="pity-bar-fill sr"
              style={{ width: `${progress.SR.progress}%` }}
            ></div>
          </div>
          {progress.SR.guaranteed && <span className="guaranteed-badge">必出</span>}
        </div>

        <div className="pity-bar-container">
          <div className="pity-bar-label">SSR保底 ({progress.SSR.current}/{progress.SSR.max})</div>
          <div className="pity-bar">
            <div
              className="pity-bar-fill ssr"
              style={{ width: `${progress.SSR.progress}%` }}
            ></div>
          </div>
          {progress.SSR.guaranteed && <span className="guaranteed-badge">必出</span>}
        </div>
      </div>
    </div>
  );
};

/**
 * 今日抽卡记录组件
 */
const TodayDraws = ({ draws }) => {
  if (!draws || draws.length === 0) {
    return (
      <div className="today-draws-section">
        <h3>📊 今日抽卡记录</h3>
        <div className="no-draws">今天还没有抽卡记录</div>
      </div>
    );
  }

  return (
    <div className="today-draws-section">
      <h3>📊 今日抽卡记录 ({draws.length}/3)</h3>
      <div className="draws-list">
        {draws.map((draw, index) => (
          <div key={index} className="draw-item">
            <span className="draw-time">
              {new Date(draw.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className={`draw-rarity ${draw.rarity}`}>
              {draw.rarity}
            </span>
            <span className="draw-type">
              {draw.cardType === 'hexagram' ? '易经卦象' : '传统元素'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 每日集卡主页面
 */
const DailyCardPage = () => {
  const [remaining, setRemaining] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [pityData, setPityData] = useState({ streak: { sr: 0, ssr: 0 } });
  const [collectionStats, setCollectionStats] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('draw');

  // 检测dark主题
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // 初始检查
    checkDarkMode();

    // 监听主题变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 加载初始数据
  const loadInitialData = () => {
    const dailyDraws = loadDailyDraws();
    setRemaining(dailyDraws.remaining);

    const pity = loadPityData();
    setPityData(pity);

    const stats = getCollectionStats();
    setCollectionStats(stats);
  };

  // 触发震动
  const triggerVibration = () => {
    if (navigator.vibrate && typeof navigator.vibrate === 'function') {
      try {
        // 震动模式：震动200ms，暂停100ms，震动200ms
        navigator.vibrate([200, 100, 200]);
        console.log('已触发震动');
      } catch (error) {
        console.warn('震动功能不可用:', error);
      }
    }
  };

  // 执行抽卡
  const handleDraw = () => {
    if (remaining <= 0) {
      alert('今日抽卡次数已用完，明天再来吧！🎉');
      return;
    }

    setIsDrawing(true);

    // 触发震动反馈
    triggerVibration();

    // 模拟抽卡延迟
    setTimeout(() => {
      try {
        const dailyDraws = loadDailyDraws();
        const pity = loadPityData();

        // 执行抽卡
        const { card, rarity, updatedPityData, pityTriggered, pityType } = performDraw(
          dailyDraws.draws.length,
          pity
        );

        // 添加到收藏
        addCardToCollection(card, rarity);

        // 记录抽卡
        recordDraw(card, rarity);

        // 更新保底数据
        savePityData(updatedPityData);
        setPityData(updatedPityData);

        // 更新剩余次数
        const updatedDraws = loadDailyDraws();
        setRemaining(updatedDraws.remaining);

        // 显示结果
        setDrawResult({ card, rarity, pityTriggered, pityType });
        setShowResult(true);

        // 更新收集统计
        const stats = getCollectionStats();
        setCollectionStats(stats);

        console.log('抽卡成功:', card, rarity, pityTriggered);
      } catch (error) {
        console.error('抽卡失败:', error);
        alert('抽卡失败，请稍后重试');
      } finally {
        setIsDrawing(false);
      }
    }, 1500);
  };

  // 关闭结果弹窗
  const handleCloseResult = () => {
    setShowResult(false);
    setDrawResult(null);
  };

  // 收藏卡牌（标记为已查看）
  const handleCollectCard = () => {
    if (drawResult && drawResult.card) {
      markCardAsViewed(drawResult.card.id, drawResult.card.type);
      handleCloseResult();
    }
  };

  return (
    <div className={`daily-card-page ${isDark ? 'dark' : ''}`}>
      <header className="page-header">
        <h1>🎴 每日集卡</h1>
        <p className="subtitle">摇一摇收集精美卡牌，传承传统文化</p>
      </header>

      {/* Tab 切换 */}
      <DailyCardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 抽卡页面 */}
      {activeTab === 'draw' && (
        <>
          {/* 收集进度 */}
          {collectionStats && (
            <div className="collection-progress-card">
              <div className="progress-header">
                <h3>📚 收集进度</h3>
                <span className="progress-count">
                  {collectionStats.collected}/{collectionStats.total} ({collectionStats.percentage}%)
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${collectionStats.percentage}%` }}
                ></div>
              </div>
              <div className="progress-details">
                <div className="progress-stat">
                  <span className="stat-label">传统元素</span>
                  <span className="stat-value">
                    {collectionStats.byType.traditional.collected}/52
                  </span>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">易经卦象</span>
                  <span className="stat-value">
                    {collectionStats.byType.hexagram.collected}/64
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 抽卡区域 */}
          <CardDraw remaining={remaining} onDraw={handleDraw} isDrawing={isDrawing} />

          {/* 保底进度 */}
          <PityProgress pityData={pityData} />

          {/* 今日抽卡记录 */}
          <TodayDraws draws={loadDailyDraws().draws} />
        </>
      )}

      {/* 图鉴页面 */}
      {activeTab === 'collection' && (
        <CardCollection collectionStats={collectionStats} isDark={isDark} />
      )}

      {/* 抽卡结果弹窗 */}
      <CardResultModal
        card={drawResult?.card}
        rarity={drawResult?.rarity}
        onClose={handleCloseResult}
        onCollect={handleCollectCard}
        visible={showResult}
      />
    </div>
  );
};

export default DailyCardPage;
