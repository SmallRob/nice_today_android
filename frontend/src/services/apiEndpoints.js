// API端点配置
const API_ENDPOINTS = {
  // 生物节律相关
  BIORHYTHM: {
    RANGE: '/biorhythm/range',
    TODAY: '/biorhythm/today',
    DATE: '/biorhythm/date',
    HISTORY: '/biorhythm/history'
  },
  
  // 穿衣指南相关
  DRESS: {
    RANGE: '/dress/range',
    TODAY: '/dress/today',
    DATE: '/dress/date'
  },
  
  // 玛雅日历相关
  MAYA: {
    RANGE: '/maya/range',
    TODAY: '/maya/today',
    DATE: '/maya/date',
    HISTORY: '/maya/history',
    BIRTH: '/maya/birth',
    BIRTH_INFO: '/api/maya/birth-info'
  }
};

export default API_ENDPOINTS;