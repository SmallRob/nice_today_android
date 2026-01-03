import { testApiConnection, fetchHistoryDates, fetchBiorhythmData, fetchDressInfoRange, 
         fetchSpecificDateDressInfo, fetchMayaCalendarRange, fetchSpecificDateMayaInfo, 
         fetchMayaHistory, fetchMayaBirthInfo } from './apiServiceRefactored';
import { getDressInfoRange, getSpecificDateDressInfo, getTodayDressInfo, 
         calculateBiorhythmData, getBiorhythmRange } from './localDataService';

// 解析CSV内容的辅助函数（保留用于兼容性）
export const parseCSV = (csvText) => {
  // 参数验证
  if (!csvText || typeof csvText !== 'string') {
    console.error('parseCSV: 无效的输入参数');
    return [];
  }

  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return []; // 至少需要标题行和一行数据
    
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      // 添加行级异常处理
      try {
        const values = lines[i].split(',').map(value => {
          // 移除字段值周围的引号
          let trimmedValue = value.trim();
          if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
            trimmedValue = trimmedValue.substring(1, trimmedValue.length - 1);
          }
          return trimmedValue;
        });
        
        if (values.length !== headers.length) continue; // 跳过格式不正确的行
        
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        
        data.push(entry);
      } catch (lineError) {
        console.warn(`解析CSV行 ${i} 失败:`, lineError.message);
        // 继续处理下一行，不中断整个解析
      }
    }
    
    return data;
  } catch (error) {
    console.error('CSV解析失败:', error);
    throw new Error(`CSV解析错误: ${error.message}`);
  }
};

// 解析CSV内容的辅助函数（保留用于兼容性）

/**
 * 器官节律数据缓存管理
 * 使用内存缓存避免重复加载，提升性能
 */
const organRhythmDataCache = {
  data: null,
  lastFetch: null,
  cacheDuration: 5 * 60 * 1000, // 5分钟缓存
  
  isValid() {
    if (!this.lastFetch) return false;
    const now = Date.now();
    return (now - this.lastFetch) < this.cacheDuration;
  },
  
  set(data) {
    this.data = data;
    this.lastFetch = Date.now();
  },
  
  get() {
    return this.data;
  },
  
  clear() {
    this.data = null;
    this.lastFetch = null;
  }
};

/**
 * 获取器官节律数据（优化版）
 * 
 * 性能优化说明：
 * 1. 优先加载 JSON 格式数据（比 CSV 解析更快）
 * 2. 实现内存缓存机制，避免重复加载
 * 3. 支持按需加载，只在需要时获取数据
 * 4. 提供完整的错误处理和备选数据
 * 
 * @returns {Promise<{success: boolean, data?: Array, error?: string, fallbackData?: Array}>}
 */
export const fetchOrganRhythmData = async () => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:100',message:'fetchOrganRhythmData called',data:{isElectron:typeof window.electronAPI!=='undefined',hasCache:organRhythmDataCache.isValid()},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    // 检查缓存是否有效
    if (organRhythmDataCache.isValid()) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:108',message:'Using cached data',data:{cacheAge:Date.now()-organRhythmDataCache.lastFetch},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      
      return {
        success: true,
        data: organRhythmDataCache.get()
      };
    }
    
    // 优先尝试 JSON 格式（更快的解析速度）
    const jsonPaths = [
      './data/organRhythmData.json',
      '/data/organRhythmData.json',
      'data/organRhythmData.json'
    ];
    
    let jsonData = null;
    let lastError = null;
    
    for (const path of jsonPaths) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:125',message:'Trying JSON path',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch(path);
        if (response.ok) {
          const result = await response.json();
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:132',message:'JSON loaded successfully',data:{path,version:result.version,recordCount:result.data?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          
          // 验证数据格式
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            // 缓存数据
            organRhythmDataCache.set(result.data);
            
            return {
              success: true,
              data: result.data,
              version: result.version,
              lastUpdated: result.lastUpdated
            };
          }
        }
      } catch (err) {
        lastError = err;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:149',message:'JSON path failed',data:{path,error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
      }
    }
    
    // 如果 JSON 加载失败，尝试 CSV 格式（向后兼容）
    const csvPaths = [
      './data/organRhythmData.csv',
      '/data/organRhythmData.csv',
      'data/organRhythmData.csv'
    ];
    
    for (const path of csvPaths) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:166',message:'Trying CSV path (fallback)',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        
        const response = await fetch(path);
        if (response.ok) {
          const csvText = await response.text();
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:173',message:'CSV loaded successfully',data:{path,csvLength:csvText.length},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          
          const data = parseCSV(csvText);
          
          if (data.length > 0) {
            const formattedData = data.map(item => ({
              timeRange: item['时间段'],
              organ: item['部位'],
              description: item['说明'],
              activities: item['建议活动'],
              tips: item['健康提示']
            }));
            
            // 缓存数据
            organRhythmDataCache.set(formattedData);
            
            return {
              success: true,
              data: formattedData,
              source: 'csv' // 标记数据来源
            };
          }
        }
      } catch (err) {
        lastError = err;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:197',message:'CSV path failed',data:{path,error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
      }
    }
    
    // 如果所有格式都加载失败，抛出错误
    throw new Error(`无法加载器官节律数据: ${lastError?.message || '所有路径都失败'}`);
    
  } catch (error) {
    console.error('获取器官节律数据失败:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/services/dataService.js:209',message:'Load failed, using fallback',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'csv-fix2',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    // 提供默认数据作为备选（完整的24小时数据）
    const fallbackData = [
      {
        timeRange: "01:00-03:00",
        organ: "肝胆",
        description: "肝胆经当令，解毒代谢最活跃的时间",
        activities: "保证充足睡眠，避免熬夜",
        tips: "熬夜会加重肝胆负担，影响第二天精神状态"
      },
      {
        timeRange: "03:00-05:00",
        organ: "肺",
        description: "肺经当令，气血循环活跃，适合呼吸系统调理",
        activities: "深度睡眠中自然呼吸",
        tips: "早起后深呼吸练习，有益肺部健康"
      },
      {
        timeRange: "05:00-07:00",
        organ: "大肠",
        description: "大肠经当令，排便最佳时间",
        activities: "起床后喝温水，养成定时排便习惯",
        tips: "便秘者可顺时针按摩腹部，促进肠道蠕动"
      },
      {
        timeRange: "07:00-09:00",
        organ: "胃",
        description: "胃经当令，消化吸收能力最强",
        activities: "享用营养均衡的早餐",
        tips: "避免冷饮和生冷食物，保护胃气"
      },
      {
        timeRange: "09:00-11:00",
        organ: "脾",
        description: "脾经当令，运化水湿，吸收营养",
        activities: "适合进行轻度办公和学习工作",
        tips: "避免过度思虑，久坐伤脾"
      },
      {
        timeRange: "11:00-13:00",
        organ: "心",
        description: "心经当令，阳气最盛，血液循环最活跃",
        activities: "午休15-30分钟，养心安神",
        tips: "避免剧烈运动和情绪激动"
      },
      {
        timeRange: "13:00-15:00",
        organ: "小肠",
        description: "小肠经当令，分清泌浊，吸收精华",
        activities: "午餐后慢走，帮助消化",
        tips: "避免暴饮暴食，给小肠减负"
      },
      {
        timeRange: "15:00-17:00",
        organ: "膀胱",
        description: "膀胱经当令，排泄废物，排毒最佳时间",
        activities: "适量饮水，促进排尿排毒",
        tips: "憋尿会损伤膀胱功能，影响肾脏"
      },
      {
        timeRange: "17:00-19:00",
        organ: "肾",
        description: "肾经当令，藏精固本，储存能量",
        activities: "适合进行轻松的社交活动",
        tips: "避免过度劳累，耗损肾气"
      },
      {
        timeRange: "19:00-21:00",
        organ: "心包",
        description: "心包经当令，保护心脏，调节情绪",
        activities: "轻松的晚餐和家庭时间",
        tips: "晚餐宜清淡，避免过饱"
      },
      {
        timeRange: "21:00-23:00",
        organ: "三焦",
        description: "三焦经当令，协调各脏腑功能",
        activities: "准备入睡，营造良好睡眠环境",
        tips: "避免睡前使用电子产品"
      },
      {
        timeRange: "23:00-01:00",
        organ: "胆",
        description: "胆经当令，决断能力最强，胆汁分泌旺盛",
        activities: "进入深度睡眠，胆汁正常分泌",
        tips: "深夜进食会增加胆囊负担"
      }
    ];
    
    return {
      success: false,
      error: error.message,
      fallbackData
    };
  }
};

/**
 * 清除器官节律数据缓存
 * 用于在数据更新或需要重新加载时清除缓存
 */
export const clearOrganRhythmDataCache = () => {
  organRhythmDataCache.clear();
  console.log('器官节律数据缓存已清除');
};

/**
 * 预加载器官节律数据
 * 在应用启动时或需要时提前加载数据
 */
export const preloadOrganRhythmData = async () => {
  try {
    const result = await fetchOrganRhythmData();
    console.log('器官节律数据预加载完成:', result.success ? '成功' : '失败');
    return result;
  } catch (error) {
    console.warn('器官节律数据预加载失败:', error);
    return { success: false, error: error.message };
  }
};