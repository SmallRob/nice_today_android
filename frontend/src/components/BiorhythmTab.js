import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BiorhythmChart from './BiorhythmChart';
import BiorhythmInfo from './BiorhythmInfo';
import DailySuggestions from './DailySuggestions';
import { fetchHistoryDates, fetchBiorhythmData } from '../services/apiService';
import { desktopBiorhythmService, isDesktopApp } from '../services/desktopService';
import elementConfig from '../config/elementConfig.json';

// 自定义日期选择器样式
import "./DatePickerStyles.css";

const BiorhythmTab = ({ apiBaseUrl, apiConnected, serviceStatus, isDesktop }) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:13',message:'BiorhythmTab mounted',data:{hasApiBaseUrl:!!apiBaseUrl,hasApiConnected:apiConnected!==undefined,apiConnected,hasServiceStatus:serviceStatus!==undefined,serviceStatus,hasIsDesktop:isDesktop!==undefined,isDesktop,hasElectronAPI:typeof window.electronAPI!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // 从localStorage获取上次使用的出生日期
  const getStoredBirthDate = () => {
    try {
      const stored = localStorage.getItem('last_biorhythm_birthdate');
      return stored ? new Date(stored) : null;
    } catch (error) {
      console.error('获取存储的出生日期失败:', error);
      return null;
    }
  };
  
  // 保存出生日期到localStorage
  const saveBirthDate = (date) => {
    try {
      if (date) {
        localStorage.setItem('last_biorhythm_birthdate', formatDateLocal(date));
      }
    } catch (error) {
      console.error('保存出生日期失败:', error);
    }
  };
  
  const [birthDate, setBirthDate] = useState(getStoredBirthDate());
  const [rhythmData, setRhythmData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [futureData, setFutureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyDates, setHistoryDates] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDefaultDate, setIsDefaultDate] = useState(false);

  // 从配置文件获取默认出生日期
  const DEFAULT_BIRTH_DATE = elementConfig.defaultBirthDate || "1991-01-01";

  // 本地日期格式化方法，避免时区问题
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

// 本地日期解析方法，按用户输入的日期直接计算节律
const parseDateLocal = (dateStr) => {
  if (!dateStr) return null;
  // 对于YYYY-MM-DD格式的日期，使用本地时间（东八区）解析
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 月份从0开始
    const day = parseInt(parts[2], 10);
    
    // 使用本地时间创建日期，按照用户输入的日期直接计算节律
    // 不涉及时区转换，与当前时间无关
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

  // 使用 useRef 来存储最新的 loadBiorhythmData 函数引用
  const loadBiorhythmDataRef = useRef(null);

  // 获取历史记录
  const loadHistoryDates = useCallback(async () => {
    if (isDesktop && isDesktopApp()) {
      try {
        // 在桌面环境下，通过Electron API获取历史记录
        const historyResult = await window.electronAPI.biorhythm.getHistory();
        if (historyResult.success && historyResult.data) {
          setHistoryDates(historyResult.data);
        }
      } catch (error) {
        console.error('获取历史记录失败:', error);
      }
    } else if (apiBaseUrl) {
      // Web环境下使用原有的API
      const historyResult = await fetchHistoryDates(apiBaseUrl);
      if (historyResult.success) {
        setHistoryDates(historyResult.history);
      }
    }
  }, [isDesktop, apiBaseUrl]);

  // 加载生物节律数据
  const loadBiorhythmData = useCallback(async (selectedDate = null) => {
    // 使用函数参数或当前状态
    const dateToUse = selectedDate || birthDate;
    
    if (!dateToUse) {
      setError("请选择出生日期");
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:40',message:'loadBiorhythmData called',data:{hasApiBaseUrl:!!apiBaseUrl,apiConnected,hasDateToUse:!!dateToUse,isDesktop,serviceStatus,hasElectronAPI:typeof window.electronAPI!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // 检查服务是否可用
    // 在Electron环境中，只要electronAPI存在且就绪就尝试使用（不依赖serviceStatus，因为它可能还没更新）
    const canUseService = isDesktop && isDesktopApp()
      ? (window.electronAPI && window.electronAPI.isReady && window.electronAPI.isReady())
      : (apiConnected && apiBaseUrl);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:49',message:'Service check in loadBiorhythmData',data:{canUseService,isDesktop,serviceStatus,hasElectronAPI:typeof window.electronAPI!=='undefined',apiReady:window.electronAPI?.isReady?.()||false},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    if (!canUseService) {
      setError(isDesktop ? "桌面服务未就绪，无法获取数据" : "后端API未连接，无法获取数据");
      return;
    }

    setLoading(true);
    setError(null);

    let result;
    if (isDesktop && isDesktopApp()) {
      // 使用桌面服务
      const birthDateStr = typeof dateToUse === 'string' 
        ? dateToUse 
        : formatDateLocal(dateToUse);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:64',message:'Calling desktop services',data:{birthDateStr},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      // 获取今日数据
      const todayResult = await desktopBiorhythmService.getToday(birthDateStr);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:69',message:'Today result',data:{success:todayResult.success,hasData:!!todayResult.data,dataKeys:todayResult.data?Object.keys(todayResult.data):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      // 获取范围数据（用于图表）
      const rangeResult = await desktopBiorhythmService.getRange(birthDateStr, 10, 20);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:73',message:'Range result',data:{success:rangeResult.success,hasData:!!rangeResult.data},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      // 获取7天后数据
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = formatDateLocal(futureDate);
      const futureResult = await desktopBiorhythmService.getDate(birthDateStr, futureDateStr);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:79',message:'Future result',data:{success:futureResult.success,hasData:!!futureResult.data},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      if (todayResult.success && rangeResult.success && futureResult.success) {
        // desktopBiorhythmService现在直接返回IPC结果，格式是{success: true, data: actualData}
        const todayData = todayResult.data;
        const rangeData = rangeResult.data;
        const futureData = futureResult.data;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:87',message:'Data extracted',data:{hasTodayData:!!todayData,hasRangeData:!!rangeData,hasFutureData:!!futureData,todayDataKeys:todayData?Object.keys(todayData):[],rangeDataType:Array.isArray(rangeData)?'array':typeof rangeData},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix2',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        
        result = {
          success: true,
          rhythmData: rangeData,
          todayData: todayData,
          futureData: futureData
        };
      } else {
        result = {
          success: false,
          error: todayResult.error || rangeResult.error || futureResult.error || "获取数据失败"
        };
      }
    } else {
      // 使用Web API
      result = await fetchBiorhythmData(apiBaseUrl, dateToUse);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:75',message:'Data fetch result',data:{success:result.success,hasError:!!result.error,isDesktop},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (result.success) {
      setRhythmData(result.rhythmData);
      setTodayData(result.todayData);
      setFutureData(result.futureData);
      
      // 更新历史记录
      if (!isDefaultDate) {
        setIsDefaultDate(false);
        
        if (isDesktop && isDesktopApp()) {
          // 在桌面环境下，历史记录会自动通过后端服务保存
          // 这里只需要更新前端的历史记录显示
          await loadHistoryDates();
        } else if (apiBaseUrl) {
          // Web环境下使用原有的API
          const historyResult = await fetchHistoryDates(apiBaseUrl);
          if (historyResult.success) {
            setHistoryDates(historyResult.history);
          }
        }
      }
      
      // 如果是字符串日期，转换为Date对象并更新birthDate
      if (typeof dateToUse === 'string') {
        const dateObj = parseDateLocal(dateToUse);
        setBirthDate(dateObj);
        // 保存到localStorage，但仅当不是默认日期时
        if (!isDefaultDate) {
          saveBirthDate(dateObj);
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    setShowHistory(false); // 隐藏历史记录下拉菜单
  }, [apiBaseUrl, apiConnected, birthDate, isDefaultDate, DEFAULT_BIRTH_DATE, isDesktop, serviceStatus]);

  // 更新 ref 以保存最新的 loadBiorhythmData 函数
  useEffect(() => {
    loadBiorhythmDataRef.current = loadBiorhythmData;
  }, [loadBiorhythmData]);

  // 组件挂载时自动加载默认数据
  useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:160',message:'waitForService started',data:{isDesktop,serviceStatus,hasElectronAPI:typeof window.electronAPI!=='undefined',apiReady:window.electronAPI?.isReady?.()||false,apiBaseUrl:!!apiBaseUrl,apiConnected},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      // 先尝试加载历史记录，以便获取最近一次查询的出生日期
      if (isDesktop || apiBaseUrl) {
        await loadHistoryDates();
      }
      
      // 等待最多5秒让服务就绪
      let attempts = 0;
      const maxAttempts = 50; // 5秒 (50 * 100ms)
      
      while (attempts < maxAttempts) {
        // 在Electron环境中，只要electronAPI存在且就绪，就尝试加载（不依赖serviceStatus，因为它可能还没更新）
        const canUseService = isDesktop && isDesktopApp()
          ? (window.electronAPI && window.electronAPI.isReady && window.electronAPI.isReady())
          : (apiBaseUrl && apiConnected);
        
        // #region agent log
        if (attempts % 10 === 0) { // 每1秒记录一次
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:170',message:'waitForService check',data:{attempts,canUseService,hasLoadBiorhythmDataRef:!!loadBiorhythmDataRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
        }
        // #endregion
        
        if (canUseService && loadBiorhythmDataRef.current) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:175',message:'Service ready, loading data',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          // 使用 setTimeout 确保在下一个事件循环中执行，避免初始化时的循环调用
          const timer = setTimeout(() => {
            loadDefaultData();
          }, 0);
          return () => clearTimeout(timer);
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载（Electron环境）
      if (isDesktop && isDesktopApp() && window.electronAPI) {
        console.warn('服务未及时就绪，但仍尝试加载数据');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:190',message:'Max attempts reached, trying anyway',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        if (loadBiorhythmDataRef.current) {
          const timer = setTimeout(() => {
            loadDefaultData();
          }, 0);
          return () => clearTimeout(timer);
        }
      }
    };
    
    waitForService();
  }, [isDesktop, serviceStatus, apiBaseUrl, apiConnected, DEFAULT_BIRTH_DATE, loadHistoryDates]);

  
  // 加载默认数据
  const loadDefaultData = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:200',message:'loadDefaultData called',data:{hasBirthDate:!!birthDate,isDesktop,serviceStatus,historyDatesLength:historyDates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    try {
      // 优先使用历史记录中最近的日期，其次是当前组件中的日期，然后是localStorage中的日期，再然后是后端默认日期，最后才是配置文件默认日期
      let dateToUse = birthDate;
      let shouldMarkAsDefault = false;
      
      // 如果没有当前日期，但历史记录中有数据，使用历史记录中最新的日期
      if (!dateToUse && historyDates.length > 0) {
        dateToUse = parseDateLocal(historyDates[0]);
        shouldMarkAsDefault = false; // 这是用户的真实选择，不是默认值
      }
      
      // 如果仍然没有日期，尝试从localStorage获取
      if (!dateToUse) {
        dateToUse = getStoredBirthDate();
        if (dateToUse) {
          shouldMarkAsDefault = false; // 这是用户之前选择的日期，不是默认值
        }
      }
      
      // 如果仍然没有日期，尝试从后端获取默认日期
      if (!dateToUse && isDesktop && isDesktopApp()) {
        try {
          const result = await desktopBiorhythmService.getDefaultBirthdate();
          if (result.success && result.data) {
            dateToUse = parseDateLocal(result.data);
            shouldMarkAsDefault = false; // 这是用户历史记录中的日期，不是默认值
            console.log('从后端获取到默认出生日期:', result.data);
          }
        } catch (error) {
          console.warn('从后端获取默认出生日期失败:', error);
        }
      }
      
      // 如果仍然没有日期，使用默认日期
      if (!dateToUse) {
        dateToUse = new Date(DEFAULT_BIRTH_DATE);
        shouldMarkAsDefault = true;
      }
      
      setBirthDate(dateToUse);
      setIsDefaultDate(shouldMarkAsDefault);
      await loadBiorhythmData(dateToUse);
    } catch (error) {
      console.error('加载默认数据失败:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/components/BiorhythmTab.js:212',message:'loadDefaultData error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix3',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      setError('加载数据失败: ' + error.message);
    }
  };

  // 处理日期选择变化
  const handleDateChange = (date) => {
    setBirthDate(date);
    setIsDefaultDate(false);
    // 保存用户选择的日期到localStorage
    saveBirthDate(date);
    
    // 当用户选择日期后立即查询
    const canUseService = isDesktop 
      ? (serviceStatus && isDesktopApp()) 
      : (apiConnected && apiBaseUrl);
    
    if (date && canUseService) {
      loadBiorhythmData(date);
    }
  };

  // 格式化日期显示
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">输入您的出生日期</h2>
        {isDefaultDate && (
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-4">
            <p className="text-blue-700 dark:text-blue-300">
              当前显示的是默认出生日期（1991年1月1日）的生物节律数据。请选择您的实际出生日期以获取个性化分析。
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="datepicker-container relative">
            <DatePicker
              selected={birthDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="选择出生日期"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              popperClassName="datepicker-popper"
              popperPlacement="bottom-start"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    rootBoundary: "viewport",
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadBiorhythmData()}
              disabled={loading || !birthDate || (isDesktop ? !serviceStatus : !apiConnected)}
              className={`px-4 py-2 rounded-md text-white ${loading || !birthDate || (isDesktop ? !serviceStatus : !apiConnected) ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}
            >
              {loading ? '加载中...' : '分析节律'}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                disabled={loading || historyDates.length === 0}
                className={`px-4 py-2 rounded-md text-white ${loading || historyDates.length === 0 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'}`}
              >
                历史记录
              </button>
              
              {showHistory && historyDates.length > 0 && (
                <div className="absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                  <div className="py-1">
                    {historyDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => loadBiorhythmData(date)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>}
      </div>
      
      {rhythmData && todayData && (
        <>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">您的生物节律图表</h2>
            <BiorhythmChart data={rhythmData} />
          </div>
          
          <div className="space-y-6">
            <DailySuggestions 
              rhythmData={todayData} 
              birthDate={birthDate ? birthDate.toISOString().split('T')[0] : null} 
            />
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">生物节律科学依据</h2>
              <BiorhythmInfo 
                data={todayData} 
                title="今日" 
                birthDate={birthDate ? birthDate.toISOString().split('T')[0] : null} 
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">7天后节律</h2>
              <BiorhythmInfo 
                data={futureData} 
                title="7天后" 
                birthDate={birthDate ? birthDate.toISOString().split('T')[0] : null} 
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BiorhythmTab;