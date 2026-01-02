import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useEnergy } from '../contexts/EnergyContext';
import { getCurrentLevel, getNextLevelEnergy, getLevelConfig } from '../constants/energyLevels';
import EnergyTree from '../components/energy-tree/EnergyTree';
import EnergyBubble from '../components/energy-tree/EnergyBubble';
import EnergyProgressBar from '../components/energy-tree/EnergyProgressBar';
import LevelBadge from '../components/energy-tree/LevelBadge';
import EnergyHistory from '../components/energy-tree/EnergyHistory';
import './EnergyTreePage.css';

const EnergyTreePage = () => {
  const { theme } = useTheme();
  const { 
    energyData, 
    collectBubble, 
    spawnBubble, 
    getTodayProgress, 
    getBubblesCount,
    markLevelShown,
    isLevelShown 
  } = useEnergy();
  const navigate = useNavigate();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevelToShow, setCurrentLevelToShow] = useState(null);
  const [collectedAnimation, setCollectedAnimation] = useState(null);

  // 监听升级，每个等级只提示一次
  useEffect(() => {
    if (energyData) {
      const currentLevel = getCurrentLevel(energyData.totalEnergy);
      
      // 检查是否需要显示升级提示
      if (currentLevel > 1 && !isLevelShown(currentLevel)) {
        // 这个等级还没有提示过，显示升级提示
        setShowLevelUp(true);
        setCurrentLevelToShow(currentLevel);
        
        // 记录这个等级已经提示过
        markLevelShown(currentLevel);
        
        // 3秒后自动隐藏
        setTimeout(() => {
          setShowLevelUp(false);
          setCurrentLevelToShow(null);
        }, 3000);
      }
    }
  }, [energyData, isLevelShown, markLevelShown]);

  // 自动生成气泡（每天生成3-5个）
  useEffect(() => {
    if (energyData && !showLevelUp) {
      const interval = setInterval(() => {
        const now = new Date();
        const hours = now.getHours();

        // 每天6:00, 12:00, 18:00 生成新气泡
        if (hours === 6 || hours === 12 || hours === 18) {
          spawnBubble();
        }
      }, 60000); // 每分钟检查一次

      return () => clearInterval(interval);
    }
  }, [energyData, showLevelUp, spawnBubble]);

  // 点击气泡收集能量
  const handleBubbleClick = useCallback((bubble) => {
    collectBubble(bubble.id);

    // 显示收集动画
    setCollectedAnimation({
      x: bubble.x,
      y: bubble.y,
      energy: bubble.energy,
    });

    // 1秒后隐藏动画
    setTimeout(() => {
      setCollectedAnimation(null);
    }, 1000);
  }, [collectBubble]);

  // 点击能量树显示详情
  const handleTreeClick = useCallback(() => {
    // 可以添加更多交互，比如显示树木详情
    console.log('能量树被点击');
  }, []);

  if (!energyData) {
    return (
      <div className="energy-tree-page loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const currentLevel = getCurrentLevel(energyData.totalEnergy);
  const levelConfig = getLevelConfig(currentLevel);
  const nextLevelEnergy = getNextLevelEnergy(currentLevel);
  const progress = getTodayProgress();
  const bubblesCount = getBubblesCount();

  return (
    <div className={`energy-tree-page ${theme}`}>
      {/* 升级特效 */}
      {showLevelUp && currentLevelToShow && (
        <div className="level-up-overlay">
          <div className="level-up-animation">
            <div className="level-up-stars">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="star" style={{ '--delay': `${i * 0.2}s` }}></div>
              ))}
            </div>
            <div className="level-up-text">
              <div className="level-up-title">恭喜升级!</div>
              <div className="level-up-level">Lv.{currentLevelToShow}</div>
              <div className="level-up-name">{getLevelConfig(currentLevelToShow).name}</div>
            </div>
          </div>
        </div>
      )}

      {/* 收集动画 */}
      {collectedAnimation && (
        <div
          className="collected-animation"
          style={{
            left: `${collectedAnimation.x}%`,
            top: `${collectedAnimation.y}%`,
          }}
        >
          +{collectedAnimation.energy}
        </div>
      )}

      {/* 导航栏 */}
      <div className="energy-tree-navbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="page-title">能量树</h1>
        <div className="navbar-right">
          <LevelBadge level={currentLevel} />
        </div>
      </div>

      {/* 能量进度 */}
      <div className="energy-progress-section">
        <EnergyProgressBar progress={progress} />
      </div>

      {/* 能量树区域 */}
      <div className="energy-tree-section">
        <EnergyTree
          level={currentLevel}
          levelConfig={levelConfig}
          onClick={handleTreeClick}
        />

        {/* 能量气泡 */}
        {energyData.bubbles.map(bubble => (
          <EnergyBubble
            key={bubble.id}
            bubble={bubble}
            onClick={() => handleBubbleClick(bubble)}
          />
        ))}
      </div>

      {/* 等级信息 */}
      <div className="level-info-section">
        <div className="level-info-card">
          <div className="level-info-header">
            <span className="level-label">当前等级</span>
            <span className="level-value">Lv.{currentLevel}</span>
          </div>
          <div className="level-progress-bar">
            <div
              className="level-progress-fill"
              style={{
                width: nextLevelEnergy
                  ? `${((energyData.totalEnergy - levelConfig.minEnergy) / (nextLevelEnergy - levelConfig.minEnergy)) * 100}%`
                  : '100%',
              }}
            ></div>
          </div>
          <div className="level-info-footer">
            <span className="level-energy">{energyData.totalEnergy} 能量</span>
            {nextLevelEnergy && (
              <span className="next-level-energy">下一级: {nextLevelEnergy}</span>
            )}
          </div>
        </div>
      </div>

      {/* 能量历史 */}
      <EnergyHistory history={energyData.history} />

      {/* 气泡统计 */}
      <div className="bubbles-stats">
        <div className="stats-item">
          <span className="stats-icon">🫧</span>
          <span className="stats-value">{bubblesCount}</span>
          <span className="stats-label">可收集气泡</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyTreePage;
