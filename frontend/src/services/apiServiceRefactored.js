import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

// 格式化日期为YYYY-MM-DD，确保时区一致
export const formatDateString = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 测试API连接
export const testApiConnection = async (baseUrl) => {
  try {
    console.log("尝试连接API:", baseUrl);
    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    
    // 尝试访问API根路径
    const response = await apiClient.get(`${baseUrl}/?_=${timestamp}`);
    console.log("API连接成功:", response);
    
    return {
      success: true,
      url: baseUrl,
      message: "API连接成功"
    };
  } catch (err) {
    console.error("API连接失败:", err);
    return {
      success: false,
      error: `无法连接到后端服务 (${baseUrl})。请确保后端服务已启动，并检查网络连接。错误详情: ${err.message}`,
      errorDetails: {
        message: err.message,
        baseUrl: baseUrl,
        env: process.env.NODE_ENV,
        backendPort: process.env.REACT_APP_BACKEND_PORT || '未设置'
      }
    };
  }
};

// 获取历史记录
export const fetchHistoryDates = async (apiBaseUrl) => {
  try {
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.BIORHYTHM.HISTORY}`);
    
    if (response && response.history) {
      return {
        success: true,
        history: response.history
      };
    }
    
    return {
      success: false,
      error: "获取历史记录失败：API返回无效数据"
    };
  } catch (err) {
    console.error("获取历史记录失败:", err);
    return {
      success: false,
      error: `获取历史记录失败：${err.message}`
    };
  }
};

// 获取生物节律数据
export const fetchBiorhythmData = async (apiBaseUrl, birthDate) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算
    console.log("使用本地计算生物节律数据");
    const localDataService = await import('./localDataService');
    
    try {
      // 获取图表数据
      const chartResult = await localDataService.getBiorhythmRange(birthDate, 10, 20);
      
      // 获取今天的数据
      const today = new Date();
      const todayResult = await localDataService.calculateBiorhythmData(birthDate, today);
      
      // 获取10天后的数据
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureResult = await localDataService.calculateBiorhythmData(birthDate, futureDate);
      
      if (chartResult.success && todayResult.success && futureResult.success) {
        return {
          success: true,
          rhythmData: chartResult.rhythmData,
          todayData: todayResult.data,
          futureData: futureResult.data
        };
      } else {
        throw new Error('本地计算失败');
      }
    } catch (localErr) {
      console.error("本地计算生物节律数据失败:", localErr);
      return {
        success: false,
        error: `本地计算失败，请稍后再试。错误详情: ${localErr.message}`
      };
    }
  }
  
  if (!birthDate) {
    return {
      success: false,
      error: "请选择出生日期"
    };
  }

  try {
    // 格式化日期为 YYYY-MM-DD，确保时区一致
    const birthDateStr = typeof birthDate === 'string' 
      ? birthDate 
      : formatDateString(birthDate);
    
    console.log("正在请求API:", apiBaseUrl, "出生日期:", birthDateStr);
    
    // 获取图表数据
    const chartResponse = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.BIORHYTHM.RANGE}`, {
      birth_date: birthDateStr,
      days_before: 10,
      days_after: 20
    });
    
    // 获取今天的数据
    const todayResponse = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.BIORHYTHM.TODAY}`, {
      birth_date: birthDateStr
    });
    
    // 获取10天后的数据
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateStr = formatDateString(futureDate);
    
    const futureResponse = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.BIORHYTHM.DATE}`, {
      birth_date: birthDateStr,
      date: futureDateStr
    });
    
    return {
      success: true,
      rhythmData: chartResponse,
      todayData: todayResponse,
      futureData: futureResponse
    };
  } catch (err) {
    console.error("获取数据失败:", err);
    return {
      success: false,
      error: `获取数据失败，请稍后再试。错误详情: ${err.message}`
    };
  }
};

// 获取穿衣与饮食指南范围数据
export const fetchDressInfoRange = async (apiBaseUrl) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算
    console.log("使用本地计算穿衣信息范围数据");
    const localDataService = await import('./localDataService');
    
    try {
      const result = await localDataService.getDressInfoRange(1, 6);
      if (result.success) {
        return {
          success: true,
          dressInfoList: result.dressInfoList,
          dateRange: result.dateRange
        };
      } else {
        throw new Error('本地计算失败');
      }
    } catch (localErr) {
      console.error("本地计算穿衣信息范围数据失败:", localErr);
      return {
        success: false,
        error: `本地计算失败，请稍后再试。错误详情: ${localErr.message}`
      };
    }
  }
  
  try {
    console.log("正在请求穿衣信息范围API:", `${apiBaseUrl}${API_ENDPOINTS.DRESS.RANGE}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.DRESS.RANGE}`, {
      days_before: 1,  // 昨天
      days_after: 6    // 未来6天
    });
    
    return {
      success: true,
      dressInfoList: response.dress_info_list,
      dateRange: {
        start: new Date(response.date_range.start),
        end: new Date(response.date_range.end)
      }
    };
  } catch (err) {
    console.error("获取穿衣信息范围失败:", err);
    return {
      success: false,
      error: "获取穿衣信息失败，请稍后再试"
    };
  }
};

// 获取特定日期的穿衣信息
export const fetchSpecificDateDressInfo = async (apiBaseUrl, dateStr) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算
    console.log("使用本地计算特定日期穿衣信息");
    const localDataService = await import('./localDataService');
    
    try {
      const result = await localDataService.getSpecificDateDressInfo(dateStr);
      if (result.success) {
        return {
          success: true,
          dressInfo: result.dressInfo
        };
      } else {
        throw new Error('本地计算失败');
      }
    } catch (localErr) {
      console.error(`本地计算${dateStr}的穿衣信息失败:`, localErr);
      return {
        success: false,
        error: `本地计算失败，请稍后再试。错误详情: ${localErr.message}`
      };
    }
  }
  
  try {
    console.log(`正在请求特定日期穿衣信息:`, `${apiBaseUrl}${API_ENDPOINTS.DRESS.DATE}?date=${dateStr}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.DRESS.DATE}`, {
      date: dateStr
    });
    
    return {
      success: true,
      dressInfo: response
    };
  } catch (err) {
    console.error(`获取${dateStr}的穿衣信息失败:`, err);
    return {
      success: false,
      error: `获取${dateStr}的穿衣信息失败，请检查后端服务是否正常运行`
    };
  }
};

// 获取玛雅日历数据范围
export const fetchMayaCalendarRange = async (apiBaseUrl) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算（这里可以实现玛雅日历的本地计算逻辑）
    console.log("使用本地计算玛雅日历范围数据（模拟）");
    
    // 返回模拟数据以便前端开发
    console.log("本地计算，返回模拟数据");
    
    // 生成7天的模拟数据
    const generateMockData = (daysOffset) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      const dateStr = formatDateString(date);
      const weekday = "星期" + "日一二三四五六".charAt(date.getDay());
      
      const mayaSeals = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
      const mayaTones = ["磁性之月", "月亮之月", "电子之月", "自我存在之月", "倍音之月", "韵律之月", "共振之月", "银河之月", "太阳之月", "行星之月", "光谱之月", "水晶之月", "宇宙之月"];
      const luckyColors = ["银色", "蓝色", "绿色", "红色", "黄色", "紫色", "白色", "黑色"];
      const luckyFoods = ["牛奶", "苹果", "坚果", "蜂蜜", "绿茶", "燕麦", "香蕉", "红枣", "山药", "莲子"];
      
      return {
        date: dateStr,
        weekday: weekday,
        maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
        maya_tone: mayaTones[Math.floor(Math.random() * mayaTones.length)] + " | 第" + (Math.floor(Math.random() * 28) + 1) + "天",
        maya_seal: mayaSeals[Math.floor(Math.random() * mayaSeals.length)],
        maya_seal_desc: mayaTones[Math.floor(Math.random() * mayaTones.length)].replace('之月', '的') + mayaSeals[Math.floor(Math.random() * mayaSeals.length)],
        suggestions: {
          建议: ["发现万物之美", "泡茶读书", "双重保障", "冥想", "户外活动", "创作艺术"],
          避免: ["苛求完美", "顺其自然", "头脑混乱", "过度消费", "情绪化决策"]
        },
        lucky_items: {
          幸运色: luckyColors[Math.floor(Math.random() * luckyColors.length)],
          幸运数字: Math.floor(Math.random() * 10) + ", " + Math.floor(Math.random() * 10),
          幸运食物: luckyFoods[Math.floor(Math.random() * luckyFoods.length)]
        },
        daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
        daily_quote: {
          content: "《美丽人生》",
          author: "罗伯托·贝尼尼"
        },
        energy_scores: {
          综合: Math.floor(Math.random() * 40) + 60,
          爱情: Math.floor(Math.random() * 40) + 60,
          财富: Math.floor(Math.random() * 40) + 60,
          事业: Math.floor(Math.random() * 40) + 60,
          学习: Math.floor(Math.random() * 40) + 60
        }
      };
    };
    
    // 生成7天的数据（前3天 + 今天 + 后3天）
    const mockData = [];
    for (let i = -3; i <= 3; i++) {
      mockData.push(generateMockData(i));
    }
    
    return {
      success: true,
      mayaInfoList: mockData,
      dateRange: {
        start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    };
  }
  
  try {
    console.log("正在请求玛雅日历范围API:", `${apiBaseUrl}${API_ENDPOINTS.MAYA.RANGE}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.MAYA.RANGE}`, {
      days_before: 3,  // 前3天
      days_after: 3    // 后3天
    });
    
    return {
      success: true,
      mayaInfoList: response.maya_info_list,
      dateRange: {
        start: new Date(response.date_range.start),
        end: new Date(response.date_range.end)
      }
    };
  } catch (err) {
    console.error("获取玛雅日历范围失败:", err);
    
    // 返回模拟数据以便前端开发
    console.log("API请求失败，返回模拟数据");
    
    // 生成7天的模拟数据
    const generateMockData = (daysOffset) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      const dateStr = formatDateString(date);
      const weekday = "星期" + "日一二三四五六".charAt(date.getDay());
      
      const mayaSeals = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
      const mayaTones = ["磁性之月", "月亮之月", "电子之月", "自我存在之月", "倍音之月", "韵律之月", "共振之月", "银河之月", "太阳之月", "行星之月", "光谱之月", "水晶之月", "宇宙之月"];
      const luckyColors = ["银色", "蓝色", "绿色", "红色", "黄色", "紫色", "白色", "黑色"];
      const luckyFoods = ["牛奶", "苹果", "坚果", "蜂蜜", "绿茶", "燕麦", "香蕉", "红枣", "山药", "莲子"];
      
      return {
        date: dateStr,
        weekday: weekday,
        maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
        maya_tone: mayaTones[Math.floor(Math.random() * mayaTones.length)] + " | 第" + (Math.floor(Math.random() * 28) + 1) + "天",
        maya_seal: mayaSeals[Math.floor(Math.random() * mayaSeals.length)],
        maya_seal_desc: mayaTones[Math.floor(Math.random() * mayaTones.length)].replace('之月', '的') + mayaSeals[Math.floor(Math.random() * mayaSeals.length)],
        suggestions: {
          建议: ["发现万物之美", "泡茶读书", "双重保障", "冥想", "户外活动", "创作艺术"],
          避免: ["苛求完美", "顺其自然", "头脑混乱", "过度消费", "情绪化决策"]
        },
        lucky_items: {
          幸运色: luckyColors[Math.floor(Math.random() * luckyColors.length)],
          幸运数字: Math.floor(Math.random() * 10) + ", " + Math.floor(Math.random() * 10),
          幸运食物: luckyFoods[Math.floor(Math.random() * luckyFoods.length)]
        },
        daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
        daily_quote: {
          content: "《美丽人生》",
          author: "罗伯托·贝尼尼"
        },
        energy_scores: {
          综合: Math.floor(Math.random() * 40) + 60,
          爱情: Math.floor(Math.random() * 40) + 60,
          财富: Math.floor(Math.random() * 40) + 60,
          事业: Math.floor(Math.random() * 40) + 60,
          学习: Math.floor(Math.random() * 40) + 60
        }
      };
    };
    
    // 生成7天的数据（前3天 + 今天 + 后3天）
    const mockData = [];
    for (let i = -3; i <= 3; i++) {
      mockData.push(generateMockData(i));
    }
    
    return {
      success: true,
      mayaInfoList: mockData,
      dateRange: {
        start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    };
  }
};

// 获取特定日期的玛雅日历信息
export const fetchSpecificDateMayaInfo = async (apiBaseUrl, dateStr) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算（这里可以实现玛雅日历的本地计算逻辑）
    console.log(`使用本地计算${dateStr}的玛雅日历信息（模拟）`);
    
    // 返回模拟数据
    return {
      success: true,
      mayaInfo: {
        date: dateStr,
        weekday: "星期" + "日一二三四五六".charAt(new Date(dateStr).getDay()),
        maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
        maya_tone: ["磁性之月", "月亮之月", "电子之月", "自我存在之月", "倍音之月", "韵律之月", "共振之月", "银河之月", "太阳之月", "行星之月", "光谱之月", "水晶之月", "宇宙之月"][Math.floor(Math.random() * 13)] + " | 第" + (Math.floor(Math.random() * 28) + 1) + "天",
        maya_seal: ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
        maya_seal_desc: ["光谱的", "磁性的", "月亮的", "电子的", "自我存在的", "倍音的", "韵律的", "共振的", "银河的", "太阳的", "行星的", "光谱的", "水晶的", "宇宙的"][Math.floor(Math.random() * 13)] + ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
        suggestions: {
          建议: ["发现万物之美", "泡茶读书", "双重保障", "冥想", "户外活动", "创作艺术"],
          避免: ["苛求完美", "顺其自然", "头脑混乱", "过度消费", "情绪化决策"]
        },
        lucky_items: {
          幸运色: ["银色", "蓝色", "绿色", "红色", "黄色", "紫色", "白色", "黑色"][Math.floor(Math.random() * 8)],
          幸运数字: Math.floor(Math.random() * 10) + ", " + Math.floor(Math.random() * 10),
          幸运食物: ["牛奶", "苹果", "坚果", "蜂蜜", "绿茶", "燕麦", "香蕉", "红枣", "山药", "莲子"][Math.floor(Math.random() * 10)]
        },
        daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
        daily_quote: {
          content: "《美丽人生》",
          author: "罗伯托·贝尼尼"
        },
        energy_scores: {
          综合: Math.floor(Math.random() * 40) + 60,
          爱情: Math.floor(Math.random() * 40) + 60,
          财富: Math.floor(Math.random() * 40) + 60,
          事业: Math.floor(Math.random() * 40) + 60,
          学习: Math.floor(Math.random() * 40) + 60
        }
      }
    };
  }
  
  try {
    console.log(`正在请求特定日期玛雅日历信息:`, `${apiBaseUrl}${API_ENDPOINTS.MAYA.DATE}?date=${dateStr}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.MAYA.DATE}`, {
      date: dateStr
    });
    
    return {
      success: true,
      mayaInfo: response
    };
  } catch (err) {
    console.error(`获取${dateStr}的玛雅日历信息失败:`, err);
    
    // 返回模拟数据
    return {
      success: true,
      mayaInfo: {
        date: dateStr,
        weekday: "星期" + "日一二三四五六".charAt(new Date(dateStr).getDay()),
        maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
        maya_tone: ["磁性之月", "月亮之月", "电子之月", "自我存在之月", "倍音之月", "韵律之月", "共振之月", "银河之月", "太阳之月", "行星之月", "光谱之月", "水晶之月", "宇宙之月"][Math.floor(Math.random() * 13)] + " | 第" + (Math.floor(Math.random() * 28) + 1) + "天",
        maya_seal: ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
        maya_seal_desc: ["光谱的", "磁性的", "月亮的", "电子的", "自我存在的", "倍音的", "韵律的", "共振的", "银河的", "太阳的", "行星的", "光谱的", "水晶的", "宇宙的"][Math.floor(Math.random() * 13)] + ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
        suggestions: {
          建议: ["发现万物之美", "泡茶读书", "双重保障", "冥想", "户外活动", "创作艺术"],
          避免: ["苛求完美", "顺其自然", "头脑混乱", "过度消费", "情绪化决策"]
        },
        lucky_items: {
          幸运色: ["银色", "蓝色", "绿色", "红色", "黄色", "紫色", "白色", "黑色"][Math.floor(Math.random() * 8)],
          幸运数字: Math.floor(Math.random() * 10) + ", " + Math.floor(Math.random() * 10),
          幸运食物: ["牛奶", "苹果", "坚果", "蜂蜜", "绿茶", "燕麦", "香蕉", "红枣", "山药", "莲子"][Math.floor(Math.random() * 10)]
        },
        daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
        daily_quote: {
          content: "《美丽人生》",
          author: "罗伯托·贝尼尼"
        },
        energy_scores: {
          综合: Math.floor(Math.random() * 40) + 60,
          爱情: Math.floor(Math.random() * 40) + 60,
          财富: Math.floor(Math.random() * 40) + 60,
          事业: Math.floor(Math.random() * 40) + 60,
          学习: Math.floor(Math.random() * 40) + 60
        }
      }
    };
  }
};

// 获取玛雅历史记录
export const fetchMayaHistory = async (apiBaseUrl) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算（这里可以实现玛雅历史记录的本地计算逻辑）
    console.log("使用本地计算玛雅历史记录（模拟）");
    
    // 尝试从本地存储获取历史记录
    try {
      const mayaHistoryStr = localStorage.getItem('mayaCalendarHistory');
      if (mayaHistoryStr) {
        const history = JSON.parse(mayaHistoryStr);
        if (Array.isArray(history) && history.length > 0) {
          return {
            success: true,
            history: history
          };
        }
      }
    } catch (localErr) {
      console.error("从本地存储获取玛雅历史记录失败:", localErr);
    }
    
    return {
      success: false,
      error: "获取玛雅历史记录失败，请稍后再试"
    };
  }
  
  try {
    console.log("正在请求玛雅历史记录API:", `${apiBaseUrl}${API_ENDPOINTS.MAYA.HISTORY}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.MAYA.HISTORY}`);
    
    if (response && response.history) {
      return {
        success: true,
        history: response.history
      };
    }
  } catch (err) {
    console.error("获取玛雅历史记录失败:", err);
  }
  
  // 尝试从本地存储获取历史记录
  try {
    const mayaHistoryStr = localStorage.getItem('mayaCalendarHistory');
    if (mayaHistoryStr) {
      const history = JSON.parse(mayaHistoryStr);
      if (Array.isArray(history) && history.length > 0) {
        return {
          success: true,
          history: history
        };
      }
    }
  } catch (localErr) {
    console.error("从本地存储获取玛雅历史记录失败:", localErr);
  }
  
  return {
    success: false,
    error: "获取玛雅历史记录失败，请稍后再试"
  };
};

// 获取出生日期的玛雅日历信息
export const fetchMayaBirthInfo = async (apiBaseUrl, birthDateStr) => {
  // 检查是否启用本地计算
  const useLocalCalculation = localStorage.getItem('useLocalCalculation') === 'true';
  
  if (useLocalCalculation) {
    // 使用本地计算（这里可以实现玛雅出生信息的本地计算逻辑）
    console.log(`使用本地计算出生日期${birthDateStr}的玛雅日历信息（模拟）`);
    
    // 所有API尝试都失败，返回错误信息让前端使用本地计算
    console.log('使用本地计算方法');
    return {
      success: false,
      error: "使用本地计算方法"
    };
  }
  
  if (!birthDateStr) {
    return {
      success: false,
      error: "请选择出生日期"
    };
  }

  try {
    // 首先尝试新的玛雅出生图API (POST请求)
    console.log(`正在请求玛雅出生图API: ${apiBaseUrl}${API_ENDPOINTS.MAYA.BIRTH_INFO}, 日期: ${birthDateStr}`);
    
    const response = await apiClient.post(`${apiBaseUrl}${API_ENDPOINTS.MAYA.BIRTH_INFO}`, {
      birth_date: birthDateStr
    });
    
    if (response && response.success && response.birthInfo) {
      console.log('玛雅出生图API返回成功:', response.birthInfo);
      return {
        success: true,
        birthInfo: response.birthInfo
      };
    }
  } catch (mayaApiErr) {
    console.error('玛雅出生图API请求失败:', mayaApiErr);
  }
  
  try {
    console.log(`正在请求出生日期玛雅日历信息:`, `${apiBaseUrl}${API_ENDPOINTS.MAYA.BIRTH}?birth_date=${birthDateStr}`);
    const response = await apiClient.get(`${apiBaseUrl}${API_ENDPOINTS.MAYA.BIRTH}`, {
      birth_date: birthDateStr
    });
    
    return {
      success: true,
      birthInfo: response
    };
  } catch (err) {
    console.error(`获取出生日期${birthDateStr}的玛雅日历信息失败:`, err);
  }
  
  // 所有API尝试都失败，返回错误信息让前端使用本地计算
  console.log('所有API尝试都失败，前端将使用本地计算方法');
  return {
    success: false,
    error: "API服务暂时不可用，将使用本地计算方法"
  };
};