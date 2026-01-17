import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserParamsContext } from '../context/UserParamsContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import { allBodyMetrics, calculateBMI, getBMICategory, evaluateMetric, bodyMetricsConfig } from '../config/bodyMetricsConfig';
import HealthMetricAlert from '../components/health/HealthMetricAlert';

/**
 * 身体指标页面
 * 包含BMI计算和健康指标展示
 */
const BodyMetricsPage = () => {
  const navigate = useNavigate();
  const { getAge, getNickname, getBirthDate, getBirthDateString } = useUserParamsContext();
  const { currentConfig } = useUserConfig();

  // 本地存储键名
  const BODY_METRICS_STORAGE_KEY = 'bodyMetricsData';
  
  // 获取出生日期字符串（用于显示）
  const getBirthDateDisplay = () => {
    // 优先从用户参数获取出生日期字符串
    const birthDateString = getBirthDateString();
    if (birthDateString) {
      // 格式已经是 YYYY-MM-DD，提取年份
      const year = birthDateString.split('-')[0];
      return year + '年';
    }
    
    // 从currentConfig中获取出生日期
    if (currentConfig?.birthDate) {
      const birthDate = currentConfig.birthDate;
      // 判断是字符串还是Date对象
      if (typeof birthDate === 'string') {
        const year = birthDate.split('-')[0];
        return year + '年';
      } else if (birthDate instanceof Date) {
        return birthDate.getFullYear() + '年';
      }
    }
    
    // 返回默认值
    return '未设置出生年份';
  };

  const [bmiData, setBmiData] = useState({
    weight: '65',
    height: '170',
    bmi: null,
    category: null
  });
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [userInputs, setUserInputs] = useState({});
  const [activeCategory, setActiveCategory] = useState('bodyMetabolism');
  const isInitialLoadRef = useRef(true);


  // 初始化用户参数：加载保存的数据或使用默认值
  useEffect(() => {
    // 从本地存储加载保存的数据
    const savedData = localStorage.getItem(BODY_METRICS_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // 设置BMI数据
        if (parsed.bmiData) {
          setBmiData(prev => ({
            ...prev,
            weight: parsed.bmiData.weight || '65',
            height: parsed.bmiData.height || '170',
            bmi: parsed.bmiData.bmi,
            category: parsed.bmiData.category
          }));
        }
        // 设置用户输入的指标数据
        if (parsed.userInputs) {
          setUserInputs(parsed.userInputs);
        }
        return; // 使用保存的数据，跳过默认计算
      } catch (error) {
        console.error('Failed to parse saved body metrics data:', error);
      }
    }

    // 如果没有保存的数据，计算默认BMI
    const bmi = calculateBMI(65, 170);
    const category = getBMICategory(parseFloat(bmi));
    
    setBmiData(prev => ({
      ...prev,
      bmi: parseFloat(bmi),
      category
    }));
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    
    const dataToSave = {
      bmiData: {
        weight: bmiData.weight,
        height: bmiData.height,
        bmi: bmiData.bmi,
        category: bmiData.category
      },
      userInputs
    };
    
    try {
      localStorage.setItem(BODY_METRICS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save body metrics data:', error);
    }
  }, [bmiData, userInputs]);



  // 计算BMI
  const handleBMICalculation = () => {
    if (!bmiData.weight || !bmiData.height) {
      alert('请输入体重和身高');
      return;
    }

    const weight = parseFloat(bmiData.weight);
    const height = parseFloat(bmiData.height);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      alert('请输入有效的体重和身高');
      return;
    }

    const bmi = calculateBMI(weight, height);
    const category = getBMICategory(parseFloat(bmi));

    setBmiData({
      ...bmiData,
      bmi: parseFloat(bmi),
      category
    });
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInputs({
      ...userInputs,
      [name]: value
    });
  };

  // 处理键盘事件 - 空格键提交
  const handleKeyDown = (e, metricId) => {
    if (e.key === ' ') {
      e.preventDefault(); // 防止输入空格
      const value = e.target.value;
      if (value) {
        // 触发评估显示
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          // 状态已经通过userInputs更新，这里可以添加视觉反馈
          const evaluation = evaluateMetric(metricId, numericValue, getUserGender());
          if (evaluation) {
            // 可以添加短暂的高亮效果
            console.log(`提交${metricId}: ${value}, 评估: ${evaluation.level}`);
          }
        }
      }
    }
  };

  // 获取当前用户性别
  const getUserGender = () => {
    // 从用户配置中获取性别，如果不可用则默认为male
    return currentConfig?.gender || 'male';
  };

  // 获取指标评估结果
  const getMetricEvaluation = (metricId) => {
    const value = userInputs[metricId];
    if (!value) return null;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return null;

    return evaluateMetric(metricId, numericValue, getUserGender());
  };

  // 获取指标状态颜色
  const getMetricStatusColor = (level) => {
    switch (level) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'caution': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 按类别分组指标
  const metricsByCategory = {
    vitalSigns: bodyMetricsConfig.vitalSigns,
    bodyMetabolism: bodyMetricsConfig.bodyMetabolism,
    bloodChemistry: bodyMetricsConfig.bloodChemistry,
    organFunction: bodyMetricsConfig.organFunction,
    otherIndicators: bodyMetricsConfig.otherIndicators
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 pb-20">
      {/* 导航标题栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
        color: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            身体指标检测
          </h1>
          <button
            onClick={() => navigate('/organ-rhythm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px 12px',
              fontSize: '14px',
              borderRadius: '9999px'
            }}
          >
            器官节律
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* 用户信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">{getNickname()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getAge()}岁 | {getBirthDateDisplay()}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                健康监测
              </span>
            </div>
          </div>
        </div>

        {/* BMI计算卡片 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">⚖️</span>
            BMI体重指数计算
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">体重 (kg)</label>
              <input
                type="number"
                name="weight"
                value={bmiData.weight}
                onChange={(e) => setBmiData({...bmiData, weight: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="请输入体重"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">身高 (cm)</label>
              <input
                type="number"
                name="height"
                value={bmiData.height}
                onChange={(e) => setBmiData({...bmiData, height: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="请输入身高"
              />
            </div>
          </div>

          <button
            onClick={handleBMICalculation}
            className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
          >
            计算BMI
          </button>

          {bmiData.bmi !== null && (
            <div className="mt-4 p-4 bg-white/20 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold">{bmiData.bmi}</div>
                <div className={`text-lg font-semibold mt-1 ${
                  bmiData.category?.color === 'green' ? 'text-green-300' :
                  bmiData.category?.color === 'yellow' ? 'text-yellow-300' :
                  bmiData.category?.color === 'red' ? 'text-red-300' : 'text-blue-300'
                }`}>
                  {bmiData.category?.label}
                </div>
                <div className="text-sm mt-2 opacity-90">
                  {bmiData.category?.category === 'underweight' && '体重偏轻，注意营养均衡'}
                  {bmiData.category?.category === 'normal' && '体重正常，继续保持良好习惯'}
                  {bmiData.category?.category === 'overweight' && '体重超重，建议适当运动控制'}
                  {bmiData.category?.category === 'obese' && '体重肥胖，建议咨询医生调整'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 指标分类导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg mb-6 overflow-x-auto">
          <div className="flex justify-between">
            {Object.keys(metricsByCategory).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'vitalSigns' && '生命体征'}
                {category === 'bodyMetabolism' && '体格代谢'}
                {category === 'bloodChemistry' && '血液生化'}
                {category === 'organFunction' && '器官功能'}
                {category === 'otherIndicators' && '其他指标'}
              </button>
            ))}
          </div>
        </div>

        {/* 指标输入和展示 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            {activeCategory === 'vitalSigns' && '生命体征'}
            {activeCategory === 'bodyMetabolism' && '体格与代谢'}
            {activeCategory === 'bloodChemistry' && '血液生化'}
            {activeCategory === 'organFunction' && '器官功能'}
            {activeCategory === 'otherIndicators' && '其他指标'}
          </h3>

          <div className="space-y-4">
            {metricsByCategory[activeCategory].map((metric) => {
              const evaluation = getMetricEvaluation(metric.id);
              const statusColor = evaluation ? getMetricStatusColor(evaluation.level) : 'text-gray-600 bg-gray-50 border-gray-200';
              
              return (
                <div key={metric.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{metric.icon}</span>
                      <span className="font-medium text-gray-800 dark:text-white">{metric.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{metric.unit}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name={metric.id}
                      value={userInputs[metric.id] || ''}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, metric.id)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={`请输入${metric.name}（空格键提交）`}
                    />
                    <button
                      onClick={() => {
                        const value = userInputs[metric.id];
                        if (value) {
                          alert(`当前${metric.name}：${value} ${metric.unit}\n${metric.description}`);
                        } else {
                          alert(`${metric.name}：${metric.description}`);
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      说明
                    </button>
                  </div>

                  {evaluation && (
                    <div className="mt-2">
                      <HealthMetricAlert 
                        metricId={metric.id}
                        value={userInputs[metric.id]}
                        gender={getUserGender()}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 健康建议卡片 */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-4 shadow-lg mt-6">
          <h4 className="font-bold mb-2 flex items-center">
            <span className="mr-2">💡</span>
            健康小贴士
          </h4>
          <p className="text-sm opacity-90">
            {activeCategory === 'vitalSigns' && '定期监测生命体征，关注血压、心率变化，保持规律作息和适量运动。'}
            {activeCategory === 'bodyMetabolism' && '均衡饮食，控制体重，定期检测血糖血脂，预防代谢性疾病。'}
            {activeCategory === 'bloodChemistry' && '保持健康的生活方式，避免过度饮酒，定期体检关注血液指标变化。'}
            {activeCategory === 'organFunction' && '保护肝肾功能，避免滥用药物，定期体检及时发现器官功能异常。'}
            {activeCategory === 'otherIndicators' && '定期进行全面体检，关注各项指标变化，早发现早治疗潜在健康问题。'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BodyMetricsPage;