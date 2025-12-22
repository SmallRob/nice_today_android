import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { userConfigManager } from '../utils/userConfigManager';
import '../styles/zodiac-icons.css';
import '../styles/zodiac-mbti-icons.css';
import '../styles/config-selectors.css';
import { getShichen, calculateTrueSolarTime } from '../utils/astronomy';
import { calculateFiveGrids, getCharStrokes, getMeaning } from '../utils/nameScoring';

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

// 姓名评分模态框
const NameScoringModal = ({ isOpen, onClose, name, isPersonal = false, onSaveScore }) => {
  const [step, setStep] = useState('input'); // input, result
  const [tempName, setTempName] = useState(''); // 临时输入的姓名
  const [splitName, setSplitName] = useState({ surname: '', firstName: '' });
  const [strokes, setStrokes] = useState({ surname: [], firstName: [] });
  const [analysisResult, setAnalysisResult] = useState(null);

  // 智能拆分中文姓名
  const smartSplitName = (fullName) => {
    if (!fullName) return { surname: '', firstName: '' };

    // 常见复姓列表
    const compoundSurnames = [
      '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人',
      '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '公冶',
      '太叔', '申屠', '公孙', '慕容', '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于',
      '司空', '闾丘', '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良',
      '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐', '段干', '百里',
      '呼延', '东郭', '南门', '羊舌', '微生', '公户', '公玉', '公仪', '梁丘', '公仲',
      '公上', '公门', '公山', '公坚', '左丘', '公伯', '西门', '公祖', '第五', '公乘',
      '贯丘', '公皙', '南荣', '东里', '东宫', '仲长', '子书', '子桑', '即墨', '达奚',
      '褚师'
    ];

    // 检查是否包含中文圆点（少数民族姓名分隔符）
    if (fullName.includes('·') || fullName.includes('•')) {
      const parts = fullName.split(/[·•]/);
      return {
        surname: parts[0] || '',
        firstName: parts.slice(1).join('') || ''
      };
    }

    // 检查是否是复姓
    for (const compoundSurname of compoundSurnames) {
      if (fullName.startsWith(compoundSurname)) {
        return {
          surname: compoundSurname,
          firstName: fullName.substring(compoundSurname.length)
        };
      }
    }

    // 根据姓名长度判断
    const nameLength = fullName.length;
    if (nameLength === 2) {
      // 两个字：第一个是姓
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength === 3) {
      // 三个字：第一个是姓，后两个是名
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength >= 4) {
      // 四个字及以上：默认前两个是姓（可能是复姓）
      return {
        surname: fullName.substring(0, 2),
        firstName: fullName.substring(2)
      };
    }

    // 默认情况
    return {
      surname: fullName.substring(0, 1),
      firstName: fullName.substring(1) || ''
    };
  };

  // 初始化拆解姓名
  useEffect(() => {
    if (isOpen) {
      const nameToUse = tempName || name || '';
      if (nameToUse) {
        // 使用智能拆分
        const split = smartSplitName(nameToUse);
        setSplitName(split);

        // 初始笔画获取
        const surnameChars = split.surname.split('');
        const firstNameChars = split.firstName.split('');

        setStrokes({
          surname: surnameChars.map(c => getCharStrokes(c)),
          firstName: firstNameChars.map(c => getCharStrokes(c))
        });
      }
      setStep('input');
    } else {
      // 关闭时重置临时姓名
      setTempName('');
    }
  }, [isOpen, name, tempName]);

  const handleCalculate = () => {
    const res = calculateFiveGrids(
      splitName.surname,
      splitName.firstName,
      strokes.surname.map(s => parseInt(s) || 1), // 默认值为1防错
      strokes.firstName.map(s => parseInt(s) || 1)
    );
    setAnalysisResult(res);

    // 如果是个人评分且有回调，保存评分结果
    if (isPersonal && onSaveScore && !tempName) {
      onSaveScore(res);
    }

    setStep('result');
  };

  const getScoreColor = (type) => {
    if (type === '吉') return 'text-green-600 dark:text-green-400';
    if (type === '半吉') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ touchAction: 'none' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🔮</span> 姓名五格剖象评分
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          {step === 'input' && (
            <div className="space-y-4">
              {/* 姓名输入框 - 允许临时输入他人姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isPersonal ? '您的姓名' : '输入姓名'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName || name || ''}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setTempName(newName);
                      // 自动重新拆分
                      if (newName) {
                        const split = smartSplitName(newName);
                        setSplitName(split);
                        const surnameChars = split.surname.split('');
                        const firstNameChars = split.firstName.split('');
                        setStrokes({
                          surname: surnameChars.map(c => getCharStrokes(c)),
                          firstName: firstNameChars.map(c => getCharStrokes(c))
                        });
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="输入中文姓名"
                  />
                  <button
                    onClick={() => {
                      const nameToSplit = tempName || name || '';
                      if (nameToSplit) {
                        const split = smartSplitName(nameToSplit);
                        setSplitName(split);
                        const surnameChars = split.surname.split('');
                        const firstNameChars = split.firstName.split('');
                        setStrokes({
                          surname: surnameChars.map(c => getCharStrokes(c)),
                          firstName: firstNameChars.map(c => getCharStrokes(c))
                        });
                      }
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-sm"
                  >
                    重新拆分
                  </button>
                </div>
                {!isPersonal && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    可为他人临时评分，结果不会保存
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                系统已智能拆分姓名和笔画数。如有错误，可手动调整或点击"重新拆分"。
              </div>

              {/* 姓氏设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓氏 (Surname)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.surname}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, surname: val }));
                      setStrokes(prev => ({ ...prev, surname: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入姓"
                  />
                  {splitName.surname.split('').map((char, idx) => (
                    <input
                      key={`s-${idx}`}
                      type="number"
                      value={strokes.surname[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.surname];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, surname: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              {/* 名字设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名字 (Name)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, firstName: val }));
                      setStrokes(prev => ({ ...prev, firstName: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入名"
                  />
                  {splitName.firstName.split('').map((char, idx) => (
                    <input
                      key={`n-${idx}`}
                      type="number"
                      value={strokes.firstName[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.firstName];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, firstName: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={handleCalculate} className="w-full">
                  开始评分
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && analysisResult && (
            <div className="space-y-6">
              {/* 总评卡片 */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-bold">{splitName.surname}{splitName.firstName}</h4>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">五格剖象</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">总格 (后运)</div>
                    <div className="text-2xl font-bold">{analysisResult.zong}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.zong).type}</div>
                  </div>
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">人格 (主运)</div>
                    <div className="text-2xl font-bold">{analysisResult.ren}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.ren).type}</div>
                  </div>
                </div>
              </div>

              {/* 详细列表 */}
              <div className="space-y-3">
                {[
                  { label: '天格 (祖运)', score: analysisResult.tian, desc: '代表祖先、长辈运势' },
                  { label: '人格 (主运)', score: analysisResult.ren, desc: '代表性格与核心运势' },
                  { label: '地格 (前运)', score: analysisResult.di, desc: '代表青年时期运势' },
                  { label: '外格 (副运)', score: analysisResult.wai, desc: '代表社交与外部关系' },
                  { label: '总格 (后运)', score: analysisResult.zong, desc: '代表一生整体运势' },
                ].map((item, idx) => {
                  const meaning = getMeaning(item.score);
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{item.label}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg font-mono font-bold mr-2 text-gray-700 dark:text-gray-300">{item.score}</span>
                          <span className={`px-2 py-0.5 text-xs rounded font-bold ${meaning.type === '吉' ? 'bg-green-100 text-green-700' :
                            meaning.type === '半吉' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {meaning.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 pl-1 border-l-2 border-gray-300 dark:border-gray-600">
                        {meaning.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setStep('input')} className="w-full">
                  重新调整
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 配置表单组件
const ConfigForm = ({ config, index, isActive, onSave, onDelete, onSetActive, isExpanded, onToggleExpand, configs, showMessage }) => {
  const [formData, setFormData] = useState({ ...config });
  const [hasChanges, setHasChanges] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false); // 评分弹窗状态
  const [isPersonalScoring, setIsPersonalScoring] = useState(true); // 是否为个人评分
  // 位置输入框状态
  const [locationInput, setLocationInput] = useState(() => formatLocationString(config.birthLocation || DEFAULT_REGION));
  const formRef = useRef(null);

  // 检查是否是新建配置
  const isNewConfig = !config.nickname && !config.birthDate;

  // 检测表单是否有变化
  useEffect(() => {
    const changed =
      formData.nickname !== config.nickname ||
      formData.realName !== config.realName ||
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
    // 逻辑更新：优先信任经纬度解析，解析失败则尝试保留用户输入，只要有地址即可
    let finalLocation = { ...formData.birthLocation };

    // 1. 尝试从 locationInput 解析经纬度
    // 允许宽松格式，比如直接输入 "39.9, 116.4"
    try {
      const lngMatch = locationInput.match(/经度[:：]\s*([-+]?\d+(\.\d+)?)/) || locationInput.match(/lng[:：]\s*([-+]?\d+(\.\d+)?)/);
      const latMatch = locationInput.match(/纬度[:：]\s*([-+]?\d+(\.\d+)?)/) || locationInput.match(/lat[:：]\s*([-+]?\d+(\.\d+)?)/);

      let parsedLng, parsedLat;

      if (lngMatch && latMatch) {
        parsedLng = parseFloat(lngMatch[1]);
        parsedLat = parseFloat(latMatch[1]);
      } else {
        // 尝试匹配纯数字对，例如 "116.48, 39.95" (经度在前)
        const pairMatch = locationInput.match(/([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)/);
        if (pairMatch) {
          // 默认假设前者是经度，后者是纬度 (中国习惯)
          const v1 = parseFloat(pairMatch[1]);
          const v3 = parseFloat(pairMatch[3]);
          // 简单判断范围: 纬度-90~90, 经度-180~180. 中国纬度大概 3~53, 经度 73~135
          // 如果第一个数 > 90，那肯定是经度。
          if (Math.abs(v1) > 90) { parsedLng = v1; parsedLat = v3; }
          else if (Math.abs(v3) > 90) { parsedLng = v3; parsedLat = v1; }
          else { parsedLng = v1; parsedLat = v3; } // 默认顺序
        }
      }

      if (parsedLng !== undefined && parsedLat !== undefined && !isNaN(parsedLng) && !isNaN(parsedLat)) {
        // 校验范围
        if (parsedLng >= -180 && parsedLng <= 180 && parsedLat >= -90 && parsedLat <= 90) {
          finalLocation.lng = parsedLng;
          finalLocation.lat = parsedLat;
        } else {
          // 经纬度超出范围，暂不更新
          console.warn('Coordinates out of range', parsedLng, parsedLat);
        }
      }

      // 更新地址文本部分
      // 如果输入包含括号，取括号前部分；否则整个作为地址
      const addressPart = locationInput.split(/[(\uff08]/)[0].trim();
      if (addressPart) {
        // 尝试简单拆分，如果拆分不出，就放在 District 或 Province 里作为兜底
        // 这里的 RegionData 只是 helper，不是 validator
        const parts = addressPart.split(/\s+/);
        if (parts.length === 3) {
          finalLocation.province = parts[0];
          finalLocation.city = parts[1];
          finalLocation.district = parts[2];
        } else if (parts.length === 2) {
          finalLocation.province = parts[0];
          finalLocation.city = parts[1];
          finalLocation.district = ''; // 或者保留原 District
        } else {
          // 无法拆分，直接保存到 province 字段作为通用地址字段使用，或者不做处理保留原样
          // 为了兼容显示，尽量保留结构。如果完全不匹配，就不更新结构化字段，只依靠 locationInput 的显示
          // 但我们需要保存结构化数据以便 astronomy.js 使用 (其实 astronomy.js 主要用 lng/lat)
          // 所以这里只要 lng/lat 对了就行。
          // 如果用户修改了文字但没改坐标，我们信任文字
        }
      }

      // 如果最终没有有效坐标，且是新建配置/或被用户清空，给予默认值 (北京)
      if (finalLocation.lng === undefined || finalLocation.lng === null) {
        finalLocation.lng = 116.40;
        finalLocation.lat = 39.90;
        finalLocation.province = '北京市';
        finalLocation.city = '北京市';
        finalLocation.district = '东城区';
        showMessage('未检测到有效经纬度，已默认设置为北京', 'info');
      }

    } catch (e) {
      console.error("Location parse error", e);
      // 出错时不阻断保存，保留原值或默认值
      if (!finalLocation.lng) {
        finalLocation = { ...DEFAULT_REGION };
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
            {formData.realName && (
              <div className="flex items-center ml-2 space-x-2">
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formData.realName}</span>
                {formData.nameScore && (
                  <span className={`px-2 py-0.5 text-xs rounded font-bold ${formData.nameScore.mainType === '吉' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    formData.nameScore.mainType === '半吉' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {formData.nameScore.mainType}
                  </span>
                )}
                <button
                  className="p-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (formData.realName && /[\u4e00-\u9fa5]/.test(formData.realName)) {
                      setIsPersonalScoring(true); // Set to personal scoring
                      setIsScoreModalOpen(true);
                    } else if (formData.realName) {
                      showMessage('评分功能主要针对中文姓名', 'info');
                      setIsPersonalScoring(true); // Set to personal scoring
                      setIsScoreModalOpen(true);
                    }
                  }}
                  title="五格评分"
                >
                  💯
                </button>
              </div>
            )}
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
              昵称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleFieldChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="用于应用内展示 (必需)"
            />
          </div>

          {/* 真实姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              真实姓名 (选填)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.realName || ''}
                onChange={(e) => handleFieldChange('realName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="用于五格评分与八字测算 (可选)"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              注：若不想保留真实姓名，请留空。留空将无法使用五格评分功能。
            </p>
          </div>

          {/* 评分弹窗 */}
          <NameScoringModal
            isOpen={isScoreModalOpen}
            onClose={() => {
              setIsScoreModalOpen(false);
              setIsPersonalScoring(true);
            }}
            name={formData.realName}
            isPersonal={isPersonalScoring}
            onSaveScore={(scoreResult) => {
              // 保存个人评分到配置
              const mainMeaning = getMeaning(scoreResult.ren);
              handleFieldChange('nameScore', {
                ...scoreResult,
                mainType: mainMeaning.type
              });
            }}
          />

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
  const [isTempScoringOpen, setIsTempScoringOpen] = useState(false); // 临时评分弹窗状态

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
      realName: '', // 真实姓名
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
            <Button
              variant="outline"
              onClick={() => setIsTempScoringOpen(true)}
              className="flex items-center space-x-1"
            >
              <span>💯</span>
              <span>为他人评分</span>
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

      {/* 临时评分弹窗 */}
      <NameScoringModal
        isOpen={isTempScoringOpen}
        onClose={() => setIsTempScoringOpen(false)}
        name=""
        isPersonal={false}
      />

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