import { createContext, useContext, useMemo } from 'react';
import { useUserParams } from '../hooks/useUserInfo';

/**
 * 全局用户参数上下文
 * 为应用中的其他组件提供标准化的用户参数
 */
const UserParamsContext = createContext();

/**
 * 用户参数提供者组件
 * 将用户参数传递给所有子组件
 */
export const UserParamsProvider = ({ children }) => {
  const userParams = useUserParams();
  
  const contextValue = useMemo(() => ({
    ...userParams,
    // 添加常用的辅助方法
    isUserLoggedIn: userParams.isValid,
    getZodiacSign: () => userParams.params?.zodiacSign || '',
    getBirthDate: () => {
      if (!userParams.params) return null;
      const { birthYear, birthMonth, birthDay } = userParams.params;
      return new Date(birthYear, birthMonth - 1, birthDay);
    },
    getBirthDateString: () => {
      const date = contextValue.getBirthDate();
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    getAge: () => userParams.params?.age || 0,
    getChineseZodiac: () => userParams.params?.chineseZodiac || '',
    getNickname: () => userParams.params?.nickname || '神秘访客',
    getLocation: () => userParams.params?.birthLocation || {
      name: '北京',
      lng: 116.40,
      lat: 39.90
    },
    // 为了兼容性，提供常用格式的参数
    asObject: () => userParams.params,
    asString: () => {
      if (!userParams.params) return '';
      const { nickname, zodiacSign, chineseZodiac, age } = userParams.params;
      return `${nickname}，${zodiacSign}座，${chineseZodiac}年，${age}岁`;
    }
  }), [userParams]);

  return (
    <UserParamsContext.Provider value={contextValue}>
      {children}
    </UserParamsContext.Provider>
  );
};

/**
 * 使用用户参数的Hook
 * 方便组件获取全局用户参数
 */
export const useUserParamsContext = () => {
  const context = useContext(UserParamsContext);
  
  if (!context) {
    console.warn('useUserParamsContext must be used within a UserParamsProvider');
    return {
      isValid: false,
      reason: 'UserParamsContext不可用',
      params: null,
      isUserLoggedIn: false,
      getZodiacSign: () => '',
      getBirthDate: () => null,
      getBirthDateString: () => null,
      getAge: () => 0,
      getChineseZodiac: () => '',
      getNickname: () => '神秘访客',
      getLocation: () => ({
        name: '北京',
        lng: 116.40,
        lat: 39.90
      }),
      asObject: () => null,
      asString: () => ''
    };
  }
  
  return context;
};

/**
 * 简化版的Hook，只获取用户参数对象
 */
export const useCurrentUserParams = () => {
  const { asObject } = useUserParamsContext();
  return asObject();
};

export default UserParamsContext;