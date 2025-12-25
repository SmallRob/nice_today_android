import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { REGION_DATA, DEFAULT_REGION } from '../data/ChinaLocationData';
import { getShichen, getShichenSimple, calculateTrueSolarTime } from '../utils/astronomy';
import { generateLunarAndTrueSolarFields } from '../utils/LunarCalendarHelper';

// 性别选项
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'secret', label: '保密' }
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
  const prevIsOpenRef = useRef(false);

  // 真太阳时和时辰信息
  const [calculatedInfo, setCalculatedInfo] = useState({
    shichen: '',
    trueSolarTime: ''
  });

  // 初始化默认值
  const defaultValues = useMemo(() => {
    if (isNew) {
      return {
        nickname: '',
        realName: '',
        birthDate: '',
        birthTime: '12:30',
        birthLocation: { ...DEFAULT_REGION },
        gender: 'secret',
        zodiac: '',
        zodiacAnimal: '',
        mbti: '',
        isused: false
      };
    } else if (config) {
      // 确保深拷贝 birthLocation 对象，避免引用问题
      return {
        nickname: config.nickname || '',
        realName: config.realName || '',
        birthDate: config.birthDate || '',
        birthTime: config.birthTime || '12:30',
        birthLocation: config.birthLocation ? {
          province: config.birthLocation.province || '',
          city: config.birthLocation.city || '',
          district: config.birthLocation.district || '',
          lng: config.birthLocation.lng ?? DEFAULT_REGION.lng,
          lat: config.birthLocation.lat ?? DEFAULT_REGION.lat
        } : { ...DEFAULT_REGION },
        gender: config.gender || 'secret',
        zodiac: config.zodiac || '',
        zodiacAnimal: config.zodiacAnimal || '',
        mbti: config.mbti || '',
        isused: config.isused ?? false
      };
    }
    return {
      nickname: '',
      realName: '',
      birthDate: '',
      birthTime: '12:30',
      birthLocation: { ...DEFAULT_REGION },
      gender: 'secret',
      zodiac: '',
      zodiacAnimal: '',
      mbti: '',
      isused: false
    };
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
      Object.entries(defaultValues).forEach(([key, value]) => {
        try {
          form.setFieldValue(key, value);
        } catch (e) {
          console.warn(`设置字段 ${key} 失败:`, e);
        }
      });
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

  // 实时计算时辰和真太阳时
  useEffect(() => {
    const shichen = getShichen(formData.birthTime || '12:30');
    const lng = formData.birthLocation?.lng || DEFAULT_REGION.lng;
    const trueSolarTime = calculateTrueSolarTime(formData.birthDate, formData.birthTime || '12:30', lng);
    setCalculatedInfo({ shichen, trueSolarTime });
  }, [formData.birthDate, formData.birthTime, formData.birthLocation]);

  // 处理地区变化 - 级联选择
  const handleRegionChange = (type, value) => {
    const currentLoc = formData.birthLocation || { ...DEFAULT_REGION };
    let newLoc = { ...currentLoc };

    if (type === 'province') {
      const provData = REGION_DATA.find(p => p.name === value);
      if (provData && provData.children?.[0]) {
        newLoc.province = value;
        const firstCity = provData.children[0];
        newLoc.city = firstCity.name;
        const firstDistrict = firstCity.children?.[0];
        if (firstDistrict) {
          newLoc.district = firstDistrict?.name || '';
          newLoc.lng = firstDistrict?.lng ?? 0;
          newLoc.lat = firstDistrict?.lat ?? 0;
        }
      }
    } else if (type === 'city') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === value);
      if (cityData && cityData.children?.[0]) {
        newLoc.city = value;
        const firstDistrict = cityData.children[0];
        if (firstDistrict) {
          newLoc.district = firstDistrict.name;
          newLoc.lng = firstDistrict.lng ?? 0;
          newLoc.lat = firstDistrict.lat ?? 0;
        }
      }
    } else if (type === 'district') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === newLoc.city);
      const distData = cityData?.children.find(d => d.name === value);
      if (distData) {
        newLoc.district = value;
        newLoc.lng = distData.lng ?? 0;
        newLoc.lat = distData.lat ?? 0;
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

  // 简化验证：只验证必填字段，减少不必要的警告
  const validateRequiredInputs = (formData) => {
    const errors = [];

    // 1. 验证昵称（必填）
    if (!formData.nickname || !formData.nickname.trim()) {
      errors.push('请输入昵称');
    } else if (formData.nickname.trim().length < 2) {
      errors.push('昵称至少需要2个字符');
    } else if (formData.nickname.trim().length > 20) {
      errors.push('昵称最多支持20个字符');
    }

    // 2. 验证出生日期（必填）
    if (!formData.birthDate) {
      errors.push('请选择出生日期');
    } else {
      // 简化日期验证：只检查基本格式
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(formData.birthDate)) {
        errors.push('出生日期格式错误，应为 YYYY-MM-DD');
      }
    }

    // 3. 验证出生时间（必填）
    if (!formData.birthTime || !formData.birthTime.trim()) {
      errors.push('请输入出生时间');
    } else {
      // 简化时间验证：只检查基本格式
      const timePattern = /^\d{1,2}:\d{2}$/;
      if (!timePattern.test(formData.birthTime)) {
        errors.push('出生时间格式错误，应为 HH:MM');
      }
    }

    // 4. 验证出生地点（必填）
    const loc = formData.birthLocation || {};
    if (!loc || typeof loc !== 'object') {
      errors.push('请提供完整的出生地点信息');
    } else if (!loc.province || !loc.city || loc.lng === undefined || loc.lat === undefined) {
      errors.push('请选择完整的出生地点（省、市、经纬度）');
    }

    return errors;
  };



  // 创建关键信息确认弹窗
  const showConfirmationDialog = (configData) => {
    return new Promise((resolve) => {
      // 计算关键信息
      const shichen = getShichen(configData.birthTime || '12:30');
      const lng = configData.birthLocation?.lng || DEFAULT_REGION.lng;
      const trueSolarTime = calculateTrueSolarTime(configData.birthDate, configData.birthTime || '12:30', lng);

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
                <strong>出生日期：</strong>${configData.birthDate || '未设置'}<br>
                <strong>出生时间：</strong>${configData.birthTime || '未设置'}
              </p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 class="font-semibold text-green-800 dark:text-green-300 mb-2">时辰信息</h4>
              <p class="text-sm text-green-700 dark:text-green-400">
                <strong>出生时辰：</strong><span class="font-bold">${shichen}</span><br>
                <strong>真太阳时：</strong><span class="font-bold">${trueSolarTime}</span><br>
                <strong>经度校正：</strong>${lng}°
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

  // 保存配置
  const handleSave = async (formData) => {
    // 简化验证：只验证必填字段
    const validationErrors = validateRequiredInputs(formData);

    if (validationErrors.length > 0) {
      // 显示浮动错误提示框
      const errorBox = document.getElementById('validation-errors');
      const errorList = document.getElementById('validation-error-list');

      if (errorBox && errorList) {
        // 清空并填充错误列表
        errorList.innerHTML = '';
        validationErrors.forEach(err => {
          const li = document.createElement('li');
          li.textContent = err;
          errorList.appendChild(li);
        });

        // 显示错误框
        errorBox.classList.remove('hidden');

        console.error('输入验证失败:', validationErrors);
      }
      return;
    }

    // 显示关键信息确认弹窗
    const confirmed = await showConfirmationDialog(formData);
    if (!confirmed) {
      console.log('用户取消了保存');
      return;
    }

    // 获取位置信息（确保有有效的经纬度）
    let finalLocation = formData.birthLocation || { ...DEFAULT_REGION };
    // 确保经纬度有效（使用默认值兜底）
    if (finalLocation.lng === undefined || finalLocation.lng === null || isNaN(finalLocation.lng)) {
      finalLocation.lng = DEFAULT_REGION.lng;
    }
    if (finalLocation.lat === undefined || finalLocation.lat === null || isNaN(finalLocation.lat)) {
      finalLocation.lat = DEFAULT_REGION.lat;
    }
    // 确保省市区有默认值
    if (!finalLocation.province) finalLocation.province = DEFAULT_REGION.province;
    if (!finalLocation.city) finalLocation.city = DEFAULT_REGION.city;
    if (!finalLocation.district) finalLocation.district = DEFAULT_REGION.district;

    setIsSaving(true);

    try {
      // 计算时辰信息
      const shichenSimple = getShichenSimple(formData.birthTime || '12:30');

      let finalConfig = {
        ...formData,
        birthLocation: finalLocation,
        shichen: shichenSimple,  // 保存简化格式的时辰
        // 确保必填字段有默认值
        isused: formData.isused ?? false,
        nameScore: formData.nameScore ?? null,
        bazi: formData.bazi ?? null,
        lunarInfo: formData.lunarInfo ?? null,
        lastCalculated: formData.lastCalculated ?? null
      };

      // 计算农历和真太阳时信息（简化处理）
      try {
        const lunarFields = generateLunarAndTrueSolarFields(finalConfig);
        if (lunarFields.lunarBirthDate) {
          finalConfig.lunarBirthDate = lunarFields.lunarBirthDate;
        }
        if (lunarFields.trueSolarTime) {
          finalConfig.trueSolarTime = lunarFields.trueSolarTime;
        }
        finalConfig.lastCalculated = new Date().toISOString();
      } catch (error) {
        console.warn('农历计算失败，不影响保存:', error);
        // 农历计算失败不影响保存
      }

      // 显示保存中消息
      showMessage('正在保存配置...', 'info');

      try {
        // 异步保存数据
        const result = await onSave(index, finalConfig);

        if (result) {
          console.log('配置保存成功');
          showMessage('✅ 配置保存成功', 'success');
          
          // 保存成功后延迟关闭弹窗
          setTimeout(() => {
            onClose();
          }, 500);
        } else {
          throw new Error('保存配置返回失败结果');
        }

      } catch (error) {
        console.error('保存配置失败:', error);
        showMessage(`保存失败: ${error.message}`, 'error');
        throw error;
      } finally {
        setIsSaving(false);
      }

    } catch (error) {
      console.error('保存配置失败:', error);
      showMessage(`保存失败: ${error.message}`, 'error');
      setIsSaving(false);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
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
              <form.Field
                name="nickname"
                validators={{
                  onChange: ({ value }) => (!value || !value.trim() ? '请输入昵称' : undefined),
                  onChangeAsync: async ({ value }) => {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    return !value || !value.trim() ? '昵称不能为空' : undefined;
                  }
                }}
              >
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      昵称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white text-base touch-manipulation touch-optimized ${
                        field.state.meta.error
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="用于应用内展示 (必需)"
                      style={{ fontSize: '16px' }}
                      autoComplete="off"
                    />
                    {field.state.meta.error && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{field.state.meta.error}</p>
                    )}
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
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{formData.birthDate}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 性别 */}
            <div>
              <form.Field name="gender" defaultValue="secret">
                {(field) => (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      性别
                    </label>
                    <div className="gender-options grid grid-cols-3 gap-2">
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
                    {formData.gender !== 'secret' && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{GENDER_OPTIONS.find(opt => opt.value === formData.gender)?.label || ''}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 出生时间 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                出生具体时间 (出生时辰)
              </label>
              <form.Field name="birthTime" defaultValue="12:30">
                {(field) => (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
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
                        className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base touch-manipulation touch-optimized"
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
                        className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-base touch-manipulation"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between bg-white dark:bg-gray-800 p-3 rounded border border-dashed border-gray-300 dark:border-gray-600">
                      <span>时辰：<span className="font-bold text-blue-600 dark:text-blue-400">{calculatedInfo.shichen}</span></span>
                      <span>真太阳时：<span className="font-bold text-purple-600 dark:text-purple-400">{calculatedInfo.trueSolarTime}</span></span>
                    </div>
                    {formData.birthTime && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        已选择：{formData.birthTime}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* 出生地点 */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                出生地点 (用于校准真太阳时)
              </label>

              <form.Field name="birthLocation" defaultValue={{ ...DEFAULT_REGION }}>
                {(field) => (
                  <div className="space-y-3">
                    {/* 省市区三级联动选择 - 统一样式和尺寸 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          省份 <span className="text-red-500">*</span>
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
                          城市 <span className="text-red-500">*</span>
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
                          县区 <span className="text-red-500">*</span>
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
