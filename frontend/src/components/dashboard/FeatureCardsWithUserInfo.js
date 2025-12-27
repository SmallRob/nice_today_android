import React, { memo } from 'react';
import { useUserParamsContext } from '../../context/UserParamsContext';
import './FeatureCardsWithUserInfo.css';

/**
 * 展示如何使用全局用户参数的示例组件
 * 其他组件可以参考此实现方式
 */
const FeatureCardsWithUserInfo = () => {
  const {
    isUserLoggedIn,
    getZodiacSign,
    getBirthDateString,
    getAge,
    getNickname,
    getChineseZodiac,
    asString
  } = useUserParamsContext();

  // 示例：根据用户星座显示不同内容
  const getZodiacSpecificContent = () => {
    const zodiacSign = getZodiacSign();
    if (!isUserLoggedIn || !zodiacSign) {
      return {
        title: '通用运势',
        description: '登录后可查看您的专属运势',
        bgColor: 'from-gray-500 to-gray-600'
      };
    }

    const zodiacContent = {
      '白羊座': {
        title: '白羊座专属运势',
        description: '今日充满活力，适合开创新局',
        bgColor: 'from-red-500 to-orange-500'
      },
      '金牛座': {
        title: '金牛座专属运势',
        description: '财运亨通，适合投资理财',
        bgColor: 'from-green-500 to-emerald-500'
      },
      '双子座': {
        title: '双子座专属运势',
        description: '沟通顺畅，社交运势佳',
        bgColor: 'from-blue-500 to-cyan-500'
      },
      '巨蟹座': {
        title: '巨蟹座专属运势',
        description: '家庭和睦，情感运势提升',
        bgColor: 'from-purple-500 to-pink-500'
      },
      '狮子座': {
        title: '狮子座专属运势',
        description: '事业蒸蒸日上，财运亨通',
        bgColor: 'from-yellow-500 to-amber-500'
      },
      '处女座': {
        title: '处女座专属运势',
        description: '细节决定成败，工作表现优秀',
        bgColor: 'from-gray-500 to-slate-500'
      },
      '天秤座': {
        title: '天秤座专属运势',
        description: '和谐平衡，人际关系良好',
        bgColor: 'from-teal-500 to-cyan-500'
      },
      '天蝎座': {
        title: '天蝎座专属运势',
        description: '洞察力强，适合调查分析',
        bgColor: 'from-black to-gray-800'
      },
      '射手座': {
        title: '射手座专属运势',
        description: '冒险精神旺盛，适合旅行探索',
        bgColor: 'from-indigo-500 to-purple-500'
      },
      '摩羯座': {
        title: '摩羯座专属运势',
        description: '踏实努力，事业有成',
        bgColor: 'from-brown-500 to-orange-700'
      },
      '水瓶座': {
        title: '水瓶座专属运势',
        description: '创新思维，适合科技领域',
        bgColor: 'from-blue-400 to-blue-600'
      },
      '双鱼座': {
        title: '双鱼座专属运势',
        description: '感性丰富，艺术创作佳期',
        bgColor: 'from-pink-400 to-pink-600'
      }
    };

    return zodiacContent[zodiacSign] || {
      title: '星座运势',
      description: '点击查看详细运势',
      bgColor: 'from-indigo-500 to-purple-500'
    };
  };

  // 示例：根据用户年龄显示不同建议
  const getAgeSpecificAdvice = () => {
    const age = getAge();
    if (!isUserLoggedIn || !age) return '完善个人资料以获得精准建议';

    if (age < 25) return '年轻有为，适合学习新技能';
    if (age < 35) return '事业上升期，把握机遇';
    if (age < 50) return '家庭事业平衡，稳扎稳打';
    return '人生阅历丰富，发挥所长';
  };

  // 获取星座特定内容
  const zodiacContent = getZodiacSpecificContent();

  return (
    <div className="user-personalized-features">
      <div className={`feature-card personalized ${zodiacContent.bgColor}`}>
        <div className="feature-header">
          <h3 className="feature-title">{zodiacContent.title}</h3>
          <div className="user-summary">{asString()}</div>
        </div>
        <p className="feature-description">{zodiacContent.description}</p>
        <button className="feature-action-btn">查看详情</button>
      </div>

      <div className="feature-card age-based">
        <h3 className="feature-title">个性化建议</h3>
        <p className="feature-description">{getAgeSpecificAdvice()}</p>
        <div className="user-tags">
          <span className="user-tag">生日: {getBirthDateString() || '未设置'}</span>
          <span className="user-tag">生肖: {getChineseZodiac() || '未知'}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(FeatureCardsWithUserInfo);

/**
 * 使用指南：
 * 
 * 1. 在任何需要用户参数的组件中导入 useUserParamsContext：
 *    import { useUserParamsContext } from '../../context/UserParamsContext';
 * 
 * 2. 在组件中使用：
 *    const { getZodiacSign, getAge, getNickname } = useUserParamsContext();
 * 
 * 3. 可用的方法包括：
 *    - isUserLoggedIn: 用户是否已登录并设置了基本信息
 *    - getZodiacSign(): 获取星座
 *    - getChineseZodiac(): 获取生肖
 *    - getAge(): 获取年龄
 *    - getNickname(): 获取昵称
 *    - getBirthDate(): 获取出生日期(Date对象)
 *    - getBirthDateString(): 获取格式化的出生日期(YYYY-MM-DD)
 *    - getLocation(): 获取出生地点
 *    - asObject(): 获取完整的用户参数对象
 *    - asString(): 获取用户信息的字符串表示
 * 
 * 4. 对于只需要用户参数对象的场景，可以使用简化版Hook：
 *    import { useCurrentUserParams } from '../../context/UserParamsContext';
 *    const userParams = useCurrentUserParams();
 */