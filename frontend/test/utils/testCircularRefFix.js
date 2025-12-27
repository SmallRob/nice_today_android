/**
 * 测试循环引用修复的脚本
 */

import { calculateDetailedBazi } from './baziHelper.js';
import { enhancedUserConfigManager } from './EnhancedUserConfigManager.js';

// 模拟一个包含八字信息的配置对象
const testConfig = {
  nickname: '测试用户',
  realName: '测试姓名',
  birthDate: '1990-01-01',
  birthTime: '12:30',
  birthLocation: {
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    lng: 116.4074,
    lat: 39.9042
  },
  zodiac: '摩羯座',
  zodiacAnimal: '马',
  gender: 'male',
  mbti: 'INTJ',
  nameScore: null,
  // 添加八字信息，这可能包含循环引用
  bazi: null,
  isused: false,
  lunarBirthDate: null,
  trueSolarTime: "12:30",
  lunarInfo: null,
  lastCalculated: null
};

// 计算八字信息并添加到配置中
const baziInfo = calculateDetailedBazi('1990-01-01', '12:30', 116.4074);
testConfig.bazi = baziInfo;

console.log('原始配置对象创建完成');

// 测试旧的深拷贝方法（会导致循环引用错误）
function oldDeepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('旧的深拷贝方法失败:', error.message);
    return null;
  }
}

// 测试新的深拷贝方法
function testNewDeepClone() {
  try {
    // 初始化配置管理器
    enhancedUserConfigManager.initialize().then(() => {
      console.log('配置管理器初始化完成');
      
      // 尝试添加包含八字信息的配置
      enhancedUserConfigManager.addBasicConfig(testConfig).then((success) => {
        if (success) {
          console.log('配置添加成功，循环引用问题已修复');
        } else {
          console.log('配置添加失败');
        }
      });
    });
  } catch (error) {
    console.error('新深拷贝方法失败:', error.message);
  }
}

console.log('开始测试修复后的深拷贝功能...');
testNewDeepClone();