import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { userConfigManager } from '../utils/userConfigManager';
import '../styles/zodiac-icons.css';
import '../styles/zodiac-mbti-icons.css';
import '../styles/config-selectors.css';
import { getShichen, calculateTrueSolarTime } from '../utils/astronomy';
import { getShichen, calculateTrueSolarTime } from '../utils/astronomy';
import { REGION_DATA, DEFAULT_REGION } from '../data/ChinaLocationData';

// 格式化位置字符串
const formatLocationString = (loc) => {
  if (!loc) return '';
  const { province, city, district, lng, lat } = loc;
  // 过滤掉空值
  const parts = [province, city, district].filter(Boolean);
  let str = parts.join(' ');

  // 只有当经纬度都存在时才添加
  if (lng !== undefined && lat !== undefined && lng !== null && lat !== null) {
    // 保留部分小数位，避免过长
    const fmtLng = typeof lng === 'number' ? lng : parseFloat(lng);
    const fmtLat = typeof lat === 'number' ? lat : parseFloat(lat);
    if (!isNaN(fmtLng) && !isNaN(fmtLat)) {
      str += ` (经度: ${fmtLng}, 纬度: ${fmtLat})`;
    }
  }
  return str;
};

// 星座选项
const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// 生肖选项
const ZODIAC_ANIMAL_OPTIONS = [
  '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'
];

// 性别选项
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'secret', label: '保密' }
];

// MBTI类型选项
const MBTI_OPTIONS = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// 优化的加载组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

// 配置表单组件
const ConfigForm = ({ config, index, isActive, onSave, onDelete, onSetActive, isExpanded, onToggleExpand, configs, showMessage }) => {
  const [formData, setFormData] = useState({ ...config });
  const [hasChanges, setHasChanges] = useState(false);
  // 位置输入框状态
  const [locationInput, setLocationInput] = useState(() => formatLocationString(config.birthLocation || DEFAULT_REGION));
  const formRef = useRef(null);

  // 检查是否是新建配置
  const isNewConfig = !config.nickname && !config.birthDate;

  // 检测表单是否有变化
  useEffect(() => {
    const changed =
      formData.nickname !== config.nickname ||
      formData.birthDate !== config.birthDate ||
      formData.zodiac !== config.zodiac ||
      formData.zodiacAnimal !== config.zodiacAnimal ||
      formData.gender !== config.gender ||
      formData.mbti !== config.mbti ||
      formData.birthTime !== config.birthTime ||
      formData.shichen !== config.shichen ||
      formData.birthLocation?.district !== config.birthLocation?.district;
    setHasChanges(changed);

    // 不再自动保存，只有用户点击保存按钮时才保存
  }, [formData, config]);

  // 处理表单字段变化
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'birthTime') {
        newData.shichen = getShichen(value);
      }
      return newData;
    });
  }, []);

  // 计算真太阳时和时辰
  const [calculatedInfo, setCalculatedInfo] = useState({
    shichen: '',
    trueSolarTime: ''
  });

  useEffect(() => {
    const shichen = getShichen(formData.birthTime || '12:30');
    // 获取经度，默认北京朝阳
    const lng = formData.birthLocation?.lng || DEFAULT_REGION.lng;
    const trueSolarTime = calculateTrueSolarTime(formData.birthDate, formData.birthTime || '12:30', lng);

    setCalculatedInfo({
      shichen,
      trueSolarTime
    });
  }, [formData.birthDate, formData.birthTime, formData.birthLocation]);

  // 处理地区变化
  const handleRegionChange = (type, value) => {
    const currentLoc = formData.birthLocation || { ...DEFAULT_REGION };
    let newLoc = { ...currentLoc };

    if (type === 'province') {
      const provData = REGION_DATA.find(p => p.name === value);
      if (provData) {
        newLoc.province = value;
        // 默认选择第一个城市
        const firstCity = provData.children[0];
        newLoc.city = firstCity.name;
        // 默认选择第一个区县
        const firstDistrict = firstCity.children[0];
        newLoc.district = firstDistrict.name;
        newLoc.lng = firstDistrict.lng;
        newLoc.lat = firstDistrict.lat;
      }
    } else if (type === 'city') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === value);
      if (cityData) {
        newLoc.city = value;
        const firstDistrict = cityData.children[0];
        newLoc.district = firstDistrict.name;
        newLoc.lng = firstDistrict.lng;
        newLoc.lat = firstDistrict.lat;
      }
    } else if (type === 'district') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === newLoc.city);
      const distData = cityData?.children.find(d => d.name === value);
      if (distData) {
        newLoc.district = value;
        newLoc.lng = distData.lng;
        newLoc.lat = distData.lat;
      }
    }
    setFormData(prev => ({ ...prev, birthLocation: newLoc }));
    // 同步更新输入框
    setLocationInput(formatLocationString(newLoc));
  };

  // 处理位置输入框变化
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);

    // 尝试解析输入内容中的经纬度和地区名
    // 匹配格式: "省 市 区 (经度: 116.xxx, 纬度: 39.xxx)" 
    // 或者宽松格式，只要包含 "经度:数字" 和 "纬度:数字"

    try {
      // 提取经纬度
      const lngMatch = value.match(/经度[:：]\s*(\d+(\.\d+)?)/);
      const latMatch = value.match(/纬度[:：]\s*(\d+(\.\d+)?)/);

      if (lngMatch && latMatch) {
        const lng = parseFloat(lngMatch[1]);
        const lat = parseFloat(latMatch[1]);

        if (!isNaN(lng) && !isNaN(lat)) {
          // 尝试提取地区名（括号前的部分）
          const regionPart = value.split(/[(\uff08]/)[0].trim();
          const parts = regionPart.split(/\s+/);

          setFormData(prev => {
            const currentLoc = prev.birthLocation || { ...DEFAULT_REGION };
            return {
              ...prev,
              birthLocation: {
                ...currentLoc,
                // 如果能解析出地区名则更新，否则保留原样或仅更新经纬度
                province: parts[0] || currentLoc.province,
                city: parts[1] || currentLoc.city,
                district: parts[2] || currentLoc.district,
                lng: lng,
                lat: lat
              }
            };
          });
        }
      }
    } catch (err) {
      // 解析失败暂不处理，等待用户调整或保存时校验
      console.debug('Location parse error:', err);
    }
  };

  // 保存配置
  const handleSave = useCallback(() => {
    // 基本验证
    if (!formData.nickname.trim()) {
      showMessage('请输入昵称', 'error');
      return;
    }

    if (!formData.birthDate) {
      showMessage('请选择出生日期', 'error');
      return;
    }

    // 检查昵称是否已存在
    const isNicknameExists = configs.some((config, i) =>
      i !== index && config.nickname === formData.nickname
    );

    if (isNicknameExists) {
      showMessage('该昵称已存在，请重新输入', 'error');
      return;
    }

    // 校验位置信息
    // 再次尝试解析 locationInput 确保最终保存的数据与输入框一致
    let finalLocation = formData.birthLocation;
    try {
      const lngMatch = locationInput.match(/经度[:：]\s*(\d+(\.\d+)?)/);
      const latMatch = locationInput.match(/纬度[:：]\s*(\d+(\.\d+)?)/);

      if (lngMatch && latMatch) {
        const lng = parseFloat(lngMatch[1]);
        const lat = parseFloat(latMatch[1]);
        // 简单的范围校验
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
          const regionPart = locationInput.split(/[(\uff08]/)[0].trim();
          const parts = regionPart.split(/\s+/);

          finalLocation = {
            province: parts[0] || finalLocation.province || DEFAULT_REGION.province,
            city: parts[1] || finalLocation.city || DEFAULT_REGION.city,
            district: parts[2] || finalLocation.district || DEFAULT_REGION.district,
            lng,
            lat
          };
        } else {
          throw new Error('Coordinates out of range');
        }
      }
    } catch (e) {
      // 校验失败，回退到默认值或保持当前有效值（如果当前formData里的值是合法的）
      // 根据需求"若检验错误或保存的数据有误则以默认值为准"
      if (!finalLocation || !finalLocation.lng) {
        finalLocation = { ...DEFAULT_REGION };
        setLocationInput(formatLocationString(DEFAULT_REGION));
        showMessage('位置格式有误，已重置为默认值', 'warning');
      } else {
        // 恢复输入框为当前的有效值
        setLocationInput(formatLocationString(finalLocation));
        showMessage('位置输入格式有误，已自动修正', 'warning');
      }
    }

    const finalData = {
      ...formData,
      birthLocation: finalLocation
    };

    onSave(index, finalData);
    showMessage('配置保存成功', 'success');
  }, [formData, index, onSave, configs, showMessage]);

  // 重置表单
  const handleReset = useCallback(() => {
    setFormData({ ...config });
  }, [config]);

  return (
    <div className={`border rounded-lg overflow-hidden transition-shadow duration-200 performance-optimized ${isActive ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-gray-200 dark:border-gray-700'
      }`}>
      {/* 标题区域 */}
      <div
        className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => onToggleExpand(index)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isActive && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            <h3 className="font-medium text-gray-900 dark:text-white">
              {isNewConfig ? '新建配置' : (formData.nickname || `配置 ${index + 1}`)}
            </h3>
          </div>
          {hasChanges && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
              有未保存更改
            </span>
          )}
          {isNewConfig && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              新建
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isActive && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              当前使用
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 表单内容 */}
      {isExpanded && (
        <div className="p-4 space-y-4" ref={formRef}>
          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              昵称
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleFieldChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="输入您的昵称"
            />
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              出生日期
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleFieldChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              性别
            </label>
            <div className="gender-options grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`p-2 rounded-md text-center transition-all duration-200 text-sm font-medium ${formData.gender === option.value
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  onClick={() => handleFieldChange('gender', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 出生时间 - 移动到性别后面 */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              出生具体时间 (出生时辰)
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <select
                value={(formData.birthTime || '12:30').split(':')[0]}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = (formData.birthTime || '12:30').split(':')[1];
                  handleFieldChange('birthTime', `${hour}:${minute}`);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}时
                  </option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select
                value={(formData.birthTime || '12:30').split(':')[1]}
                onChange={(e) => {
                  const minute = e.target.value;
                  const hour = (formData.birthTime || '12:30').split(':')[0];
                  handleFieldChange('birthTime', `${hour}:${minute}`);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="00">00分</option>
                <option value="15">15分</option>
                <option value="30">30分</option>
                <option value="45">45分</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between bg-white dark:bg-gray-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-600">
              <span>时辰：<span className="font-medium text-blue-600 dark:text-blue-400">{calculatedInfo.shichen}</span></span>
              <span>真太阳时：<span className="font-medium text-purple-600 dark:text-purple-400">{calculatedInfo.trueSolarTime}</span></span>
            </div>
          </div>

          {/* 出生地点 - 三级联动 */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              出生地点 (用于校准真太阳时)
            </label>

            {/* 自由输入框 */}
            <div className="mb-3">
              <input
                type="text"
                value={locationInput}
                onChange={handleLocationInputChange}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm"
                placeholder="例如: 北京市 北京市 朝阳区 (经度: 116.48, 纬度: 39.95)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                可在上方直接修改经纬度，或使用下方选项快速填充
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 省份 */}
              <select
                value={formData.birthLocation?.province || DEFAULT_REGION.province}
                onChange={(e) => handleRegionChange('province', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* 城市 */}
              <select
                value={formData.birthLocation?.city || DEFAULT_REGION.city}
                onChange={(e) => handleRegionChange('city', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.find(p => p.name === (formData.birthLocation?.province || DEFAULT_REGION.province))?.children.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* 区县 */}
              <select
                value={formData.birthLocation?.district || DEFAULT_REGION.district}
                onChange={(e) => handleRegionChange('district', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.find(p => p.name === (formData.birthLocation?.province || DEFAULT_REGION.province))
                  ?.children.find(c => c.name === (formData.birthLocation?.city || DEFAULT_REGION.city))
                  ?.children.map(d => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))
                }
              </select>
            </div>
            {formData.birthLocation?.lng && (
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>经度: {formData.birthLocation.lng.toFixed(2)}°</span>
                <span>纬度: {formData.birthLocation.lat.toFixed(2)}°</span>
              </div>
            )}
          </div>

          {/* 星座 */}
          <div>
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
                  className={`selector-item performance-optimized ${formData.zodiac === zodiac ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('zodiac', zodiac)}
                >
                  <div
                    className={`selector-icon zodiac-sign-icon zodiac-sign-icon-sm zodiac-sign-icon-${zodiac} ${formData.zodiac === zodiac ? 'selected' : ''}`}
                    data-symbol=""
                  ></div>
                  <span className="selector-label">{zodiac}</span>
                </div>
              ))}
            </div>
            {formData.zodiac && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                已选择：<span className="font-medium">{formData.zodiac}</span>
              </div>
            )}
          </div>

          {/* 生肖 */}
          <div>
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
                  className={`selector-item performance-optimized ${formData.zodiacAnimal === animal ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('zodiacAnimal', animal)}
                >
                  <div
                    className={`selector-icon zodiac-icon zodiac-icon-sm zodiac-icon-${animal} ${formData.zodiacAnimal === animal ? 'selected' : ''}`}
                  ></div>
                  <span className="selector-label">{animal}</span>
                </div>
              ))}
            </div>
            {formData.zodiacAnimal && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                已选择：<span className="font-medium">{formData.zodiacAnimal}</span>
              </div>
            )}
          </div>



          {/* MBTI类型 */}
          <div>
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
                  className={`selector-item performance-optimized ${formData.mbti === type ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('mbti', type)}
                >
                  <div
                    className={`selector-icon mbti-icon mbti-icon-sm mbti-icon-${type} ${formData.mbti === type ? 'selected' : ''}`}
                    data-type={type}
                  ></div>
                  <span className="selector-label">{type}</span>
                </div>
              ))}
            </div>
            {formData.mbti && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                已选择：<span className="font-medium">{formData.mbti}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || (isNewConfig && (!formData.nickname || !formData.birthDate))}
            >
              {isNewConfig ? '创建配置' : '保存'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges || isNewConfig}
            >
              重置
            </Button>

            {!isActive && !isNewConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetActive(index)}
              >
                设为当前配置
              </Button>
            )}

            {(index > 0 || isNewConfig) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(index)}
              >
                删除
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 主组件
const UserConfigManagerComponent = () => {
  const [configs, setConfigs] = useState([]);
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // 用于显示提示信息

  // 初始化配置管理器 - 优化异步加载
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // 异步初始化配置管理器
        await new Promise(resolve => setTimeout(resolve, 100)); // 延迟加载避免卡顿
        await userConfigManager.initialize();
        setIsInitialized(true);

        // 异步加载配置
        await new Promise(resolve => setTimeout(resolve, 50));
        const allConfigs = userConfigManager.getAllConfigs();
        const activeIndex = userConfigManager.getActiveConfigIndex();

        setConfigs(allConfigs);
        setActiveConfigIndex(activeIndex);

        // 默认展开当前配置
        setExpandedIndex(activeIndex);
        setLoading(false);
      } catch (error) {
        console.error('初始化用户配置失败:', error);
        setError('初始化失败: ' + error.message);
        setLoading(false);
      }
    };

    init();
  }, []);

  // 添加配置变更监听器
  useEffect(() => {
    if (!isInitialized) return;

    const removeListener = userConfigManager.addListener(({
      configs: updatedConfigs,
      activeConfigIndex: updatedActiveIndex
    }) => {
      setConfigs([...updatedConfigs]);
      setActiveConfigIndex(updatedActiveIndex);
    });

    return () => {
      removeListener();
    };
  }, [isInitialized]);

  // 显示提示信息
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    // 3秒后自动清除消息
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, []);

  // 处理配置保存
  const handleSaveConfig = useCallback((index, configData) => {
    // 检查是否是新建配置（检查存储中是否存在）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isNewConfig = index >= storedConfigs.length;

    let success;
    if (isNewConfig) {
      // 新建配置，添加到存储
      success = userConfigManager.addConfig(configData);
    } else {
      // 现有配置，更新存储
      success = userConfigManager.updateConfig(index, configData);
    }

    if (success) {
      // 更新本地状态
      setConfigs(prev => {
        const newConfigs = [...prev];
        newConfigs[index] = configData;
        return newConfigs;
      });

      // 如果是新建配置，设置为活跃配置
      if (isNewConfig) {
        setActiveConfigIndex(index);
        userConfigManager.setActiveConfig(index);
      }

      // 强制重新加载所有组件，确保数据同步
      setTimeout(() => {
        userConfigManager.forceReloadAll();
      }, 100);
      showMessage('保存配置成功', 'success');
    } else {
      showMessage('保存配置失败，请重试', 'error');
    }
  }, [showMessage]);

  // 处理添加新配置 - 只创建临时配置，不直接保存
  const handleAddConfig = useCallback(() => {
    const newConfig = {
      nickname: '', // 留空让用户填写
      birthDate: '',
      birthTime: '12:30',
      shichen: '午时二刻',
      birthLocation: { ...DEFAULT_REGION },
      zodiac: '',
      zodiacAnimal: '',
      gender: 'secret',
      mbti: ''
    };

    // 只添加到本地状态，不保存到存储
    setConfigs(prev => {
      const newConfigs = [...prev, newConfig];
      // 展开新添加的配置
      setExpandedIndex(newConfigs.length - 1);
      return newConfigs;
    });
    showMessage('请填写配置信息并点击保存', 'info');
  }, [showMessage]);

  // 处理删除配置
  const handleDeleteConfig = useCallback((index) => {
    if (configs.length <= 1) {
      showMessage('至少需要保留一个配置', 'error');
      return;
    }

    // 检查是否是新建配置（检查存储中是否存在）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isNewConfig = index >= storedConfigs.length;

    // 使用自定义确认对话框替代window.confirm
    if (window.confirm('确定要删除这个配置吗？')) {
      let success;
      if (isNewConfig) {
        // 新建配置，只需从本地状态移除
        setConfigs(prev => prev.filter((_, i) => i !== index));
        // 调整展开索引
        setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
        showMessage('删除配置成功', 'success');
        return;
      } else {
        // 存储中的配置，需要从存储中移除
        success = userConfigManager.removeConfig(index);
        if (success) {
          // 更新本地状态
          setConfigs(prev => prev.filter((_, i) => i !== index));
          // 调整展开索引
          setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
          showMessage('删除配置成功', 'success');
        } else {
          showMessage('删除配置失败，请重试', 'error');
        }
      }
    }
  }, [configs.length, showMessage]);

  // 优化处理设置活跃配置 - 异步切换避免卡顿
  const handleSetActiveConfig = useCallback(async (index) => {
    if (isSwitching) return;

    try {
      setIsSwitching(true);
      setError(null);

      // 显示切换状态
      setActiveConfigIndex(index);

      // 异步设置活跃配置
      await new Promise(resolve => setTimeout(resolve, 50));
      const success = userConfigManager.setActiveConfig(index);

      if (success) {
        // 异步强制重新加载所有组件，确保新配置生效
        setTimeout(() => {
          userConfigManager.forceReloadAll();
        }, 200);

        // 延迟更新状态，确保UI流畅
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      } else {
        throw new Error('设置当前配置失败');
      }
    } catch (error) {
      console.error('切换配置失败:', error);
      setError('切换配置失败: ' + error.message);
      setIsSwitching(false);

      // 恢复之前的状态
      const activeIndex = userConfigManager.getActiveConfigIndex();
      setActiveConfigIndex(activeIndex);
    }
  }, [isSwitching]);

  // 处理展开/折叠
  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? -1 : index);
  }, []);

  // 处理导入配置
  const handleImportConfigs = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = e.target.result;
            const success = userConfigManager.importConfigs(jsonData);
            if (success) {
              showMessage('导入配置成功', 'success');
            } else {
              showMessage('导入配置失败，请检查文件格式', 'error');
            }
          } catch (error) {
            showMessage('读取文件失败: ' + error.message, 'error');
          }
        };

        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      showMessage('导入失败: ' + error.message, 'error');
    }
  }, [showMessage]);

  // 处理导出配置
  const handleExportConfigs = useCallback(() => {
    try {
      const jsonData = userConfigManager.exportConfigs();
      if (!jsonData) {
        showMessage('导出配置失败', 'error');
        return;
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `nice-today-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      showMessage('导出配置成功', 'success');
    } catch (error) {
      showMessage('导出配置失败: ' + error.message, 'error');
    }
  }, [showMessage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载配置...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900 border-l-4 border-red-400' : message.type === 'success' ? 'bg-green-50 dark:bg-green-900 border-l-4 border-green-400' : 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400'}`}>
          <p className={`${message.type === 'error' ? 'text-red-700 dark:text-red-300' : message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
            {message.text}
          </p>
        </div>
      )}
      {/* 当前配置信息 */}
      <Card title="当前配置信息">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
          {configs[activeConfigIndex] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">昵称：</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">{configs[activeConfigIndex].nickname}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生日期：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].birthDate}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">性别：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {GENDER_OPTIONS.find(opt => opt.value === (configs[activeConfigIndex].gender || 'secret'))?.label || '保密'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生时间：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {configs[activeConfigIndex].birthTime || '12:30'}
                  <span className="text-xs text-gray-500 ml-1">
                    ({configs[activeConfigIndex].shichen || getShichen(configs[activeConfigIndex].birthTime || '12:30')})
                  </span>
                </span>
              </div>
              <div className="col-span-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生地点：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {configs[activeConfigIndex].birthLocation?.province || '北京市'} {configs[activeConfigIndex].birthLocation?.city || '北京市'} {configs[activeConfigIndex].birthLocation?.district || '朝阳区'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">星座：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiac}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">生肖：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiacAnimal}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MBTI类型：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].mbti || 'ISFP'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">当前没有可用配置</p>
          )}
        </div>
      </Card>

      <Card title="用户配置管理" className="mb-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            在这里管理您的个人信息配置，包括昵称、出生日期、星座和生肖。
            您可以创建多个配置，并随时切换使用哪个配置。
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleAddConfig}>
              添加新配置
            </Button>
            <Button variant="outline" onClick={handleImportConfigs}>
              导入配置
            </Button>
            <Button variant="outline" onClick={handleExportConfigs}>
              导出配置
            </Button>
          </div>
        </div>
      </Card>

      {/* 配置列表 */}
      <div className="space-y-3">
        {configs.map((config, index) => (
          <ConfigForm
            key={index}
            config={config}
            index={index}
            isActive={index === activeConfigIndex}
            isExpanded={index === expandedIndex}
            onSave={handleSaveConfig}
            onDelete={handleDeleteConfig}
            onSetActive={handleSetActiveConfig}
            onToggleExpand={handleToggleExpand}
            configs={configs}
            showMessage={showMessage}
          />
        ))}
      </div>


    </div>
  );
};

export default UserConfigManagerComponent;