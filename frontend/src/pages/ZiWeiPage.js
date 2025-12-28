import React, { useState, useEffect } from 'react';
import { useUserConfig } from '../contexts/UserConfigContext';
import ZiWeiPalaceDisplay from '../components/ZiWeiPalaceDisplay';
import { getZiWeiDisplayData } from '../utils/ziweiHelper';
import '../styles/ziwei.css';

/**
 * 紫微命宫页面
 * 基于用户八字信息动态展示紫微命盘
 */
const ZiWeiPage = () => {
  const { currentConfig } = useUserConfig();
  const [ziweiData, setZiweiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadZiWeiData = async () => {
      if (!currentConfig) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await getZiWeiDisplayData(currentConfig);
        setZiweiData(data);
        
        if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('加载紫微命宫数据失败:', err);
        setError('紫微命宫计算失败，请检查您的出生信息是否完整');
      } finally {
        setLoading(false);
      }
    };

    loadZiWeiData();
  }, [currentConfig]);

  // 检查是否有必要的配置信息
  const hasRequiredConfig = currentConfig && currentConfig.birthDate;

  return (
    <div className="ziwei-page">
      {/* 页面头部 */}
      <div className="ziwei-header">
        <div className="ziwei-title-section">
          <h1 className="ziwei-title">
            <span className="ziwei-icon">🌟</span>
            紫微命宫
          </h1>
          <p className="ziwei-subtitle">基于传统命理学的深度命盘分析</p>
        </div>
        
        {currentConfig?.birthDate && (
          <div className="ziwei-user-info">
            <div className="info-item">
              <span className="info-label">出生日期：</span>
              <span className="info-value">{currentConfig.birthDate}</span>
            </div>
            {currentConfig.birthTime && (
              <div className="info-item">
                <span className="info-label">出生时间：</span>
                <span className="info-value">{currentConfig.birthTime}</span>
              </div>
            )}
            {currentConfig.birthLocation && (
              <div className="info-item">
                <span className="info-label">出生地点：</span>
                <span className="info-value">
                  {currentConfig.birthLocation.lat?.toFixed(2)}°N, 
                  {currentConfig.birthLocation.lng?.toFixed(2)}°E
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="ziwei-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-outer"></div>
              <div className="spinner-inner"></div>
            </div>
            <p className="loading-text">正在计算紫微命盘...</p>
            <p className="loading-subtext">基于您的出生时间、经纬度等信息</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">计算失败</h3>
            <p className="error-message">{error}</p>
            {!hasRequiredConfig && (
              <div className="error-suggestion">
                <p>请先设置完整的出生信息以查看紫微命宫</p>
                <button 
                  className="config-button"
                  onClick={() => window.location.href = '/settings'}
                >
                  去设置
                </button>
              </div>
            )}
          </div>
        ) : !hasRequiredConfig ? (
          <div className="empty-container">
            <div className="empty-icon">🔮</div>
            <h3 className="empty-title">请设置完整的出生信息</h3>
            <p className="empty-message">需要完善以下信息以查看紫微命宫</p>
            <div className="required-info">
              <span className="info-tag">出生日期</span>
              <span className="info-tag">出生时辰</span>
              <span className="info-tag">经纬度</span>
            </div>
            <button 
              className="config-button primary"
              onClick={() => window.location.href = '/settings'}
            >
              完善配置信息
            </button>
          </div>
        ) : (
          <ZiWeiPalaceDisplay 
            ziweiData={ziweiData}
            birthDate={currentConfig.birthDate}
            birthTime={currentConfig.birthTime}
            longitude={currentConfig.birthLocation?.lng}
          />
        )}
      </div>
    </div>
  );
};

export default ZiWeiPage;