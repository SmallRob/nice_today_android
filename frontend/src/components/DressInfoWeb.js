import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchDressInfoRange, fetchSpecificDateDressInfo, formatDateString } from '../services/apiService';
import { desktopDressService, isDesktopApp } from '../services/desktopService';
import { seasonHealthTips, organRhythmTips, dietHealthTips, seasonGeneralTips, warmReminders, fiveElementsInfo } from '../config/healthTipsConfig';

const DressInfo = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:6',message:'DressInfo mounted',data:{hasApiBaseUrl:!!apiBaseUrl,hasServiceStatus:serviceStatus!==undefined,serviceStatus,hasIsDesktop:isDesktop!==undefined,isDesktop,hasElectronAPI:typeof window.electronAPI!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
  // #endregion
  const [dressInfoList, setDressInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDressInfo, setSelectedDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:14',message:'DressInfo waitForService started',data:{isDesktop,serviceStatus,hasElectronAPI:typeof window.electronAPI!=='undefined',apiReady:window.electronAPI?.isReady?.()||false,apiBaseUrl:!!apiBaseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      
      // 等待最多5秒让服务就绪
      let attempts = 0;
      const maxAttempts = 50; // 5秒 (50 * 100ms)
      
      while (attempts < maxAttempts) {
        // 在Electron环境中，只要electronAPI存在且就绪就尝试使用
        const canUseService = isDesktop && isDesktopApp()
          ? (window.electronAPI && window.electronAPI.isReady && window.electronAPI.isReady())
          : (apiBaseUrl);
        
        if (canUseService) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:24',message:'DressInfo service ready, loading data',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
          // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:37',message:'DressInfo max attempts reached, trying anyway',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        loadDressInfoRange();
      }
    };
    
    waitForService();
  }, [isDesktop, serviceStatus, apiBaseUrl]);

  
  // 加载穿搭建议范围数据
  const loadDressInfoRange = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:44',message:'loadDressInfoRange called',data:{isDesktop,serviceStatus,apiBaseUrl:!!apiBaseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
    
    setLoading(true);
    let result;
    
    if (isDesktop && isDesktopApp()) {
      // 使用桌面服务
      try {
        result = await desktopDressService.getRange(1, 6);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:52',message:'DressInfo desktop service result',data:{success:result.success,hasData:!!result.data,dataKeys:result.data?Object.keys(result.data):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        
        if (result.success && result.data) {
          // desktopService返回的是{success: true, data: {dress_info_list: [...], date_range: {...}}}
          const dressData = result.data;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:81',message:'DressInfo data structure',data:{hasDressData:!!dressData,dataKeys:Object.keys(dressData),hasDressInfoList:!!dressData.dress_info_list,hasDateRange:!!dressData.date_range},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix2',hypothesisId:'J'})}).catch(()=>{});
          // #endregion
          
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
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/DressInfo.js:102',message:'DressInfo data extracted',data:{dressInfoListLength:dressInfoList.length,hasDateRange:!!dateRange.start},timestamp:Date.now(),sessionId:'debug-session',runId:'dress-fix2',hypothesisId:'J'})}).catch(()=>{});
          // #endregion
          
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

  // 获取当前季节名称
  const getCurrentSeasonName = (date) => {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    
    // 根据阳历日期确定季节
    if ((month === 2 && day >= 4) || month === 3 || month === 4 || (month === 5 && day < 5)) {
      return "春";
    } else if ((month === 5 && day >= 5) || month === 6 || month === 7 || (month === 8 && day < 7)) {
      return "夏";
    } else if ((month === 8 && day >= 7) || (month === 9 && day < 7)) {
      return "长夏";
    } else if ((month === 9 && day >= 7) || month === 10 || (month === 11 && day < 7)) {
      return "秋";
    } else {
      return "冬";
    }
  };

  // 获取当前季节五行
  const getCurrentSeasonElement = (date) => {
    const seasonName = getCurrentSeasonName(date);
    const seasonData = seasonHealthTips[seasonName];
    return seasonData ? seasonData.element : "";
  };

  // 获取当前季节主令脏腑
  const getCurrentSeasonOrgans = (date) => {
    const seasonName = getCurrentSeasonName(date);
    const seasonData = seasonHealthTips[seasonName];
    return seasonData ? seasonData.organs : "";
  };

  // 获取当前季节特点
  const getCurrentSeasonCharacteristics = (date) => {
    const seasonName = getCurrentSeasonName(date);
    const seasonData = seasonHealthTips[seasonName];
    return seasonData ? seasonData.characteristics : "";
  };

  // 获取当前季节养生建议
  const getCurrentSeasonAdvice = (date) => {
    const seasonName = getCurrentSeasonName(date);
    const seasonData = seasonHealthTips[seasonName];
    return seasonData ? seasonData.advice : "";
  };

  // 获取当前器官时段
  const getCurrentOrganTime = (date) => {
    const hour = date.getHours();
    const index = Math.floor((hour + 1) / 2) % 12;
    return organRhythmTips.organTimes[index];
  };

  // 获取当前器官
  const getCurrentOrgan = (date) => {
    const hour = date.getHours();
    const index = Math.floor((hour + 1) / 2) % 12;
    return organRhythmTips.organs[index];
  };

  // 获取当前器官描述
  const getCurrentOrganDescription = (date) => {
    const organ = getCurrentOrgan(date);
    return organRhythmTips.organDescriptions[organ] || "";
  };

  // 获取当前器官建议
  const getCurrentOrganSuggestion = (date) => {
    const organ = getCurrentOrgan(date);
    return organRhythmTips.organSuggestions[organ] || "";
  };

  // 获取当前器官健康提示
  const getCurrentOrganHealthTip = (date) => {
    const organ = getCurrentOrgan(date);
    return organRhythmTips.organHealthTips[organ] || "";
  };

  // 获取日期标签类名
  const getDateTabClass = (dateStr) => {
    const isSelected = selectedDressInfo && selectedDressInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    let className = "flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 py-2 ";
    
    if (isSelected) {
      className += "bg-blue-500 text-white font-medium ";
    } else if (isToday) {
      className += "bg-yellow-100 text-blue-700 border-b-2 border-blue-500 ";
    } else {
      className += "hover:bg-gray-100 ";
    }
    
    return className;
  };

  if (loading && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">正在为您分析今日五行能量...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">正在生成个性化的穿衣与饮食建议</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">加载失败</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  建议操作：
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside space-y-1">
                  <li>检查网络连接是否正常</li>
                  <li>确认后端服务已启动</li>
                  <li>刷新页面重新尝试加载</li>
                </ul>
              </div>
            </div>
          </div>
          <button 
            onClick={() => loadDressInfoRange()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无穿衣信息</h3>
          <p className="text-gray-500 dark:text-gray-400">暂时无法获取穿衣建议数据，请稍后重试</p>
          <button 
            onClick={() => loadDressInfoRange()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 获取吉祥颜色系统
  const luckyColorSystems = selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "吉");
  const unluckyColorSystems = selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "不吉");

  return (
    <div className="space-y-6">
      {/* 页面标题和说明 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">五行穿衣与饮食指南</h2>
        <p className="text-purple-100">
          根据传统五行理论，为您提供每日的穿衣配色和饮食建议，助您趋吉避凶，身心和谐
        </p>
      </div>

      {/* 五行知识卡片 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          五行基础知识
        </h3>
        <div className="flex w-full">
          {Object.entries(fiveElementsInfo).map(([element, info]) => {
            const bgColorMap = {
              "木": "bg-green-50 dark:bg-green-900 dark:bg-opacity-20",
              "火": "bg-red-50 dark:bg-red-900 dark:bg-opacity-20", 
              "土": "bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20",
              "金": "bg-gray-50 dark:bg-gray-700",
              "水": "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
            };
            const circleColorMap = {
              "木": "bg-green-500",
              "火": "bg-red-500",
              "土": "bg-yellow-500", 
              "金": "bg-gray-500",
              "水": "bg-blue-500"
            };
            
            return (
              <div key={element} className={`flex-1 text-center p-3 ${bgColorMap[element]} rounded-lg mx-1`}>
                <div className={`w-12 h-12 ${circleColorMap[element]} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>{element}</div>
                <p className="text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">{info.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{info.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 日期选择区域 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              选择查询日期
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              点击下方日期快速切换或使用日期选择器
            </p>
          </div>
          <div className="flex items-center">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm dark:bg-gray-700 dark:text-white"
              minDate={dateRange.start}
              maxDate={dateRange.end}
            />
          </div>
        </div>
        
        {/* 日期快速选择标签 - 默认显示8天 */}
        <div className="flex border rounded-lg overflow-hidden shadow-sm dark:border-gray-600">
          {dressInfoList.slice(0, 8).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ width: `${100 / dressInfoList.length}%` }}
            >
              <div className="text-xs opacity-75 dark:text-gray-300">{info.weekday.replace('星期', '')}</div>
              <div className="font-medium dark:text-white">{formatDate(info.date)}</div>
              {new Date().toISOString().split('T')[0] === info.date && (
                <div className="flex items-center justify-center mt-1">
                  <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 当日五行信息 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            {selectedDressInfo.date} {selectedDressInfo.weekday}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">当日主导五行:</span>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-md">
              {selectedDressInfo.daily_element}
            </span>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-l-4 border-purple-500 dark:border-purple-400 p-4 rounded-r-lg">
          <p className="text-purple-800 dark:text-purple-300 text-sm leading-relaxed">
            <strong>五行穿衣原理：</strong>根据当日的五行属性，选择相生相助的颜色可以增强运势，
            避免相克相冲的颜色可以减少不利影响。合理的色彩搭配不仅美观，更能调和身心能量。
          </p>
        </div>
      </div>

      {/* 吉祥颜色详细指南 */}
      {luckyColorSystems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-green-600 dark:text-green-400">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            今日吉祥颜色搭配
          </h3>
          
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-green-800 dark:text-green-300 text-sm">
              <strong>穿衣建议：</strong>优先选择以下颜色作为主色调，可以作为外套、上衣或配饰的颜色。
              多种吉祥色可以搭配使用，但建议以一种为主，其他为辅，避免色彩过于繁杂。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {luckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-300">{colorSystem.颜色系统}</h4>
                    <p className="text-sm text-green-600 dark:text-green-400">推荐指数: ★★★★★</p>
                  </div>
                </div>
                <div className="ml-14">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-2">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-3 py-1 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-full text-sm text-green-700 dark:text-green-300">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 不宜颜色警示 */}
      {unluckyColorSystems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-red-600 dark:text-red-400">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            今日不宜颜色
          </h3>
          
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm">
              <strong>注意事项：</strong>以下颜色在今日可能与您的气场相冲，建议避免作为主色调使用。
              如必须使用，可以小面积点缀，或搭配吉祥色来化解不利影响。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {unluckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-800 dark:text-red-300">{colorSystem.颜色系统}</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">建议避免使用</p>
                  </div>
                </div>
                <div className="ml-14">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-2">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-3 py-1 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-full text-sm text-red-700 dark:text-red-300">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 饮食养生指南 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <svg className="w-6 h-6 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          今日饮食养生指南
        </h3>
        
        <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <p className="text-orange-800 dark:text-orange-300 text-sm leading-relaxed">
            <strong>饮食养生原理：</strong>根据五行相生相克的原理，选择与当日五行相配的食物，
            可以调和体内气血，增强身体抵抗力。同时避免相克食物，减少身体负担。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 宜食推荐 */}
          <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-3 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-300">推荐食物</h4>
                <p className="text-sm text-green-600 dark:text-green-400">有助于增强运势和健康</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDressInfo.food_suggestions.宜.map((food, index) => (
                <div key={index} className="flex items-center p-2 bg-white dark:bg-gray-700 rounded border border-green-200 dark:border-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-gray-800 dark:text-gray-300">{food}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                💡 建议：可以将这些食物作为今日饮食的主要选择，有助于调和体内五行平衡
              </p>
            </div>
          </div>

          {/* 忌食提醒 */}
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-3 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-300">不宜食物</h4>
                <p className="text-sm text-red-600 dark:text-red-400">今日应当适量避免</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDressInfo.food_suggestions.忌.map((food, index) => (
                <div key={index} className="flex items-center p-2 bg-white dark:bg-gray-700 rounded border border-red-200 dark:border-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-gray-800 dark:text-gray-300">{food}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 rounded-lg">
              <p className="text-xs text-red-700 dark:text-red-300">
                ⚠️ 提醒：并非完全禁止，而是建议适量减少，如需食用可搭配推荐食物来平衡
              </p>
            </div>
          </div>
        </div>

        {/* 饮食小贴士 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            饮食养生小贴士
          </h5>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {dietHealthTips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 四季五行身体养生 */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-teal-600 dark:text-teal-400">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
          </svg>
          四季五行身体养生
        </h3>
        
        <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900 dark:bg-opacity-20 border border-teal-200 dark:border-teal-700 rounded-lg">
          <p className="text-teal-800 dark:text-teal-300 text-sm">
            <strong>四季养生原理：</strong>根据中医'天人相应'理论，人体五脏与四季相应，不同季节有不同的养生重点。
            遵循四季五行规律，调整生活方式，可达到'春夏养阳，秋冬养阴'的养生效果。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 季节养生信息 */}
          <div className="bg-teal-50 dark:bg-teal-900 dark:bg-opacity-20 border border-teal-200 dark:border-teal-700 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-teal-800 dark:text-teal-300">
                  {getCurrentSeasonName(selectedDate)}季养生
                </h4>
                <p className="text-sm text-teal-600 dark:text-teal-400">当前季节的养生要点</p>
              </div>
            </div>
            
            <div className="ml-14">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">当季五行：</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 rounded-full text-sm font-medium text-teal-700 dark:text-teal-300">
                    {getCurrentSeasonElement(selectedDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">主令脏腑：</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-teal-300 dark:border-teal-600 rounded-full text-sm text-teal-700 dark:text-teal-300">
                    {getCurrentSeasonOrgans(selectedDate)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">季节特点：</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {getCurrentSeasonCharacteristics(selectedDate)}
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">养生建议：</h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
                {getCurrentSeasonAdvice(selectedDate).split('\n').map((line, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-teal-500 mr-2">•</span>
                    <span>{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 当前时辰器官节律 */}
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border border-purple-200 dark:border-purple-700 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300">当前时辰养生</h4>
                <p className="text-sm text-purple-600 dark:text-purple-400">此时段最佳养生方式</p>
              </div>
            </div>
            
            <div className="ml-14">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">当前时段：</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-600 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
                    {getCurrentOrganTime(new Date())}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">当令器官：</span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-600 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
                    {getCurrentOrgan(new Date())}
                  </span>
                </div>
              </div>
            
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">节律特点：</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {getCurrentOrganDescription(new Date())}
                </p>
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">养生建议：</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {getCurrentOrganSuggestion(new Date())}
                </p>
              </div>
              
              <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-3">
                <h5 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">健康提示：</h5>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {getCurrentOrganHealthTip(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 养生小贴士 */}
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900 dark:bg-opacity-20 border border-teal-200 dark:border-teal-700 rounded-lg">
          <h5 className="font-medium text-teal-800 dark:text-teal-300 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            四季养生小贴士
          </h5>
          <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
            {seasonGeneralTips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          温馨提示
        </h4>
        <div className="text-yellow-100 text-sm leading-relaxed">
          {warmReminders.map((reminder, index) => (
            <p key={index} className={index > 0 ? '' : 'mb-2'}>
              {reminder}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DressInfo;