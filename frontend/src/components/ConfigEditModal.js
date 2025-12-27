import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { REGION_DATA, DEFAULT_REGION } from '../data/ChinaLocationData';
import { getShichen, getShichenSimple, calculateTrueSolarTime } from '../utils/astronomy';
import { calculateLunarDate, generateLunarAndTrueSolarFields } from '../utils/LunarCalendarHelper';
import { userConfigManager } from '../utils/userConfigManager';

// 性别选项 - 简化为男女
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
];

// 星座选项
const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// 生肖选项
const ZODIAC_ANIMAL_OPTIONS = [
  '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'
];

// MBTI类型选项
const MBTI_OPTIONS = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// 十二时辰选项
const SHICHEN_OPTIONS = [
  { value: '23:00-01:00', label: '子时', time: '23:00', description: '夜半，23:00-01:00' },
  { value: '01:00-03:00', label: '丑时', time: '01:00', description: '鸡鸣，01:00-03:00' },
  { value: '03:00-05:00', label: '寅时', time: '03:00', description: '平旦，03:00-05:00' },
  { value: '05:00-07:00', label: '卯时', time: '05:00', description: '日出，05:00-07:00' },
  { value: '07:00-09:00', label: '辰时', time: '07:00', description: '食时，07:00-09:00' },
  { value: '09:00-11:00', label: '巳时', time: '09:00', description: '隅中，09:00-11:00' },
  { value: '11:00-13:00', label: '午时', time: '11:00', description: '日中，11:00-13:00' },
  { value: '13:00-15:00', label: '未时', time: '13:00', description: '日昳，13:00-15:00' },
  { value: '15:00-17:00', label: '申时', time: '15:00', description: '哺时，15:00-17:00' },
  { value: '17:00-19:00', label: '酉时', time: '17:00', description: '日入，17:00-19:00' },
  { value: '19:00-21:00', label: '戌时', time: '19:00', description: '黄昏，19:00-21:00' },
  { value: '21:00-23:00', label: '亥时', time: '21:00', description: '人定，21:00-23:00' }
];



// 根据时间获取对应时辰
const getShichenByTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // 时辰时间段映射（分钟）
  const shichenRanges = [
    { start: 23 * 60, end: 25 * 60, label: '子时' }, // 23:00-01:00
    { start: 1 * 60, end: 3 * 60, label: '丑时' },   // 01:00-03:00
    { start: 3 * 60, end: 5 * 60, label: '寅时' },   // 03:00-05:00
    { start: 5 * 60, end: 7 * 60, label: '卯时' },   // 05:00-07:00
    { start: 7 * 60, end: 9 * 60, label: '辰时' },   // 07:00-09:00
    { start: 9 * 60, end: 11 * 60, label: '巳时' },  // 09:00-11:00
    { start: 11 * 60, end: 13 * 60, label: '午时' }, // 11:00-13:00
    { start: 13 * 60, end: 15 * 60, label: '未时' }, // 13:00-15:00
    { start: 15 * 60, end: 17 * 60, label: '申时' }, // 15:00-17:00
    { start: 17 * 60, end: 19 * 60, label: '酉时' }, // 17:00-19:00
    { start: 19 * 60, end: 21 * 60, label: '戌时' }, // 19:00-21:00
    { start: 21 * 60, end: 23 * 60, label: '亥时' }  // 21:00-23:00
  ];
  
  // 处理跨天情况
  const adjustedMinutes = totalMinutes >= 24 * 60 ? totalMinutes - 24 * 60 : totalMinutes;
  
  for (const range of shichenRanges) {
    if (adjustedMinutes >= range.start && adjustedMinutes < range.end) {
      return range.label;
    }
  }
  
  return '子时'; // 默认返回子时
};

// 移动端优化的选择器组件
const MobileOptimizedSelect = ({ value, onChange, options, className, disabled }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={className}
  >
    {options.map(opt => (
      <option key={opt.value || opt} value={opt.value || opt}>
        {opt.label || opt}
      </option>
    ))}
  </select>
);

// 带验证的经纬度输入组件
const CoordinateInput = ({ label, value, onChange, error, placeholder, min, max, step }) => (
  <div className="flex-1">
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || '')}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white text-sm touch-manipulation ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
      }`}
      style={{ fontSize: '16px' }}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

// 移动端优化的按钮组件
const MobileOptimizedButton = ({ children, onClick, variant = 'primary', disabled, className }) => {
  const baseClasses = 'px-4 py-2 rounded-md text-base font-medium touch-manipulation transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
    >
      {children}
    </button>
  );
};

// 基于TanStack Form的配置编辑弹窗组件
const ConfigEditModal = ({ isOpen, onClose, config, index, isNew, onSave, showMessage, isFromTemplate = false, templateSource = null }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [initError, setInitError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const prevIsOpenRef = useRef(false);

  // 真太阳时和时辰信息
  const [calculatedInfo, setCalculatedInfo] = useState({
    shichen: '',
    trueSolarTime: '',
    lunarBirthDate: '',
    birthTimeKey: ''  // 按用户昵称ID封装出生时间的对象信息
  });

  // 生成出生时间唯一标识（按用户昵称ID封装）
  const generateBirthTimeKey = (nickname, birthDate, birthTime) => {
    const baseKey = `${nickname}_${birthDate}_${birthTime}`.replace(/[^a-zA-Z0-9_]/g, '');
    // 使用简单的哈希生成唯一ID
    let hash = 0;
    for (let i = 0; i < baseKey.length; i++) {
      const char = baseKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `BT${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}`;
  };

  // 初始化默认值（增加错误处理和冗余）
  const defaultValues = useMemo(() => {
    try {
      if (isNew) {
        return {
          nickname: '',
          realName: '',
          birthDate: '',
          birthTime: '12:30',
          birthLocation: { ...DEFAULT_REGION },
          gender: 'male', // 默认为男性
          zodiac: '',
          zodiacAnimal: '',
          mbti: '',
          isused: false
        };
      } else if (config && typeof config === 'object') {
        // 确保深拷贝 birthLocation 对象，避免引用问题
        return {
          nickname: (config.nickname || '').toString(),
          realName: (config.realName || '').toString(),
          birthDate: (config.birthDate || '').toString(),
          birthTime: (config.birthTime || '12:30').toString(),
          birthLocation: config.birthLocation && typeof config.birthLocation === 'object' ? {
            province: (config.birthLocation.province || '').toString(),
            city: (config.birthLocation.city || '').toString(),
            district: (config.birthLocation.district || '').toString(),
            lng: typeof config.birthLocation.lng === 'number' ? config.birthLocation.lng : DEFAULT_REGION.lng,
            lat: typeof config.birthLocation.lat === 'number' ? config.birthLocation.lat : DEFAULT_REGION.lat
          } : { ...DEFAULT_REGION },
          gender: config.gender && ['male', 'female'].includes(config.gender) ? config.gender : 'male',
          zodiac: (config.zodiac || '').toString(),
          zodiacAnimal: (config.zodiacAnimal || '').toString(),
          mbti: (config.mbti || '').toString(),
          isused: Boolean(config.isused)
        };
      }
      // config 为 null/undefined/非对象时的兜底
      return {
        nickname: '',
        realName: '',
        birthDate: '',
        birthTime: '12:30',
        birthLocation: { ...DEFAULT_REGION },
        gender: 'male', // 默认为男性
        zodiac: '',
        zodiacAnimal: '',
        mbti: '',
        isused: false
      };
    } catch (error) {
      console.error('ConfigEditModal defaultValues 计算失败:', error);
      setInitError('初始化表单失败: ' + error.message);
      // 返回最小化的默认值
      return {
        nickname: '',
        realName: '',
        birthDate: '',
        birthTime: '12:30',
        birthLocation: { ...DEFAULT_REGION },
        gender: 'male', // 默认为男性
        zodiac: '',
        zodiacAnimal: '',
        mbti: '',
        isused: false
      };
    }
  }, [isNew, config]);

  // 使用 TanStack Form hook
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await handleSave(value);
    }
  });

  // 当 defaultValues 或 isOpen 状态变化时，确保表单数据同步
  useEffect(() => {
    if (isOpen && form) {
      // 逐个设置字段值，兼容 TanStack Form v1.x
      // 延迟执行，避免在渲染周期中修改表单状态
      const timer = setTimeout(() => {
        Object.entries(defaultValues).forEach(([key, value]) => {
          try {
            form.setFieldValue(key, value);
          } catch (e) {
            console.warn(`设置字段 ${key} 失败:`, e);
          }
        });
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValues, form]);

  // 使用 @tanstack/react-store 的 useStore API 获取表单数据
  // v1.x 以后 form.useStore 被移除，改用 useStore(form.store, selector)
  const formData = useStore(form.store, (state) => state.values);

  // 当弹窗打开时初始化表单数据
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // 确保在编辑时，birthLocation 的值被正确初始化
      form.reset();
      prevIsOpenRef.current = true;
    }
    if (!isOpen) {
      prevIsOpenRef.current = false;
      setIsSaving(false);
    }
  }, [isOpen, form, defaultValues]);

  // 实时计算时辰、真太阳时和农历信息（增加容错处理）
  useEffect(() => {
    try {
      const birthDateStr = (formData.birthDate || '').toString();
      const birthTimeStr = (formData.birthTime || '12:30').toString();
      const nicknameStr = (formData.nickname || '').toString();

      // 防止无效日期格式
      if (birthDateStr && !isValidDate(birthDateStr)) {
        console.warn('无效的出生日期格式:', birthDateStr);
        return;
      }

      const shichen = getShichen(birthTimeStr);
      const lng = formData.birthLocation?.lng ?? DEFAULT_REGION.lng;
      const lat = formData.birthLocation?.lat ?? DEFAULT_REGION.lat;

      // 确保 lng 是有效的数字
      const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : DEFAULT_REGION.lng;
      const trueSolarTime = calculateTrueSolarTime(birthDateStr, birthTimeStr, safeLng);

      // 使用专业农历计算（增加容错）
      let lunarInfo = null;
      let lunarBirthDate = '';
      if (birthDateStr) {
        try {
          lunarInfo = calculateLunarDate(birthDateStr, birthTimeStr, safeLng);
          if (lunarInfo && typeof lunarInfo === 'object') {
            lunarBirthDate = lunarInfo.fullText || 
              (lunarInfo.yearInChinese && lunarInfo.monthInChinese && lunarInfo.dayInChinese
                ? `${lunarInfo.yearInChinese}年${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}`
                : birthDateStr);
          }
        } catch (error) {
          console.warn('农历计算失败，使用默认值:', error);
          lunarBirthDate = birthDateStr;
        }
      }

      // 生成出生时间唯一标识
      const birthTimeKey = generateBirthTimeKey(nicknameStr, birthDateStr, birthTimeStr);

      setCalculatedInfo({
        shichen,
        trueSolarTime: trueSolarTime || birthTimeStr,
        lunarInfo,
        lunarBirthDate,
        birthTimeKey,
        timeShichen: getShichenByTime(birthTimeStr)
      });
    } catch (error) {
      console.error('计算时辰信息失败:', error);
      // 设置默认值，避免显示错误
      setCalculatedInfo({
        shichen: '午时',
        trueSolarTime: formData.birthTime || '12:30',
        lunarInfo: null,
        lunarBirthDate: formData.birthDate || '',
        birthTimeKey: generateBirthTimeKey(formData.nickname || '', formData.birthDate || '', formData.birthTime || ''),
        timeShichen: '午时'
      });
    }
  }, [formData.birthDate, formData.birthTime, formData.birthLocation, formData.nickname]);

  // 辅助函数：验证日期格式
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // 处理地区变化 - 用户手动填写为准
  const handleRegionChange = (type, value) => {
    const currentLoc = formData.birthLocation || { ...DEFAULT_REGION };
    let newLoc = { ...currentLoc };

    if (type === 'province') {
      // 只更新省份，保持用户原有的城市和区县选择
      newLoc.province = value;
    } else if (type === 'city') {
      // 只更新城市，保持用户原有的区县选择
      newLoc.city = value;
    } else if (type === 'district') {
      // 更新区县并设置对应的经纬度（仅当用户选择区县时）
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === newLoc.city);
      const distData = cityData?.children.find(d => d.name === value);
      
      if (distData) {
        newLoc.district = value;
        newLoc.lng = distData.lng ?? 0;
        newLoc.lat = distData.lat ?? 0;
      } else {
        // 用户手动输入的区县，保持原经纬度或使用默认值
        newLoc.district = value;
      }
    } else if (type === 'lng') {
      newLoc.lng = value;
    } else if (type === 'lat') {
      newLoc.lat = value;
    }

    // 确保经纬度是有效的数字
    newLoc.lng = typeof newLoc.lng === 'number' ? newLoc.lng : DEFAULT_REGION.lng;
    newLoc.lat = typeof newLoc.lat === 'number' ? newLoc.lat : DEFAULT_REGION.lat;

    form.setFieldValue('birthLocation', newLoc);
  };

  // 验证坐标值
  const validateCoordinate = (value, type) => {
    if (value === '' || value === null || value === undefined) return '';
    if (isNaN(value)) return '请输入有效数字';

    if (type === 'lng') {
      if (value < -180) return '经度不能小于-180';
      if (value > 180) return '经度不能大于180';
    } else if (type === 'lat') {
      if (value < -90) return '纬度不能小于-90';
      if (value > 90) return '纬度不能大于90';
    }
    return '';
  };

  // 简化验证：只做基本格式检查，提供自动纠错机制
  const validateRequiredInputs = (formData) => {
    const errors = [];
    const warnings = [];

    // 只验证最核心的必填项
    if (!formData.birthDate || typeof formData.birthDate !== 'string') {
      errors.push('请选择有效的出生日期');
    }

    if (!formData.birthTime || typeof formData.birthTime !== 'string') {
      warnings.push('出生时间将使用默认值 12:30');
    }

    if (!formData.birthLocation || typeof formData.birthLocation !== 'object') {
      warnings.push('出生地点将使用默认值（北京市）');
    }

    return { errors, warnings };
  };

  // 自动纠错函数：修复常见的格式问题
  const autoFixFormData = (formData) => {
    const fixed = { ...formData };

    try {
      // 1. 修复出生日期
      if (fixed.birthDate) {
        // 尝试多种日期格式
        const datePatterns = [
          /^(\d{4})-(\d{2})-(\d{2})$/,    // YYYY-MM-DD
          /^(\d{4})\/(\d{2})\/(\d{2})$/,   // YYYY/MM/DD
          /^(\d{4})(\d{2})(\d{2})$/,      // YYYYMMDD
        ];

        for (const pattern of datePatterns) {
          const match = fixed.birthDate.match(pattern);
          if (match) {
            const [, year, month, day] = match;
            const date = new Date(year, parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime()) && date.getFullYear() === parseInt(year)) {
              fixed.birthDate = `${year}-${month}-${day}`;
              break;
            }
          }
        }
      } else {
        fixed.birthDate = '1991-01-01'; // 默认日期
      }

      // 2. 修复出生时间
      if (!fixed.birthTime || typeof fixed.birthTime !== 'string') {
        fixed.birthTime = '12:30';
      } else {
        const timeMatch = fixed.birthTime.match(/(\d{1,2})[:：](\d{2})/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          let minutes = parseInt(timeMatch[2]);
          
          // 自动修正超出范围的时间
          if (hours < 0) hours = 0;
          if (hours > 23) hours = 23;
          if (minutes < 0) minutes = 0;
          if (minutes > 59) minutes = 59;
          
          fixed.birthTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
          fixed.birthTime = '12:30';
        }
      }

      // 3. 修复经纬度
      if (!fixed.birthLocation || typeof fixed.birthLocation !== 'object') {
        fixed.birthLocation = { ...DEFAULT_REGION };
      } else {
        const loc = fixed.birthLocation;
        
        // 修复经度
        if (typeof loc.lng !== 'number' || isNaN(loc.lng)) {
          loc.lng = DEFAULT_REGION.lng;
        } else if (loc.lng < -180) {
          loc.lng = -180;
        } else if (loc.lng > 180) {
          loc.lng = 180;
        }
        
        // 修复纬度
        if (typeof loc.lat !== 'number' || isNaN(loc.lat)) {
          loc.lat = DEFAULT_REGION.lat;
        } else if (loc.lat < -90) {
          loc.lat = -90;
        } else if (loc.lat > 90) {
          loc.lat = 90;
        }
        
        // 确保省市区字段存在
        loc.province = loc.province || DEFAULT_REGION.province;
        loc.city = loc.city || DEFAULT_REGION.city;
        loc.district = loc.district || DEFAULT_REGION.district;
      }

      // 4. 修复性别
      if (!['male', 'female', 'secret'].includes(fixed.gender)) {
        fixed.gender = 'secret';
      }

      // 5. 修复昵称
      if (!fixed.nickname || typeof fixed.nickname !== 'string') {
        fixed.nickname = generateRandomNickname();
      } else {
        // 移除特殊字符
        fixed.nickname = fixed.nickname.trim().replace(/[<>\"'&]/g, '');
        if (fixed.nickname.length === 0) {
          fixed.nickname = generateRandomNickname();
        } else if (fixed.nickname.length > 50) {
          fixed.nickname = fixed.nickname.substring(0, 50);
        }
      }

      console.log('数据自动纠错完成:', {
        birthDate: fixed.birthDate,
        birthTime: fixed.birthTime,
        birthLocation: fixed.birthLocation,
        nickname: fixed.nickname
      });

      return fixed;
    } catch (error) {
      console.error('自动纠错失败:', error);
      // 返回最小可用的数据
      return {
        ...DEFAULT_REGION,
        nickname: generateRandomNickname(),
        birthDate: '1991-01-01',
        birthTime: '12:30',
        gender: 'secret'
      };
    }
  };

  // 生成随机昵称
  const generateRandomNickname = () => {
    const existingUsers = JSON.parse(localStorage.getItem('userConfigs') || '[]');
    const userCount = existingUsers.length + 1;
    const nicknames = ['新用户', '朋友', '访客', '用户', '伙伴'];
    const randomNick = nicknames[Math.floor(Math.random() * nicknames.length)];
    return `${randomNick}${userCount}`;
  };

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return '12:30';
    
    // 如果是原生时间控件返回的值，通常是 HH:MM 格式
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return '12:30'; // 默认值
  };

  // 确保出生地点有完整信息
  const ensureCompleteLocation = (location) => {
    if (!location || typeof location !== 'object') {
      return { ...DEFAULT_REGION };
    }
    
    return {
      province: location.province || DEFAULT_REGION.province,
      city: location.city || DEFAULT_REGION.city,
      district: location.district || DEFAULT_REGION.district,
      lng: location.lng !== undefined ? location.lng : DEFAULT_REGION.lng,
      lat: location.lat !== undefined ? location.lat : DEFAULT_REGION.lat
    };
  };



  // 创建关键信息确认弹窗
  const showConfirmationDialog = (configData) => {
    return new Promise((resolve) => {
      // 计算关键信息
      const timeShichen = getShichenByTime(configData.birthTime || '12:30');
      const lng = configData.birthLocation?.lng || DEFAULT_REGION.lng;
      const trueSolarTime = calculateTrueSolarTime(configData.birthDate, configData.birthTime || '12:30', lng);
      const lunarInfo = calculateLunarDate(configData.birthDate);

      // 计算农历显示文本
      const lunarDisplayText = lunarInfo ? (lunarInfo.fullText || `${lunarInfo.yearInChinese}年${lunarInfo.monthInChinese}${lunarInfo.dayInChinese}`) : '';
      const yearGanZhi = lunarInfo?.yearGanZhi || '';

      // 创建确认弹窗
      const dialog = document.createElement('div');
      dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
      dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              🔍 请确认关键信息
            </h3>
            <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4 mb-6">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">基本信息</h4>
              <p class="text-sm text-blue-700 dark:text-blue-400">
                <strong>昵称：</strong>${configData.nickname || '未设置'}<br>
                <strong>性别：</strong>${GENDER_OPTIONS.find(opt => opt.value === configData.gender)?.label || '男'}<br>
                <strong>出生日期：</strong>${configData.birthDate || '未设置'}<br>
                <strong>出生时间：</strong>${configData.birthTime || '未设置'}<br>
                <strong>出生时辰：</strong>${timeShichen}
              </p>
            </div>

            ${lunarInfo ? `
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 class="font-semibold text-purple-800 dark:text-purple-300 mb-2">农历信息</h4>
              <p class="text-sm text-purple-700 dark:text-purple-400">
                <strong>农历生日：</strong><span class="font-bold">${lunarDisplayText}</span><br>
                <strong>干支年：</strong><span class="font-bold">${yearGanZhi}</span>
              </p>
            </div>
            ` : ''}

            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 class="font-semibold text-green-800 dark:text-green-300 mb-2">时辰信息</h4>
              <p class="text-sm text-green-700 dark:text-green-400">
                <strong>出生时辰：</strong><span class="font-bold">${timeShichen}</span><br>
                <strong>真太阳时：</strong><span class="font-bold">${trueSolarTime}</span><br>
                <strong>经度校正：</strong>${lng}°
              </p>
            </div>

            <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">出生时间标识</h4>
              <p class="text-sm text-yellow-700 dark:text-yellow-400">
                <strong>唯一标识：</strong><span class="font-bold">${generateBirthTimeKey(configData.nickname, configData.birthDate, configData.birthTime)}</span>
              </p>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 class="font-semibold text-purple-800 dark:text-purple-300 mb-2">八字计算</h4>
              <p class="text-sm text-purple-700 dark:text-purple-400">
                以上时辰和真太阳时将用于准确的八字计算。
                请确认信息无误后再保存。
              </p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3">
            <button id="cancel-save" class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              取消
            </button>
            <button id="confirm-save" class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              确认保存
            </button>
          </div>
        </div>
      `;

      // 添加事件监听
      dialog.querySelector('button').onclick = () => {
        document.body.removeChild(dialog);
        resolve(false);
      };
      
      dialog.querySelector('#cancel-save').onclick = () => {
        document.body.removeChild(dialog);
        resolve(false);
      };
      
      dialog.querySelector('#confirm-save').onclick = () => {
        document.body.removeChild(dialog);
        resolve(true);
      };

      // 添加到页面
      document.body.appendChild(dialog);
    });
  };

  // 保存配置（简化版：自动纠错 + 宽容验证）
  const handleSave = async (formData) => {
    // 清除之前的错误状态
    setSaveError(null);
    setValidationErrors([]);

    try {
      // 1. 自动纠错：修复常见的格式问题
      const autoFixedData = autoFixFormData(formData);
      
      // 2. 简化验证：只检查核心必填项，提供警告而不是错误
      const { errors, warnings } = validateRequiredInputs(autoFixedData);

      // 3. 显示警告信息（如果有的话）
      if (warnings.length > 0) {
        console.warn('保存配置时检测到问题，已自动修复:', warnings);
        showMessage(`⚠️ ${warnings.join('；')}`, 'warning');
      }

      // 4. 只有核心错误才阻止保存（如缺少出生日期）
      if (errors.length > 0) {
        console.error('核心数据缺失，无法保存:', errors);
        setSaveError(`无法保存：${errors[0]}`);
        showMessage(`❌ ${errors[0]}`, 'error');
        return;
      }

      // 5. 数据处理：使用自动纠错后的数据
      const processedData = {
        ...autoFixedData,
        // 标记配置来源（保持原有标记）
        isFromTemplate: isFromTemplate || false,
        templateSource: isFromTemplate ? (templateSource || '默认模板') : null
    };

    try {
      // 显示关键信息确认弹窗
      const confirmed = await showConfirmationDialog(processedData);
      if (!confirmed) {
        console.log('用户取消了保存');
        return;
      }
    } catch (error) {
      console.error('显示确认对话框失败:', error);
      // 确认对话框失败，记录错误但继续保存
      showMessage('⚠️ 确认对话框加载失败，将直接保存', 'warning');
    }

    const finalLocation = processedData.birthLocation;

    setIsSaving(true);

    // 尝试显示确认对话框（失败不影响保存）
    let confirmed = true;
    try {
      confirmed = await showConfirmationDialog(processedData);
    } catch (error) {
      console.warn('确认对话框加载失败，跳过确认步骤:', error);
      // 对话框失败不影响保存流程
    }

    if (!confirmed) {
      console.log('用户取消了保存');
      setIsSaving(false);
      return;
    }

    const finalLocation = processedData.birthLocation;

    setIsSaving(true);

    try {
      // 计算完整的时辰和农历信息（使用专业算法）
      const lng = finalLocation?.lng ?? DEFAULT_REGION.lng;
      const lat = finalLocation?.lat ?? DEFAULT_REGION.lat;

      // 确保 lng/lat 是有效数字（增加边界检查）
      const safeLng = typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180 
        ? lng 
        : DEFAULT_REGION.lng;
      const safeLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 
        ? lat 
        : DEFAULT_REGION.lat;

      let lunarFields;
      try {
        lunarFields = generateLunarAndTrueSolarFields(processedData);
      } catch (error) {
        console.warn('农历计算失败，使用默认值:', error);
        lunarFields = {
          lunarInfo: null,
          lunarBirthDate: processedData.birthDate || '',
          trueSolarTime: processedData.birthTime || '12:30'
        };
      }

      const shichenSimple = getShichenSimple(processedData.birthTime || '12:30');
      const shichenFull = getShichen(processedData.birthTime || '12:30');
      const timeShichen = getShichenByTime(processedData.birthTime || '12:30');
      const trueSolarTime = lunarFields?.trueSolarTime || processedData.birthTime || '12:30';

      // 生成出生时间唯一标识（按用户昵称ID封装）
      const birthTimeKey = generateBirthTimeKey(
        processedData.nickname || '',
        processedData.birthDate || '',
        processedData.birthTime || ''
      );

      // 创建安全、可序列化的配置对象，避免React错误#31
      let finalConfig = {
        // 基础字段
        nickname: (processedData.nickname || '').toString().trim(),
        realName: (processedData.realName || '').toString().trim(),
        birthDate: (processedData.birthDate || '').toString(),
        birthTime: (processedData.birthTime || '').toString(),
        gender: processedData.gender && ['male', 'female', 'secret'].includes(processedData.gender) 
          ? processedData.gender 
          : 'secret',
        zodiac: (processedData.zodiac || '').toString(),
        zodiacAnimal: (processedData.zodiacAnimal || '').toString(),
        mbti: (processedData.mbti || '').toString(),
        isused: Boolean(processedData.isused),

        // 结构化数据（确保可序列化）
        birthLocation: {
          province: (finalLocation.province || '').toString().trim(),
          city: (finalLocation.city || '').toString().trim(),
          district: (finalLocation.district || '').toString().trim(),
          lng: safeLng,
          lat: safeLat
        },
        shichen: shichenSimple,
        shichenFull: shichenFull,
        timeShichen: timeShichen,
        trueSolarTime: trueSolarTime,
        birthTimeKey: birthTimeKey,

        // 农历信息（使用专业计算结果，增加容错）
        lunarInfo: lunarFields?.lunarInfo && typeof lunarFields.lunarInfo === 'object' ? {
          year: lunarFields.lunarInfo.year || 0,
          month: lunarFields.lunarInfo.month || 0,
          day: lunarFields.lunarInfo.day || 0,
          yearGanZhi: (lunarFields.lunarInfo.yearGanZhi || '').toString(),
          monthGanZhi: (lunarFields.lunarInfo.monthGanZhi || '').toString(),
          dayGanZhi: (lunarFields.lunarInfo.dayGanZhi || '').toString(),
          yearInChinese: (lunarFields.lunarInfo.yearInChinese || '').toString(),
          monthInChinese: (lunarFields.lunarInfo.monthInChinese || '').toString(),
          dayInChinese: (lunarFields.lunarInfo.dayInChinese || '').toString(),
          zodiacAnimal: (lunarFields.lunarInfo.zodiacAnimal || '').toString(),
          fullText: (lunarFields.lunarInfo.fullText || '').toString(),
          shortText: (lunarFields.lunarInfo.shortText || '').toString()
        } : null,
        
        // 复杂对象（确保为null或简单对象）
        nameScore: processedData.nameScore && typeof processedData.nameScore === 'object' ? {
          tian: typeof processedData.nameScore.tian === 'number' ? processedData.nameScore.tian : 0,
          ren: typeof processedData.nameScore.ren === 'number' ? processedData.nameScore.ren : 0,
          di: typeof processedData.nameScore.di === 'number' ? processedData.nameScore.di : 0,
          wai: typeof processedData.nameScore.wai === 'number' ? processedData.nameScore.wai : 0,
          zong: typeof processedData.nameScore.zong === 'number' ? processedData.nameScore.zong : 0,
          mainType: typeof processedData.nameScore.mainType === 'string' ? processedData.nameScore.mainType : '',
          totalScore: typeof processedData.nameScore.totalScore === 'number' ? processedData.nameScore.totalScore : 0
        } : null,
        
        bazi: processedData.bazi && typeof processedData.bazi === 'object' ? {
          year: (processedData.bazi.year || '').toString(),
          month: (processedData.bazi.month || '').toString(),
          day: (processedData.bazi.day || '').toString(),
          hour: (processedData.bazi.hour || '').toString(),
          lunar: processedData.bazi.lunar && typeof processedData.bazi.lunar === 'object' ? {
            year: (processedData.bazi.lunar.year || '').toString(),
            month: (processedData.bazi.lunar.month || '').toString(),
            day: (processedData.bazi.lunar.day || '').toString(),
            text: (processedData.bazi.lunar.text || '').toString(),
            monthStr: (processedData.bazi.lunar.monthStr || '').toString(),
            dayStr: (processedData.bazi.lunar.dayStr || '').toString()
          } : null,
          wuxing: processedData.bazi.wuxing && typeof processedData.bazi.wuxing === 'object' ? {
            year: (processedData.bazi.wuxing.year || '').toString(),
            month: (processedData.bazi.wuxing.month || '').toString(),
            day: (processedData.bazi.wuxing.day || '').toString(),
            hour: (processedData.bazi.wuxing.hour || '').toString(),
            text: (processedData.bazi.wuxing.text || '').toString()
          } : null,
          nayin: processedData.bazi.nayin && typeof processedData.bazi.nayin === 'object' ? {
            year: (processedData.bazi.nayin.year || '').toString(),
            month: (processedData.bazi.nayin.month || '').toString(),
            day: (processedData.bazi.nayin.day || '').toString(),
            hour: (processedData.bazi.nayin.hour || '').toString()
          } : null,
          shichen: processedData.bazi.shichen && typeof processedData.bazi.shichen === 'object' ? {
            ganzhi: (processedData.bazi.shichen.ganzhi || '').toString(),
            name: (processedData.bazi.shichen.name || '').toString()
          } : null,
          solar: processedData.bazi.solar && typeof processedData.bazi.solar === 'object' ? {
            text: (processedData.bazi.solar.text || '').toString()
          } : null
        } : null,

        lastCalculated: processedData.lastCalculated || new Date().toISOString(),
        // 保持模板来源标记
        isFromTemplate: processedData.isFromTemplate || false,
        templateSource: processedData.templateSource || null
      };

      // 计算农历和真太阳时信息（简化处理，增加容错）
      try {
        const lunarFields2 = generateLunarAndTrueSolarFields(finalConfig);
        if (lunarFields2?.lunarBirthDate) {
          finalConfig.lunarBirthDate = lunarFields2.lunarBirthDate;
        }
        if (lunarFields2?.trueSolarTime) {
          finalConfig.trueSolarTime = lunarFields2.trueSolarTime;
        }
        finalConfig.lastCalculated = new Date().toISOString();
      } catch (error) {
        console.warn('农历计算失败，不影响保存:', error);
        // 农历计算失败不影响保存，只记录警告
      }

      // 显示保存中消息
      showMessage('正在保存配置...', 'info');

      try {
        // 异步保存数据
        const result = await onSave(index, finalConfig);

        if (result) {
          console.log('配置保存成功');
          showMessage('✅ 配置保存成功', 'success');
          
          // 保存成功后自动计算八字和紫薇星宫（完全异步，不阻塞）
          setTimeout(async () => {
            try {
              const savedConfig = index !== null && index !== undefined 
                ? userConfigManager.configs[index] 
                : userConfigManager.getCurrentConfig();
              
              if (!savedConfig) {
                console.warn('无法获取保存的配置，跳过命格计算');
                onClose();
                return;
              }
              
              // 异步计算八字和紫薇星宫（完全异步，失败不影响任何流程）
              try {
                const fortuneData = await userConfigManager.calculateFortuneByIndex(
                  index !== null && index !== undefined ? index : userConfigManager.getActiveConfigIndex()
                );
                
                if (fortuneData?.hasData) {
                  console.log('八字和紫薇星宫计算完成');
                  showMessage('✅ 八字和紫薇星宫计算完成', 'success');
                } else if (fortuneData?.hasErrors) {
                  console.warn('八字和紫薇星宫计算存在错误:', fortuneData.errors);
                  // 不显示警告，避免干扰用户
                }
              } catch (calcError) {
                console.error('计算八字和紫薇星宫失败:', calcError);
                // 计算失败完全静默处理，不影响任何流程
              }
              
              // 延迟关闭弹窗
              setTimeout(() => {
                onClose();
              }, 1000);
            } catch (asyncError) {
              console.error('异步计算过程失败:', asyncError);
              // 即使计算失败也正常关闭弹窗
              setTimeout(() => {
                onClose();
              }, 500);
            }
          }, 100);
        } else {
          throw new Error('保存配置返回失败结果');
        }

      } catch (error) {
        console.error('保存配置失败:', error);
        const errorMsg = `保存失败: ${error.message}`;
        setSaveError(errorMsg);
        showMessage(errorMsg, 'error');
        throw error;
      } finally {
        setIsSaving(false);
      }

    } catch (error) {
      console.error('保存配置失败:', error);
      const errorMsg = `保存失败: ${error.message}`;
      setSaveError(errorMsg);
      showMessage(errorMsg, 'error');
      setIsSaving(false);
      // 不再抛出错误，避免阻塞其他异步进程
    }
  };

  if (!isOpen) return null;

  // 如果有初始化错误，显示错误信息
  if (initError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md">
          <h3 className="text-lg font-bold text-red-600 mb-2">表单初始化失败</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{initError}</p>
          <button
            onClick={() => {
              setInitError(null);
              onClose();
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* 保存错误提示（新增） */}
        {saveError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-700 dark:text-red-300 mb-1">保存失败</h4>
                <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
                {validationErrors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setSaveError(null)}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  关闭提示
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">⚙️</span> {isNew ? '新建配置' : '修改配置'}
            </h3>
            {isFromTemplate && templateSource && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                复制自模板：{templateSource}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 touch-manipulation">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto overflow-x-hidden min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* 浮动错误提示 */}
            <div id="validation-errors" className="hidden fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-50 dark:bg-red-900/90 border-2 border-red-400 rounded-lg p-4 shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">输入验证失败</h4>
                  <ul id="validation-error-list" className="text-sm text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                    {/* 错误列表将动态插入 */}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('validation-errors').classList.add('hidden');
                  }}
                  className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('validation-errors').classList.add('hidden');
                  // 滚动到第一个错误字段
                  const errorList = document.getElementById('validation-error-list');
                  if (errorList && errorList.firstChild) {
                    // 获取第一个错误对应的字段
                    const firstError = errorList.firstChild.textContent;
                    // 尝试定位到对应字段
                    const errorField = document.querySelector(`[name="${firstError}"]`);
                    if (errorField) {
                      errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      errorField.focus();
                    }
                  }
                }}
                className="mt-3 w-full px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-300 rounded-md text-sm font-medium transition-colors"
              >
                定位到错误字段
              </button>
            </div>

            {/* 昵称 */}
            <div>
              <form.Field name="nickname">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      昵称 <span className="text-gray-400">(选填，留空将自动生成)</span>
                    </label>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base touch-manipulation touch-optimized"
                      placeholder="例如：小明、朋友、用户 (留空自动生成)"
                      style={{ fontSize: '16px' }}
                      autoComplete="off"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      💡 提示：可以自定义昵称，也可以留空让系统自动生成如"新用户1"、"朋友2"等
                    </p>
                    {formData.nickname && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已输入：{formData.nickname}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 真实姓名 */}
            <div>
              <form.Field name="realName">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      真实姓名 (选填)
                    </label>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base touch-manipulation touch-optimized"
                      placeholder="用于五格评分与八字测算 (可选)"
                      style={{ fontSize: '16px' }}
                      autoComplete="off"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      注：保存后将自动为中文姓名进行五格评分，无需手动操作。
                    </p>
                    {formData.realName && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已输入：{formData.realName}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 出生日期 */}
            <div>
              <form.Field
                name="birthDate"
              >
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      出生日期 <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-1">(必填)</span>
                    </label>
                    <input
                      type="date"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white text-base touch-manipulation touch-optimized ${
                        field.state.meta.error
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      style={{ fontSize: '16px' }}
                    />
                    {field.state.meta.error && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{field.state.meta.error}</p>
                    )}
                    {formData.birthDate && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          阳历：{formData.birthDate}
                        </p>
                        {calculatedInfo.lunarBirthDate && (
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            农历：{calculatedInfo.lunarBirthDate}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 性别 */}
            <div>
              <form.Field name="gender" defaultValue="male">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      性别
                    </label>
                    <div className="gender-options grid grid-cols-2 gap-2">
                      {GENDER_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          className={`p-3 rounded-md text-center text-base font-medium touch-manipulation transition-all duration-200 ${
                            field.state.value === option.value
                              ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md scale-105'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => field.handleChange(option.value)}
                          style={{ fontSize: '16px' }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      已选择：{GENDER_OPTIONS.find(opt => opt.value === formData.gender)?.label || '男'}
                    </p>
                  </>
                )}
              </form.Field>
            </div>

            {/* 出生时间 - 优化为时辰选择 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                出生时间 <span className="text-gray-400">(可选择精确时间或直接选择时辰)</span>
              </label>
              
              {/* 时辰快速选择 */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">🕐 快速选择时辰：</p>
                <div className="grid grid-cols-4 gap-1">
                  {SHICHEN_OPTIONS.map((shichen) => (
                    <button
                      key={shichen.value}
                      type="button"
                      onClick={() => {
                        const formField = form.getFieldInfo('birthTime');
                        if (formField) {
                          form.setFieldValue('birthTime', shichen.time);
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        calculatedInfo.timeShichen === shichen.label
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                      }`}
                      title={shichen.description}
                    >
                      {shichen.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 精确时间选择 */}
              <form.Field name="birthTime" defaultValue="12:30">
                {(field) => (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">⏰ 或选择精确时间：</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <MobileOptimizedSelect
                        value={field.state.value?.split(':')[0] || '12'}
                        onChange={(hour) => {
                          const minute = field.state.value?.split(':')[1] || '30';
                          field.handleChange(`${hour}:${minute}`);
                        }}
                        options={Array.from({ length: 24 }).map((_, i) => ({
                          value: i.toString().padStart(2, '0'),
                          label: `${i.toString().padStart(2, '0')}时`
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm touch-manipulation touch-optimized"
                        style={{ fontSize: '16px' }}
                      />
                      <span className="text-gray-500 text-lg">:</span>
                      <MobileOptimizedSelect
                        value={field.state.value?.split(':')[1] || '30'}
                        onChange={(minute) => {
                          const hour = field.state.value?.split(':')[0] || '12';
                          field.handleChange(`${hour}:${minute}`);
                        }}
                        options={[
                          { value: '00', label: '00分' },
                          { value: '15', label: '15分' },
                          { value: '30', label: '30分' },
                          { value: '45', label: '45分' }
                        ]}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm touch-manipulation"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    
                    {/* 计算结果展示 */}
                    <div className="text-sm space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-dashed border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <span>时辰：<span className="font-bold text-blue-600 dark:text-blue-400">{calculatedInfo.timeShichen || calculatedInfo.shichen}</span></span>
                          <span>真太阳时：<span className="font-bold text-purple-600 dark:text-purple-400">{calculatedInfo.trueSolarTime}</span></span>
                        </div>
                      </div>
                      {formData.birthTime && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          已选择：{formData.birthTime} ({calculatedInfo.timeShichen || calculatedInfo.shichen})
                        </p>
                      )}
                    </div>
                  </>
                )}
              </form.Field>
            </div>

            {/* 出生地点 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                出生地点 <span className="text-gray-400">(选填，用于计算真太阳时)</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                💡 提示：可以选择具体地区，也可以留空使用默认位置（北京）
              </p>

              <form.Field name="birthLocation" defaultValue={{ ...DEFAULT_REGION }}>
                {(field) => (
                  <div className="space-y-3">
                    {/* 省市区三级联动选择 - 统一样式和尺寸 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          省份
                        </label>
                        <input
                          type="text"
                          list="province-options"
                          value={field.state.value?.province || ''}
                          onChange={(e) => {
                            const newLocation = { ...field.state.value, province: e.target.value };
                            field.handleChange(newLocation);
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm touch-manipulation"
                          placeholder="省份"
                          style={{ fontSize: '16px' }}
                        />
                        <datalist id="province-options">
                          {REGION_DATA.map(p => (
                            <option key={p.name} value={p.name} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          城市
                        </label>
                        <input
                          type="text"
                          list="city-options"
                          value={field.state.value?.city || ''}
                          onChange={(e) => {
                            const newLocation = { ...field.state.value, city: e.target.value };
                            field.handleChange(newLocation);
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm touch-manipulation"
                          placeholder="城市"
                          style={{ fontSize: '16px' }}
                        />
                        <datalist id="city-options">
                          {REGION_DATA.find(p => p.name === field.state.value?.province)?.children.map(c => (
                            <option key={c.name} value={c.name} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          县区
                        </label>
                        <input
                          type="text"
                          list="district-options"
                          value={field.state.value?.district || ''}
                          onChange={(e) => {
                            const newLocation = { ...field.state.value, district: e.target.value };
                            field.handleChange(newLocation);
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm touch-manipulation"
                          placeholder="县区"
                          style={{ fontSize: '16px' }}
                        />
                        <datalist id="district-options">
                          {REGION_DATA.find(p => p.name === field.state.value?.province)
                            ?.children.find(c => c.name === field.state.value?.city)
                            ?.children.map(d => (
                              <option key={d.name} value={d.name} />
                            ))}
                        </datalist>
                      </div>
                    </div>

                    {/* 快速级联选择按钮 - 统一样式和尺寸 */}
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => handleRegionChange('province', e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white touch-manipulation"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">选择省</option>
                        {REGION_DATA.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        onChange={(e) => handleRegionChange('city', e.target.value)}
                        disabled={!field.state.value?.province}
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white touch-manipulation"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">选择市</option>
                        {REGION_DATA.find(p => p.name === field.state.value?.province)?.children.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <select
                        onChange={(e) => handleRegionChange('district', e.target.value)}
                        disabled={!field.state.value?.city}
                        className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white touch-manipulation"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">选县区</option>
                        {REGION_DATA.find(p => p.name === field.state.value?.province)
                          ?.children.find(c => c.name === field.state.value?.city)
                          ?.children.map(d => (
                            <option key={d.name} value={d.name}>{d.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* 经纬度输入 - 统一样式和尺寸 */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <CoordinateInput
                        label={<span>经度 <span className='text-red-500'>*</span></span>}
                        value={field.state.value?.lng ?? ''}
                        onChange={(value) => handleRegionChange('lng', value)}
                        error={validateCoordinate(field.state.value?.lng, 'lng')}
                        placeholder="-180~180"
                        min={-180}
                        max={180}
                        step={0.000001}
                      />
                      <CoordinateInput
                        label={<span>纬度 <span className='text-red-500'>*</span></span>}
                        value={field.state.value?.lat ?? ''}
                        onChange={(value) => handleRegionChange('lat', value)}
                        error={validateCoordinate(field.state.value?.lat, 'lat')}
                        placeholder="-90~90"
                        min={-90}
                        max={90}
                        step={0.000001}
                      />
                    </div>

                    {/* 当前位置预览 */}
                    {field.state.value?.province && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        当前位置：<strong>
                          {field.state.value.province} {field.state.value.city} {field.state.value.district}
                          {field.state.value.lng !== undefined && field.state.value.lat !== undefined && (
                            <> (经度: {field.state.value.lng.toFixed(2)}°, 纬度: {field.state.value.lat.toFixed(2)}°)</>
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* 星座 */}
            <div>
              <form.Field name="zodiac">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      星座
                    </label>
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      点击选择您的星座
                    </div>
                    <div className="selector-grid">
                      {ZODIAC_OPTIONS.map((zodiac) => (
                        <div
                          key={zodiac}
                          className={`selector-item performance-optimized touch-manipulation touch-optimized ${field.state.value === zodiac ? 'selected' : ''}`}
                          onClick={() => field.handleChange(zodiac)}
                          style={{ fontSize: '16px' }}
                        >
                          <div
                            className={`selector-icon zodiac-sign-icon zodiac-sign-icon-sm zodiac-sign-icon-${zodiac} ${field.state.value === zodiac ? 'selected' : ''}`}
                            data-symbol=""
                          ></div>
                          <span className="selector-label">{zodiac}</span>
                        </div>
                      ))}
                    </div>
                    {formData.zodiac && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{formData.zodiac}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 生肖 */}
            <div>
              <form.Field name="zodiacAnimal">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      生肖
                    </label>
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      点击选择您的生肖
                    </div>
                    <div className="selector-grid">
                      {ZODIAC_ANIMAL_OPTIONS.map((animal) => (
                        <div
                          key={animal}
                          className={`selector-item performance-optimized touch-manipulation touch-optimized ${field.state.value === animal ? 'selected' : ''}`}
                          onClick={() => field.handleChange(animal)}
                          style={{ fontSize: '16px' }}
                        >
                          <div
                            className={`selector-icon zodiac-icon zodiac-icon-sm zodiac-icon-${animal} ${field.state.value === animal ? 'selected' : ''}`}
                          ></div>
                          <span className="selector-label">{animal}</span>
                        </div>
                      ))}
                    </div>
                    {formData.zodiacAnimal && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{formData.zodiacAnimal}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* MBTI类型 */}
            <div>
              <form.Field name="mbti">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      MBTI类型
                    </label>
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      点击选择您的MBTI类型
                    </div>
                    <div className="selector-grid">
                      {MBTI_OPTIONS.map((type) => (
                        <div
                          key={type}
                          className={`selector-item performance-optimized touch-manipulation touch-optimized ${field.state.value === type ? 'selected' : ''}`}
                          onClick={() => field.handleChange(type)}
                          style={{ fontSize: '16px' }}
                        >
                          <div
                            className={`selector-icon mbti-icon mbti-icon-sm mbti-icon-${type} ${field.state.value === type ? 'selected' : ''}`}
                            data-type={type}
                          ></div>
                          <span className="selector-label">{type}</span>
                        </div>
                      ))}
                    </div>
                    {formData.mbti && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{formData.mbti}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 bg-white dark:bg-gray-800 shrink-0 mt-auto">
              <MobileOptimizedButton
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                取消
              </MobileOptimizedButton>
              <MobileOptimizedButton
                variant="primary"
                type="submit"
                disabled={isSaving || (!formData.nickname || !formData.birthDate)}
              >
                {isSaving ? '保存中...' : '保存配置'}
              </MobileOptimizedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 默认导出
export default ConfigEditModal;

// 同时支持命名导出，兼容动态导入
export { ConfigEditModal };
