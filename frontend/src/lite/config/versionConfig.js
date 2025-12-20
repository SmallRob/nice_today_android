/**
 * 轻量版配置文件
 * 用于区分轻量版与完整版的功能差异
 */

export const versionConfig = {
  // 版本标识
  isLiteVersion: true,
  
  // 版本名称
  versionName: '轻量版',
  
  // 可用功能模块
  availableFeatures: {
    biorhythm: true,     // 人体节律
    mayaCalendar: true,  // 玛雅日历
    dressGuide: true,    // 穿衣指南
    horoscope: false,    // 星座运程
    mbti: false,         // MBTI人格
    zodiac: false        // 生肖能量
  },
  
  // 简化的用户信息字段
  userInfoFields: {
    nickname: true,
    gender: true,
    birthDate: true,
    zodiac: false,
    zodiacAnimal: false,
    mbti: false
  },
  
  // 性能优化设置
  performance: {
    animations: false,        // 禁用复杂动画
    lazyLoad: true,          // 启用懒加载
    virtualScroll: true,     // 启用虚拟滚动
    imageOptimization: true  // 启用图片优化
  }
};

export default versionConfig;