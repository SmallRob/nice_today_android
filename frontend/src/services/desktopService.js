// 桌面应用专用服务 - 替代原有的API调用

// 格式化日期为YYYY-MM-DD，确保时区一致
// 检查服务是否就绪
export const isServiceReady = () => {
  // 在Electron环境中检查API是否就绪
  if (isDesktopApp()) {
    return window.electronAPI?.isReady ? window.electronAPI.isReady() : false;
  }
  // Web环境中总是就绪
  return true;
};


export const formatDateString = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 检查是否为桌面应用环境
export const isDesktopApp = () => {
  return window.electronAPI !== undefined;
};

// 系统健康检查
export const checkSystemHealth = async () => {
  if (!isDesktopApp()) {
    return {
      success: false,
      error: '非桌面环境，无法使用本地化服务'
    };
  }

  try {
    const result = await window.electronAPI.system.healthCheck();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('系统健康检查失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 生物节律服务
export const desktopBiorhythmService = {
  // 获取默认出生日期
  getDefaultBirthdate: async () => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.biorhythm.getDefaultBirthdate();
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取默认出生日期失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取今日生物节律
  getToday: async (birthDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const birthDateStr = typeof birthDate === 'string' 
        ? birthDate 
        : formatDateString(birthDate);
      
      const result = await window.electronAPI.biorhythm.getToday(birthDateStr);
      // IPC返回的是{success: true, data: actualData}，直接返回result
      // 因为result已经是正确的格式
      return result;
    } catch (error) {
      console.error('获取今日生物节律失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取指定日期生物节律
  getDate: async (birthDate, targetDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const birthDateStr = typeof birthDate === 'string' 
        ? birthDate 
        : formatDateString(birthDate);
      const targetDateStr = typeof targetDate === 'string' 
        ? targetDate 
        : formatDateString(targetDate);
      
      const result = await window.electronAPI.biorhythm.getDate(birthDateStr, targetDateStr);
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取指定日期生物节律失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取生物节律范围
  getRange: async (birthDate, daysBefore = 10, daysAfter = 20) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const birthDateStr = typeof birthDate === 'string' 
        ? birthDate 
        : formatDateString(birthDate);
      
      const result = await window.electronAPI.biorhythm.getRange(birthDateStr, daysBefore, daysAfter);
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取生物节律范围失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 玛雅历法服务
export const desktopMayaService = {
  // 获取今日玛雅历法信息
  getToday: async () => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.maya.getToday();
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取今日玛雅历法信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取指定日期玛雅历法信息
  getDate: async (targetDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const targetDateStr = typeof targetDate === 'string' 
        ? targetDate 
        : formatDateString(targetDate);
      
      const result = await window.electronAPI.maya.getDate(targetDateStr);
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取指定日期玛雅历法信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取玛雅历法范围信息
  getRange: async (daysBefore = 3, daysAfter = 3) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.maya.getRange(daysBefore, daysAfter);
      // IPC返回的是{success: true, data: {maya_info_list: [...], date_range: {...}}}
      // 直接返回result，因为result已经是正确的格式
      return result;
    } catch (error) {
      console.error('获取玛雅历法范围信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取玛雅出生图信息
  getBirthInfo: async (birthDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const birthDateStr = typeof birthDate === 'string' 
        ? birthDate 
        : formatDateString(birthDate);
      
      const result = await window.electronAPI.maya.getBirthInfo(birthDateStr);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('获取玛雅出生图信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 穿搭建议服务
export const desktopDressService = {
  // 获取今日穿搭建议
  getToday: async () => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.dress.getToday();
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取今日穿搭建议失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取指定日期穿搭建议
  getDate: async (targetDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const targetDateStr = typeof targetDate === 'string' 
        ? targetDate 
        : formatDateString(targetDate);
      
      const result = await window.electronAPI.dress.getDate(targetDateStr);
      // IPC返回的是{success: true, data: actualData}，直接返回result
      return result;
    } catch (error) {
      console.error('获取指定日期穿搭建议失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取穿搭建议范围信息
  getRange: async (daysBefore = 1, daysAfter = 6) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.dress.getRange(daysBefore, daysAfter);
      // IPC返回的是{success: true, data: {dress_info_list: [...], date_range: {...}}}
      // 直接返回result，因为result已经是正确的格式
      return result;
    } catch (error) {
      console.error('获取穿搭建议范围信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 四季五行养生服务
export const desktopSeasonHealthService = {
  // 获取四季五行养生建议
  getAdvice: async (date) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const dateStr = typeof date === 'string' 
        ? date 
        : formatDateString(date);
      
      const result = await window.electronAPI.seasonHealth.getAdvice(dateStr);
      return result;
    } catch (error) {
      console.error('获取四季五行养生建议失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 生肖能量服务
export const desktopZodiacEnergyService = {
  // 获取今日生肖能量指引
  getToday: async (userZodiac) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.zodiacEnergy.getToday(userZodiac);
      return result;
    } catch (error) {
      console.error('获取今日生肖能量指引失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取指定日期生肖能量指引
  getDate: async (userZodiac, targetDate) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const targetDateStr = typeof targetDate === 'string' 
        ? targetDate 
        : formatDateString(targetDate);
      
      const result = await window.electronAPI.zodiacEnergy.getDate(userZodiac, targetDateStr);
      return result;
    } catch (error) {
      console.error('获取指定日期生肖能量指引失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 根据年份计算生肖
  getZodiacFromYear: async (year) => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.zodiacEnergy.getZodiacFromYear(year);
      return result;
    } catch (error) {
      console.error('根据年份计算生肖失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 获取所有生肖列表
  getAllZodiacs: async () => {
    if (!isDesktopApp()) {
      return {
        success: false,
        error: '请在桌面应用中运行此功能'
      };
    }

    try {
      const result = await window.electronAPI.zodiacEnergy.getAllZodiacs();
      return result;
    } catch (error) {
      console.error('获取所有生肖列表失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// 统一的服务接口 - 自动检测环境并选择合适的方法
export const unifiedService = {
  // 生物节律服务
  biorhythm: {
    getToday: async (birthDate) => {
      if (isDesktopApp()) {
        return desktopBiorhythmService.getToday(birthDate);
      } else {
        // Web环境下的处理逻辑（如果需要支持）
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getDate: async (birthDate, targetDate) => {
      if (isDesktopApp()) {
        return desktopBiorhythmService.getDate(birthDate, targetDate);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getRange: async (birthDate, daysBefore, daysAfter) => {
      if (isDesktopApp()) {
        return desktopBiorhythmService.getRange(birthDate, daysBefore, daysAfter);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    }
  },

  // 玛雅历法服务
  maya: {
    getToday: async () => {
      if (isDesktopApp()) {
        return desktopMayaService.getToday();
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getDate: async (targetDate) => {
      if (isDesktopApp()) {
        return desktopMayaService.getDate(targetDate);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getRange: async (daysBefore, daysAfter) => {
      if (isDesktopApp()) {
        return desktopMayaService.getRange(daysBefore, daysAfter);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getBirthInfo: async (birthDate) => {
      if (isDesktopApp()) {
        return desktopMayaService.getBirthInfo(birthDate);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    }
  },

  // 穿搭建议服务
  dress: {
    getToday: async () => {
      if (isDesktopApp()) {
        return desktopDressService.getToday();
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getDate: async (targetDate) => {
      if (isDesktopApp()) {
        return desktopDressService.getDate(targetDate);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getRange: async (daysBefore, daysAfter) => {
      if (isDesktopApp()) {
        return desktopDressService.getRange(daysBefore, daysAfter);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    }
  },

  // 四季五行养生服务
  seasonHealth: {
    getAdvice: async (date) => {
      if (isDesktopApp()) {
        return desktopSeasonHealthService.getAdvice(date);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    }
  },

  // 生肖能量服务
  zodiacEnergy: {
    getToday: async (userZodiac) => {
      if (isDesktopApp()) {
        return desktopZodiacEnergyService.getToday(userZodiac);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getDate: async (userZodiac, targetDate) => {
      if (isDesktopApp()) {
        return desktopZodiacEnergyService.getDate(userZodiac, targetDate);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getZodiacFromYear: async (year) => {
      if (isDesktopApp()) {
        return desktopZodiacEnergyService.getZodiacFromYear(year);
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    },

    getAllZodiacs: async () => {
      if (isDesktopApp()) {
        return desktopZodiacEnergyService.getAllZodiacs();
      } else {
        return {
          success: false,
          error: '此功能仅在桌面应用中可用'
        };
      }
    }
  },

  // 系统服务
  system: {
    healthCheck: async () => {
      if (isDesktopApp()) {
        return checkSystemHealth();
      } else {
        return {
          success: false,
          error: '系统检查仅在桌面应用中可用'
        };
      }
    }
  }
};