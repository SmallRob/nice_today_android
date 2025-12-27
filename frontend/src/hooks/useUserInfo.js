import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserConfig } from '../contexts/UserConfigContext';
import { getZodiacSign } from '../utils/horoscopeAlgorithm';

/**
 * 全局用户信息Hook
 * 提供用户昵称、出生日期、星座等信息的统一管理和获取
 */
export const useUserInfo = () => {
  const { currentConfig } = useUserConfig();
  
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: null,
    birthTime: '12:30',
    zodiacSign: '',
    chineseZodiac: '',
    age: null,
    birthLocation: null,
    isLoading: true
  });
  
  // 格式化出生日期
  const formatBirthDate = useCallback((date) => {
    if (!date) return null;
    
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
  }, []);
  
  // 计算年龄
  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }, []);
  
  // 获取生肖（基于年份）
  const getChineseZodiac = useCallback((year) => {
    if (!year) return '';
    
    const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    return zodiacs[(year - 4) % 12]; // 1900年是鼠年，所以减4
  }, []);
  
  // 更新用户信息
  const updateUserInfo = useCallback(() => {
    if (!currentConfig) {
      setUserInfo(prev => ({ ...prev, isLoading: true }));
      return;
    }
    
    const nickname = currentConfig.nickname || '神秘访客';
    const birthDate = currentConfig.birthDate || null;
    const birthTime = currentConfig.birthTime || '12:30';
    const birthLocation = currentConfig.birthLocation || null;
    
    // 计算星座和生肖
    let zodiacSign = '';
    let chineseZodiac = '';
    
    if (birthDate) {
      zodiacSign = getZodiacSign(new Date(birthDate)) || '';
      
      const birthYear = new Date(birthDate).getFullYear();
      chineseZodiac = getChineseZodiac(birthYear);
    }
    
    // 计算年龄
    const age = calculateAge(birthDate);
    
    setUserInfo({
      nickname,
      birthDate,
      birthTime,
      zodiacSign,
      chineseZodiac,
      age,
      birthLocation,
      isLoading: false
    });
  }, [currentConfig, formatBirthDate, calculateAge, getChineseZodiac]);
  
  // 监听配置变化
  useEffect(() => {
    updateUserInfo();
  }, [updateUserInfo]);
  
  // 格式化后的用户信息
  const formattedUserInfo = useMemo(() => {
    const { 
      nickname, 
      birthDate, 
      birthTime, 
      zodiacSign, 
      chineseZodiac, 
      age, 
      birthLocation,
      isLoading 
    } = userInfo;
    
    return {
      nickname,
      formattedBirthDate: formatBirthDate(birthDate),
      birthTime,
      zodiacSign,
      chineseZodiac,
      age,
      birthLocation,
      birthLocationText: birthLocation 
        ? `${birthLocation.name || '未知地点'} (${birthLocation.lng?.toFixed(2) || '0'}, ${birthLocation.lat?.toFixed(2) || '0'})`
        : '未设置',
      isLoading,
      hasUserInfo: !!(nickname && nickname !== '神秘访客'),
      hasBirthInfo: !!birthDate,
      fullInfo: `${nickname}，${zodiacSign}座，${chineseZodiac}年，${age ? age + '岁' : ''}`
    };
  }, [userInfo, formatBirthDate]);
  
  return {
    ...formattedUserInfo,
    updateUserInfo
  };
};

/**
 * 获取用户摘要信息的Hook
 * 适用于只需要关键信息的场景
 */
export const useUserSummary = () => {
  const { 
    nickname, 
    zodiacSign, 
    chineseZodiac, 
    age,
    formattedBirthDate,
    isLoading,
    hasUserInfo 
  } = useUserInfo();
  
  return {
    nickname,
    zodiacSign,
    chineseZodiac,
    age,
    birthDate: formattedBirthDate,
    isLoading,
    hasUserInfo,
    summary: hasUserInfo 
      ? `${nickname}，${zodiacSign}座，${age ? age + '岁' : ''}`
      : '神秘访客'
  };
};

/**
 * 获取用户关键参数的Hook
 * 为其他功能提供标准化的用户参数
 */
export const useUserParams = () => {
  const {
    nickname,
    birthDate,
    birthTime,
    zodiacSign,
    chineseZodiac,
    age,
    birthLocation,
    isLoading,
    hasUserInfo,
    hasBirthInfo
  } = useUserInfo();
  
  // 提供标准化的参数对象
  const userParams = useMemo(() => {
    if (isLoading || !hasBirthInfo) {
      return {
        isValid: false,
        reason: isLoading ? '用户信息加载中' : '缺少出生信息',
        params: null
      };
    }
    
    const birthDateObj = new Date(birthDate);
    
    return {
      isValid: true,
      reason: '',
      params: {
        nickname: nickname || '神秘访客',
        birthYear: birthDateObj.getFullYear(),
        birthMonth: birthDateObj.getMonth() + 1, // JavaScript月份从0开始
        birthDay: birthDateObj.getDate(),
        birthHour: parseInt(birthTime.split(':')[0] || 12, 10),
        birthMinute: parseInt(birthTime.split(':')[1] || 30, 10),
        birthTimestamp: birthDateObj.getTime(),
        zodiacSign: zodiacSign || '',
        chineseZodiac: chineseZodiac || '',
        age: age || 0,
        birthLocation: birthLocation || {
          name: '北京',
          lng: 116.40,
          lat: 39.90
        }
      }
    };
  }, [nickname, birthDate, birthTime, zodiacSign, chineseZodiac, age, birthLocation, isLoading, hasBirthInfo]);
  
  return userParams;
};

export default useUserInfo;