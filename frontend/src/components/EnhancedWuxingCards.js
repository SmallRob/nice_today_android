import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchDressInfoRange, fetchSpecificDateDressInfo, formatDateString } from '../services/apiService';
import { desktopDressService, isDesktopApp } from '../services/desktopService';

const EnhancedWuxingCards = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [dressInfoList, setDressInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDressInfo, setSelectedDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // 获取五行元素数据
  const getWuxingElements = () => {
    return [
      { name: '木', color: '#11998e', bgGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: '🌳', traits: '生长、向上' },
      { name: '火', color: '#fc4a1a', bgGradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', icon: '🔥', traits: '温热、向上' },
      { name: '土', color: '#f7b733', bgGradient: 'linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)', icon: '⛰', traits: '承载、中和' },
      { name: '金', color: '#667db6', bgGradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)', icon: '⚙️', traits: '收敛、肃杀' },
      { name: '水', color: '#2193b0', bgGradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', icon: '💧', traits: '滋润、向下' }
    ];
  };

  useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多5秒让服务就绪
      let attempts = 0;
      const maxAttempts = 50; // 5秒 (50 * 100ms)
      
      while (attempts < maxAttempts) {
        // 在Electron环境中，只要electronAPI存在且就绪就尝试使用
        const canUseService = isDesktop && isDesktopApp()
          ? (window.electronAPI && window.electronAPI.isReady && window.electronAPI.isReady())
          : (apiBaseUrl);
        
        if (canUseService) {
          loadDressInfoRange();
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载（Electron环境）
      if (isDesktop && isDesktopApp() && window.electronAPI) {
        console.warn('服务未及时就绪，但仍尝试加载穿搭建议数据');
        loadDressInfoRange();
      }
    };
    
    waitForService();
  }, [isDesktop, serviceStatus, apiBaseUrl]);

  // 加载穿搭建议范围数据
  const loadDressInfoRange = async () => {
    setLoading(true);
    let result;
    
    if (isDesktop && isDesktopApp()) {
      // 使用桌面服务
      try {
        result = await desktopDressService.getRange(1, 6);
        
        if (result.success && result.data) {
          // desktopService返回的是{success: true, data: {dress_info_list: [...], date_range: {...}}}
          const dressData = result.data;
          
          // 检查数据格式
          let dressInfoList = [];
          let dateRange = { start: new Date(), end: new Date() };
          
          if (dressData.dress_info_list) {
            // 直接有dress_info_list
            dressInfoList = dressData.dress_info_list;
          } else if (dressData.data && dressData.data.dress_info_list) {
            // 嵌套在data中
            dressInfoList = dressData.data.dress_info_list;
          } else if (Array.isArray(dressData)) {
            // 直接是数组
            dressInfoList = dressData;
          }
          
          if (dressData.date_range) {
            // date_range.start和end是字符串格式（YYYY-MM-DD），需要正确解析
            const startStr = dressData.date_range.start;
            const endStr = dressData.date_range.end;
            dateRange = {
              start: startStr ? (typeof startStr === 'string' ? new Date(startStr + 'T00:00:00') : new Date(startStr)) : new Date(),
              end: endStr ? (typeof endStr === 'string' ? new Date(endStr + 'T00:00:00') : new Date(endStr)) : new Date()
            };
          } else if (dressData.data && dressData.data.date_range) {
            const startStr = dressData.data.date_range.start;
            const endStr = dressData.data.date_range.end;
            dateRange = {
              start: startStr ? (typeof startStr === 'string' ? new Date(startStr + 'T00:00:00') : new Date(startStr)) : new Date(),
              end: endStr ? (typeof endStr === 'string' ? new Date(endStr + 'T00:00:00') : new Date(endStr)) : new Date()
            };
          }
          
          result = {
            success: true,
            dressInfoList: dressInfoList,
            dateRange: dateRange
          };
        }
      } catch (error) {
        console.error('加载穿搭建议数据失败:', error);
        result = {
          success: false,
          error: error.message
        };
      }
    } else {
      // 使用Web API
      if (!apiBaseUrl) {
        setError("API基础URL未设置，无法获取穿搭建议信息");
        setLoading(false);
        return;
      }
      result = await fetchDressInfoRange(apiBaseUrl);
    }
    
    if (result.success) {
      console.log(`API返回的穿搭建议数据: ${result.dressInfoList.length}天`);
      setDressInfoList(result.dressInfoList);
      setDateRange(result.dateRange);
      
      // 默认选择今天的数据
      const today = new Date().toISOString().split('T')[0];
      const todayInfo = result.dressInfoList.find(info => info.date === today);
      setSelectedDressInfo(todayInfo || result.dressInfoList[0]);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // 处理日期选择
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // 在已加载的数据中查找选中日期的信息
    const dateStr = formatDateString(date);
    const dateInfo = dressInfoList.find(info => info.date === dateStr);
    
    if (dateInfo) {
      setSelectedDressInfo(dateInfo);
    } else {
      // 如果在已加载数据中找不到，则请求特定日期的数据
      loadSpecificDateInfo(dateStr);
    }
  };

  // 获取特定日期的穿衣信息
  const loadSpecificDateInfo = async (dateStr) => {
    if (!apiBaseUrl) return;
    
    setLoading(true);
    const result = await fetchSpecificDateDressInfo(apiBaseUrl, dateStr);
    
    if (result.success) {
      // 更新选中的穿衣信息
      setSelectedDressInfo(result.dressInfo);
      
      // 将新获取的信息添加到列表中
      setDressInfoList(prevList => {
        // 检查是否已存在该日期的信息
        const exists = prevList.some(info => info.date === dateStr);
        if (exists) {
          // 如果存在，则替换
          return prevList.map(info => info.date === dateStr ? result.dressInfo : info);
        } else {
          // 如果不存在，则添加
          return [...prevList, result.dressInfo];
        }
      });
      
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // 日期格式化函数
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 获取日期标签类名
  const getDateTabClass = (dateStr) => {
    const isSelected = selectedDressInfo && selectedDressInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    let className = "flex flex-col items-center justify-center cursor-pointer transition-all duration-200 py-2 ";
    
    if (isSelected) {
      className += "bg-blue-500 text-white font-medium shadow-lg transform scale-105 ";
    } else if (isToday) {
      className += "bg-yellow-100 text-blue-700 border-b-2 border-blue-500 ";
    } else {
      className += "hover:bg-gray-100 hover:shadow-md hover:transform hover:scale-105 ";
    }
    
    return className;
  };

  if (loading && !selectedDressInfo) {
    return (
      <div className="loading-container-enhanced">
        <div className="loading-content-enhanced">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <p className="text-lg font-medium">正在为您分析今日五行能量...</p>
            <p className="text-sm">正在生成个性化的穿衣与饮食建议</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !selectedDressInfo) {
    return (
      <div className="error-container-enhanced">
        <div className="error-content-enhanced">
          <div className="error-icon">
            <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="error-suggestions">
            <p className="text-sm font-medium text-red-700 mb-2">建议操作：</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>检查网络连接是否正常</li>
              <li>确认后端服务已启动</li>
              <li>刷新页面重新尝试加载</li>
            </ul>
          </div>
          <button 
            onClick={() => loadDressInfoRange()} 
            className="retry-button-enhanced"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDressInfo) {
    return (
      <div className="no-data-container-enhanced">
        <div className="no-data-content-enhanced">
          <div className="no-data-icon">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无穿衣信息</h3>
          <p className="text-gray-500 mb-4">暂时无法获取穿衣建议数据，请稍后重试</p>
          <button 
            onClick={() => loadDressInfoRange()} 
            className="retry-button-enhanced"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 获取吉祥颜色系统
  const luckyColorSystems = selectedDressInfo.color_suggestions ? 
    selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "吉") : [];

  // 获取不吉颜色系统
  const unluckyColorSystems = selectedDressInfo.color_suggestions ? 
    selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "不吉") : [];

  // 获取五行元素
  const wuxingElements = getWuxingElements();

  return (
    <div className="wuxing-enhanced">
      {/* 页面标题和说明 */}
      <header className="wuxing-header-enhanced">
        <h2 className="text-2xl font-bold text-white mb-2">五行穿衣与饮食指南</h2>
        <p className="text-purple-100">
          根据传统五行理论，为您提供每日的穿衣配色和饮食建议，助您趋吉避凶，身心和谐
        </p>
      </header>

      {/* 五行知识卡片 */}
      <section className="wuxing-knowledge-enhanced">
        <h3 className="section-title-enhanced">五行基础知识</h3>
        <div className="wuxing-circle-container-enhanced">
          <div className="wuxing-circle-enhanced">
            {wuxingElements.map((element, index) => (
              <div
                key={element.name}
                className={`wuxing-element-enhanced wuxing-element-${element.name.toLowerCase()}`}
                style={{ transform: `rotate(${index * 72}deg) translateX(100px)` }}
              >
                <div className="element-icon-enhanced">{element.icon}</div>
                <div className="element-name-enhanced">{element.name}行</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="wuxing-description-grid">
          {wuxingElements.map((element) => (
            <div key={element.name} className={`wuxing-element-card-enhanced wuxing-${element.name.toLowerCase()}-card`}>
              <div className="element-header">
                <div className="element-icon-enhanced" style={{ background: element.bgGradient }}>
                  {element.icon}
                </div>
                <h4 className="element-title">{element.name}行</h4>
              </div>
              <p className="element-traits">{element.traits}</p>
              <div className="element-interactions">
                <span className="element-generates">生:</span>
                <span className="element-overcomes">克:</span>
                <span className="element-generated-by">被生:</span>
                <span className="element-overcome-by">被克:</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 日期选择区域 */}
      <section className="date-selection-enhanced">
        <div className="date-picker-container-enhanced">
          <div className="date-selection-header">
            <h3 className="section-title-enhanced">选择查询日期</h3>
            <p className="date-selection-subtitle">点击下方日期快速切换或使用日期选择器</p>
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="date-picker-enhanced"
            minDate={dateRange.start}
            maxDate={dateRange.end}
          />
        </div>
        
        {/* 日期快速选择标签 */}
        <div className="date-tabs-enhanced">
          {dressInfoList.slice(0, 8).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ width: `${100 / Math.min(dressInfoList.length, 8)}%` }}
            >
              <div className="date-tab-weekday">{info.weekday.replace('星期', '')}</div>
              <div className="date-tab-date">{formatDate(info.date)}</div>
              {new Date().toISOString().split('T')[0] === info.date && (
                <div className="date-tab-indicator"></div>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* 当日五行信息 */}
      <section className="daily-wuxing-enhanced">
        <div className="daily-wuxing-header">
          <h3 className="section-title-enhanced">
            <span className="section-icon">🔮</span>
            {selectedDressInfo.date} {selectedDressInfo.weekday}
          </h3>
          <div className="daily-element-display">
            <span className="daily-element-label">当日主导五行:</span>
            <span className="daily-element-value" style={{
              background: wuxingElements.find(e => e.name === selectedDressInfo.daily_element)?.bgGradient || '#f0f0f0'
            }}>
              {selectedDressInfo.daily_element}
            </span>
          </div>
        </div>
        
        <div className="wuxing-principle-enhanced">
          <h4 className="principle-title">
            <span className="principle-icon">📖</span>
            五行穿衣原理
          </h4>
          <p className="principle-description">
            <strong>五行穿衣原理：</strong>根据当日的五行属性，选择相生相助的颜色可以增强运势，
            避免相克相冲的颜色可以减少不利影响。合理的色彩搭配不仅美观，更能调和身心能量。
          </p>
        </div>
      </section>

      {/* 吉祥颜色详细指南 */}
      {luckyColorSystems.length > 0 && (
        <section className="color-recommendations-enhanced">
          <h3 className="section-title-enhanced">
            <span className="section-icon">🎨</span>
            今日吉祥颜色搭配
          </h3>
          
          <div className="color-principles-enhanced">
            <p className="color-principle-description">
              <strong>穿衣建议：</strong>优先选择以下颜色作为主色调，可以作为外套、上衣或配饰的颜色。
              多种吉祥色可以搭配使用，但建议以一种为主，其他为辅，避免色彩过于繁杂。
            </p>
          </div>

          <div className="color-cards-grid">
            {luckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="color-card-enhanced">
                <div className="color-header-enhanced">
                  <div className="color-sample-container-enhanced">
                    <div 
                      className="color-sample-enhanced" 
                      style={{ 
                        background: colorSystem.具体颜色 && colorSystem.具体颜色.length > 0 
                          ? `linear-gradient(135deg, ${colorSystem.具体颜色[0]}, ${colorSystem.具体颜色[1] || colorSystem.具体颜色[0]})` 
                          : '#cccccc' 
                      }} 
                    >
                      <div className="color-glow-effect"></div>
                    </div>
                  </div>
                  <div className="color-title">
                    <h4 className="color-system-name">{colorSystem.颜色系统}</h4>
                    <div className="lucky-badge">吉祥</div>
                  </div>
                </div>
                
                <div className="color-details-enhanced">
                  <div className="color-list">
                    {colorSystem.具体颜色 && colorSystem.具体颜色.map((color, colorIndex) => (
                      <span key={colorIndex} className="color-tag-enhanced">
                        {color}
                      </span>
                    ))}
                  </div>
                  <p className="color-description">{colorSystem.描述}</p>
                </div>
                
                <div className="color-usage">
                  <div className="usage-icon">👔</div>
                  <div className="usage-text">
                    <span className="usage-title">适合场景:</span>
                    <span className="usage-description">上衣、配饰、日常穿搭</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 不宜颜色警示 */}
      {unluckyColorSystems.length > 0 && (
        <section className="color-warnings-enhanced">
          <h3 className="section-title-enhanced">
            <span className="section-icon">⚠️</span>
            今日不宜颜色
          </h3>
          
          <div className="warning-principles-enhanced">
            <p className="warning-principle-description">
              <strong>注意事项：</strong>以下颜色在今日可能与您的气场相冲，建议避免作为主色调使用。
              如必须使用，可以小面积点缀，或搭配吉祥色来化解不利影响。
            </p>
          </div>

          <div className="warning-cards-grid">
            {unluckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="warning-card-enhanced">
                <div className="warning-header-enhanced">
                  <div className="warning-sample-container-enhanced">
                    <div 
                      className="warning-sample-enhanced" 
                      style={{ 
                        background: colorSystem.具体颜色 && colorSystem.具体颜色.length > 0 
                          ? `linear-gradient(135deg, ${colorSystem.具体颜色[0]}, ${colorSystem.具体颜色[1] || colorSystem.具体颜色[0]})` 
                          : '#cccccc' 
                      }} 
                    >
                      <div className="warning-glow-effect"></div>
                    </div>
                  </div>
                  <div className="warning-title">
                    <h4 className="warning-system-name">{colorSystem.颜色系统}</h4>
                    <div className="warning-badge">建议避免使用</div>
                  </div>
                </div>
                
                <div className="warning-details-enhanced">
                  <div className="warning-list">
                    {colorSystem.具体颜色 && colorSystem.具体颜色.map((color, colorIndex) => (
                      <span key={colorIndex} className="warning-tag-enhanced">
                        {color}
                      </span>
                    ))}
                  </div>
                  <p className="warning-description">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 饮食养生指南 */}
      <section className="dietary-guidance-enhanced">
        <h3 className="section-title-enhanced">
          <span className="section-icon">🍲</span>
          今日饮食养生指南
        </h3>
        
        <div className="dietary-principles-enhanced">
          <p className="dietary-principle-description">
            <strong>饮食养生原理：</strong>根据五行相生相克的原理，选择与当日五行相配的食物，
            可以调和体内气血，增强身体抵抗力。同时避免相克食物，减少身体负担。
          </p>
        </div>

        <div className="dietary-cards-grid">
          {/* 宜食推荐 */}
          <div className="dietary-card-enhanced lucky-card">
            <div className="dietary-card-header">
              <div className="dietary-icon-container">
                <div className="dietary-icon">✅</div>
              </div>
              <h4 className="dietary-title">推荐食物</h4>
              <p className="dietary-subtitle">有助于增强运势和健康</p>
            </div>
            <div className="food-items-grid">
              {selectedDressInfo.food_suggestions && selectedDressInfo.food_suggestions.宜 && selectedDressInfo.food_suggestions.宜.map((food, index) => (
                <div key={index} className="food-item-enhanced">
                  <span className="food-indicator"></span>
                  <span className="food-name">{food}</span>
                </div>
              ))}
            </div>
            <div className="dietary-tip">
              <span className="tip-icon">💡</span>
              <span className="tip-text">
                建议：可以将这些食物作为今日饮食的主要选择，有助于调和体内五行平衡
              </span>
            </div>
          </div>

          {/* 忌食提醒 */}
          <div className="dietary-card-enhanced warning-card">
            <div className="dietary-card-header">
              <div className="dietary-icon-container">
                <div className="dietary-icon">⚠️</div>
              </div>
              <h4 className="dietary-title">不宜食物</h4>
              <p className="dietary-subtitle">今日应当适量避免</p>
            </div>
            <div className="food-items-grid">
              {selectedDressInfo.food_suggestions && selectedDressInfo.food_suggestions.忌 && selectedDressInfo.food_suggestions.忌.map((food, index) => (
                <div key={index} className="food-item-enhanced warning-item">
                  <span className="food-indicator warning-indicator"></span>
                  <span className="food-name">{food}</span>
                </div>
              ))}
            </div>
            <div className="dietary-tip">
              <span className="tip-icon">⚠️</span>
              <span className="tip-text">
                提醒：并非完全禁止，而是建议适量减少，如需食用可搭配推荐食物来平衡
              </span>
            </div>
          </div>
        </div>

        {/* 饮食小贴士 */}
        <div className="dietary-tips-enhanced">
          <h4 className="tips-title">
            <span className="tips-icon">📌</span>
            饮食养生小贴士
          </h4>
          <ul className="tips-list">
            <li className="tip-item">
              <span className="tip-bullet">•</span>
              <span className="tip-text">饮食宜清淡，避免过于油腻和辛辣</span>
            </li>
            <li className="tip-item">
              <span className="tip-bullet">•</span>
              <span className="tip-text">用餐时保持心情愉悦，有助于消化吸收</span>
            </li>
            <li className="tip-item">
              <span className="tip-bullet">•</span>
              <span className="tip-text">可根据个人体质适当调整，不必严格按照建议执行</span>
            </li>
            <li className="tip-item">
              <span className="tip-bullet">•</span>
              <span className="tip-text">搭配适量运动，促进新陈代谢和气血循环</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 温馨提示 */}
      <section className="friendly-reminder-enhanced">
        <h4 className="reminder-title">
          <span className="reminder-icon">💖</span>
          温馨提示
        </h4>
        <div className="reminder-content">
          <p className="reminder-description">
            五行穿衣和饮食建议仅供参考，主要目的是帮助您在日常生活中保持身心和谐。
            请根据个人实际情况、身体状况和喜好进行适当调整。
          </p>
          <p className="reminder-description">
            最重要的是保持积极乐观的心态，合理搭配衣着，均衡营养饮食，这样才能真正达到养生保健的效果。
          </p>
        </div>
      </section>
    </div>
  );
};

export default EnhancedWuxingCards;