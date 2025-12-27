import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import HealthRecordDisplay from './HealthRecordDisplay';
import MenstrualTrendChart from './MenstrualTrendChart';
import MenstrualKnowledgeCard from './MenstrualKnowledgeCard';
import { DataStorageManager } from '../utils/dataStorage';
import { PredictionEngine } from '../utils/predictionAlgorithm';
import { PhysiologicalScoreCalculator } from '../utils/physiologicalScore';
import ThemeToggle from './DarkModeToggle';

// 模拟症状数据
const SYMPTOMS = [
  { id: 'cramps', name: '痛经', emoji: ' 😭' },
  { id: 'headache', name: '头痛', emoji: ' 😠' },
  { id: 'fatigue', name: '疲劳', emoji: ' 😴' },
  { id: 'bloating', name: '腹胀', emoji: ' 🤰' },
  { id: 'mood', name: '情绪波动', emoji: ' 😤' },
  { id: 'nausea', name: '恶心', emoji: ' 🤢' }
];

// 模拟健康建议数据
const HEALTH_ADVICE = {
  menstrual: {
    diet: '多摄入富含铁质的食物，如红肉、菠菜等，补充经期流失的铁元素',
    exercise: '适度进行瑜伽、散步等轻柔运动，有助于缓解经期不适',
    emotion: '保持充足睡眠，尝试冥想或深呼吸练习来放松心情'
  },
  follicular: {
    diet: '增加蛋白质摄入，多吃豆类、坚果和鱼类，促进卵泡发育',
    exercise: '适合进行中等强度的有氧运动，如慢跑、游泳',
    emotion: '保持积极心态，有利于激素平衡'
  },
  ovulation: {
    diet: '增加抗氧化食物摄入，如蓝莓、西兰花等，保护卵子质量',
    exercise: '适合高强度间歇训练(HIIT)，提升身体活力',
    emotion: '此时精力充沛，适合挑战新事物'
  },
  luteal: {
    diet: '增加复合碳水化合物摄入，如燕麦、红薯，稳定血糖',
    exercise: '适度力量训练有助于缓解经前综合症',
    emotion: '注意情绪管理，避免过度压力'
  }
};

// 动态丝带样式
const ribbonStyles = `
  @keyframes ribbonFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes ribbonWave {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
  
  .ribbon-banner {
    background: linear-gradient(45deg, #ff9a9e, #fad0c4, #fbc2eb, #a6c1ee);
    background-size: 400% 400%;
    animation: ribbonFlow 8s ease infinite;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    color: white;
    padding: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  
  .ribbon-banner::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(105deg, 
      rgba(255,255,255,0) 40%, 
      rgba(255,255,255,0.2) 50%, 
      rgba(255,255,255,0) 60%);
    animation: shimmer 3s infinite;
  }
  
  .ribbon-banner::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 105, 180, 0.1) 50%, 
      transparent 100%);
    animation: ribbonWave 4s linear infinite;
  }
  
  .ribbon-content {
    position: relative;
    z-index: 1;
  }
  
  .ribbon-banner h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 6px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .ribbon-banner p {
    font-size: 0.875rem;
    opacity: 0.95;
    line-height: 1.4;
  }
`;

const MenstrualAssistant = () => {
  // 添加动态丝带样式到页面
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = ribbonStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const [cycles, setCycles] = useState([]);
  const [records, setRecords] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPhase, setCurrentPhase] = useState('menstrual');
  const [cycleDay, setCycleDay] = useState(1);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    cycleLength: 28,
    periodLength: 5
  });
  const [recordData, setRecordData] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: [],
    mood: 3,
    notes: ''
  });



  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await DataStorageManager.initialize();
        
        // 获取周期数据
        const cycleData = await DataStorageManager.getCycleData();
        setCycles(cycleData);
        
        // 获取健康记录
        const healthRecords = await DataStorageManager.getHealthRecords();
        setRecords(healthRecords);
        
        // 计算统计数据
        if (cycleData.length > 0) {
          const stats = PredictionEngine.calculateCycleStatistics(cycleData);
          setStatistics(stats);
          
          // 计算预测
          const pred = PredictionEngine.predictNextCycle(cycleData);
          setPrediction(pred);
          
          // 计算当前周期阶段
          const lastCycle = cycleData[cycleData.length - 1];
          const phase = PredictionEngine.getCurrentCyclePhase(
            selectedDate,
            new Date(lastCycle.startDate),
            lastCycle.cycleLength
          );
          setCurrentPhase(phase);
          
          // 计算当前周期天数
          const startDate = new Date(lastCycle.startDate);
          const diffTime = selectedDate.getTime() - startDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setCycleDay(diffDays > 0 ? diffDays : 1);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [selectedDate]);

  // 当周期数据变化时重新计算预测和统计
  useEffect(() => {
    if (cycles.length > 0) {
      const stats = PredictionEngine.calculateCycleStatistics(cycles);
      setStatistics(stats);
      
      const pred = PredictionEngine.predictNextCycle(cycles);
      setPrediction(pred);
    } else {
      setStatistics(null);
      setPrediction(null);
    }
  }, [cycles, selectedDate]);

  // 处理表单数据变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setRecordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理症状选择
  const toggleSymptom = (symptomId) => {
    setRecordData(prev => {
      const newSymptoms = prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(id => id !== symptomId)
        : [...prev.symptoms, symptomId];
      
      return {
        ...prev,
        symptoms: newSymptoms
      };
    });
  };

  // 提交周期数据
  const handleSubmitCycle = async (e) => {
    e.preventDefault();
    try {
      const newCycle = {
        id: Date.now().toString(),
        startDate: new Date(formData.startDate),
        cycleLength: parseInt(formData.cycleLength),
        periodLength: parseInt(formData.periodLength),
        symptoms: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await DataStorageManager.saveCycleData(newCycle);
      
      // 更新状态
      setCycles(prev => [...prev, newCycle]);
      setShowCycleForm(false);
      setFormData({
        startDate: '',
        cycleLength: 28,
        periodLength: 5
      });
    } catch (error) {
      console.error('保存周期数据失败:', error);
    }
  };

  // 提交健康记录
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      const newRecord = {
        id: Date.now().toString(),
        date: new Date(recordData.date),
        cyclePhase: currentPhase,
        symptoms: recordData.symptoms,
        mood: parseInt(recordData.mood),
        medication: [],
        notes: recordData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await DataStorageManager.saveHealthRecord(newRecord);
      
      // 更新状态
      setRecords(prev => [...prev, newRecord]);
      setShowRecordForm(false);
      setRecordData({
        date: new Date().toISOString().split('T')[0],
        symptoms: [],
        mood: 3,
        notes: ''
      });
    } catch (error) {
      console.error('保存健康记录失败:', error);
    }
  };

  // 获取选定日期的健康记录
  const getHealthRecordForDate = (date) => {
    return records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
  };

  // 获取当前阶段的健康建议
  const getCurrentHealthAdvice = () => {
    return HEALTH_ADVICE[currentPhase] || HEALTH_ADVICE.menstrual;
  };

  // 获取生理分数和建议
  const getPhysiologicalInfo = () => {
    const healthRecord = getHealthRecordForDate(selectedDate);
    const scores = PhysiologicalScoreCalculator.calculateOverallScore(
      currentPhase,
      cycleDay,
      healthRecord
    );
    
    const advice = PhysiologicalScoreCalculator.getLifeAdvice(
      scores,
      currentPhase,
      healthRecord
    );
    
    const tips = PhysiologicalScoreCalculator.getHealthTips(
      currentPhase,
      scores,
      healthRecord
    );
    
    return { scores, advice, tips };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  const healthAdvice = getCurrentHealthAdvice();
  const selectedRecord = getHealthRecordForDate(selectedDate);
  const physiologicalInfo = getPhysiologicalInfo();

  return (
    <div className="min-h-screen purple:bg-purple-50 dark:bg-gray-900 pink:bg-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 优化的头部标题和主题切换 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold purple:text-purple-900 dark:text-white pink:text-pink-900 flex items-center">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  经期助手
                </span>
              </h1>
              <p className="mt-2 purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">
                科学预测您的经期周期，提供个性化健康建议
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 主题切换按钮 */}
              <ThemeToggle />
            </div>
          </div>
          
          {/* 经期助手标语 */}
          <div className="ribbon-banner">
            <div className="ribbon-content flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">科学呵护您的每个月</h3>
                <p className="text-sm mt-1">
                  基于医学研究和大数据分析，为您提供精准的周期预测和个性化的健康指导
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowCycleForm(true)}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors shadow-sm"
          >
            添加经期记录
          </button>
          <button
            onClick={() => setShowRecordForm(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-sm"
          >
            添加健康记录
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要日历区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 日历视图 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900">日历视图</h2>
                <div className="text-sm purple:text-purple-600 dark:text-gray-400 pink:text-pink-600">
                  {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                </div>
              </div>
              <CalendarView 
                prediction={prediction} 
                cycles={cycles} 
                onDateSelect={setSelectedDate} 
              />
            </div>

            {/* 经期趋势分析 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h2 className="text-xl font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">经期趋势分析</h2>
              <MenstrualTrendChart 
                prediction={prediction} 
                cycles={cycles} 
                selectedDate={selectedDate} 
              />
            </div>
            
            {/* 经期知识小卡片和科学生活指南 */}
            <MenstrualKnowledgeCard />
          </div>

          {/* 侧边栏信息 */}
          <div className="space-y-6">
            {/* 周期信息 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">周期预测</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">当前周期天数</span>
                  <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">第 {cycleDay} 天</span>
                </div>
                {prediction && (
                  <>
                    <div className="flex justify-between">
                      <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">预计经期开始</span>
                      <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                        {prediction.nextPeriodStart.toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">预计排卵期</span>
                      <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                        {prediction.ovulationDate.toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">预测置信度</span>
                      <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                  </>
                )}
                {statistics && (
                  <>
                    <div className="flex justify-between">
                      <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">平均周期长度</span>
                      <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                        {statistics.averageCycleLength} 天
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">周期规律性</span>
                      <span className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                        {statistics.cycleRegularity === 'very_regular' ? '非常规律' : 
                         statistics.cycleRegularity === 'regular' ? '规律' : '不规律'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 选定日期详情 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900">
                  {selectedDate.toLocaleDateString('zh-CN', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </h3>
                <button
                  onClick={() => setShowRecordForm(true)}
                  className="text-sm text-pink-500 hover:text-pink-700 dark:hover:text-pink-400"
                >
                  添加记录
                </button>
              </div>
              <HealthRecordDisplay record={selectedRecord} date={selectedDate} />
            </div>

            {/* 生理周期阶段展示 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">当前阶段</h3>
              <div className="space-y-4">
                <div className={`flex items-center p-3 rounded-lg ${
                  currentPhase === 'menstrual' ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700' : 
                  currentPhase === 'follicular' ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700' : 
                  currentPhase === 'ovulation' ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700' : 
                  'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    currentPhase === 'menstrual' ? 'bg-pink-500' : 
                    currentPhase === 'follicular' ? 'bg-purple-500' : 
                    currentPhase === 'ovulation' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}></div>
                  <div>
                    <p className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">
                      {currentPhase === 'menstrual' ? '经期' : 
                       currentPhase === 'follicular' ? '卵泡期' : 
                       currentPhase === 'ovulation' ? '排卵期' : '黄体期'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentPhase === 'menstrual' ? '第1-5天 · 子宫内膜脱落' : 
                       currentPhase === 'follicular' ? '第6-13天 · 卵泡发育' : 
                       currentPhase === 'ovulation' ? '第14天 · 受孕最佳时机' : '第15-28天 · 黄体形成'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 综合生理分数 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">今日生理状态</h3>
              <div className="space-y-4">
                {/* 综合分数圆环 */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    {/* 背景圆环 */}
                    <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700"></div>
                    
                    {/* 分数圆环 */}
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#f0f0f0"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke={physiologicalInfo.scores.overall >= 70 ? '#48BB78' : 
                               physiologicalInfo.scores.overall >= 50 ? '#4299E1' : 
                               physiologicalInfo.scores.overall >= 30 ? '#ECC94B' : '#FF6B6B'}
                        strokeWidth="3"
                        strokeDasharray={`${physiologicalInfo.scores.overall} 100`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    
                    {/* 中心分数 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold" style={{ 
                        color: physiologicalInfo.scores.overall >= 70 ? '#48BB78' : 
                               physiologicalInfo.scores.overall >= 50 ? '#4299E1' : 
                               physiologicalInfo.scores.overall >= 30 ? '#ECC94B' : '#FF6B6B'
                      }}>
                        {physiologicalInfo.scores.overall}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">综合分</span>
                    </div>
                  </div>
                </div>
                
                {/* 各维度分数 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                      {physiologicalInfo.scores.emotion}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">情绪</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {physiologicalInfo.scores.physical}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">身体</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {physiologicalInfo.scores.intellectual}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">智力</div>
                  </div>
                </div>
                
                {/* 分数等级描述 */}
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={{
                    backgroundColor: physiologicalInfo.scores.overall >= 70 ? '#48BB7820' : 
                                    physiologicalInfo.scores.overall >= 50 ? '#4299E120' : 
                                    physiologicalInfo.scores.overall >= 30 ? '#ECC94B20' : '#FF6B6B20',
                    color: physiologicalInfo.scores.overall >= 70 ? '#48BB78' : 
                           physiologicalInfo.scores.overall >= 50 ? '#4299E1' : 
                           physiologicalInfo.scores.overall >= 30 ? '#ECC94B' : '#FF6B6B'
                  }}>
                    {PhysiologicalScoreCalculator.getScoreLevel(physiologicalInfo.scores.overall).level}
                  </span>
                </div>
              </div>
            </div>

            {/* 生活建议 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">生活建议</h3>
              <div className="space-y-3">
                <div className="p-3 blue:bg-blue-50 dark:bg-blue-900/20 pink:bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">工作建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    {physiologicalInfo.advice.work}
                  </p>
                </div>
                <div className="p-3 green:bg-green-50 dark:bg-green-900/20 pink:bg-green-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">运动建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    {physiologicalInfo.advice.exercise}
                  </p>
                </div>
                <div className="p-3 purple:bg-purple-50 dark:bg-purple-900/20 pink:bg-purple-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">饮食建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    {physiologicalInfo.advice.diet}
                  </p>
                </div>
                <div className="p-3 pink:bg-pink-50 dark:bg-pink-900/20 pink:bg-pink-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">情绪调节</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {physiologicalInfo.advice.emotion}
                  </p>
                </div>
              </div>
            </div>

            {/* 健康提示 */}
            {physiologicalInfo.tips.length > 0 && (
              <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
                <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">健康提示</h3>
                <div className="space-y-3">
                  {physiologicalInfo.tips.map((tip, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        tip.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' : 
                        tip.type === 'tip' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700' : 
                        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                      }`}
                    >
                      <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">{tip.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {tip.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 健康管理建议 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">健康建议</h3>
              <div className="space-y-3">
                <div className="p-3 blue:bg-blue-50 dark:bg-blue-900/20 pink:bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">饮食建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    {healthAdvice.diet}
                  </p>
                </div>
                <div className="p-3 green:bg-green-50 dark:bg-green-900/20 pink:bg-green-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">运动建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    {healthAdvice.exercise}
                  </p>
                </div>
                <div className="p-3 purple:bg-purple-50 dark:bg-purple-900/20 pink:bg-purple-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">情绪调节</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {healthAdvice.emotion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 优化的页脚 */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 经期助手 - 关爱女性健康
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                隐私政策
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                使用条款
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                联系我们
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              本应用提供的健康建议仅供参考，不能替代专业医疗诊断。如有严重不适，请及时就医。
            </p>
          </div>
        </div>
      </footer>

      {/* 添加周期记录模态框 */}
      {showCycleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-50 rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900">添加经期记录</h3>
                <button 
                  onClick={() => setShowCycleForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitCycle}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      经期开始日期
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border purple:border-purple-300 dark:border-gray-600 pink:border-pink-300 rounded-lg purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 purple:text-purple-900 dark:text-white pink:text-pink-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      周期长度 (天)
                    </label>
                    <input
                      type="number"
                      name="cycleLength"
                      value={formData.cycleLength}
                      onChange={handleFormChange}
                      min="20"
                      max="40"
                      className="w-full px-3 py-2 border purple:border-purple-300 dark:border-gray-600 pink:border-pink-300 rounded-lg purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 purple:text-purple-900 dark:text-white pink:text-pink-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      经期长度 (天)
                    </label>
                    <input
                      type="number"
                      name="periodLength"
                      value={formData.periodLength}
                      onChange={handleFormChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border purple:border-purple-300 dark:border-gray-600 pink:border-pink-300 rounded-lg purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 purple:text-purple-900 dark:text-white pink:text-pink-900"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCycleForm(false)}
                    className="px-4 py-2 purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 purple:bg-purple-200 dark:bg-gray-600 pink:bg-pink-200 rounded-lg hover:purple:bg-purple-300 dark:hover:bg-gray-500 hover:pink:bg-pink-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 添加健康记录模态框 */}
      {showRecordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-50 rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900">添加健康记录</h3>
                <button 
                  onClick={() => setShowRecordForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitRecord}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      记录日期
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={recordData.date}
                      onChange={handleRecordChange}
                      className="w-full px-3 py-2 border purple:border-purple-300 dark:border-gray-600 pink:border-pink-300 rounded-lg purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 purple:text-purple-900 dark:text-white pink:text-pink-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      症状
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SYMPTOMS.map(symptom => (
                        <div key={symptom.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={symptom.id}
                            checked={recordData.symptoms.includes(symptom.id)}
                            onChange={() => toggleSymptom(symptom.id)}
                            className="rounded text-pink-500 focus:ring-pink-500"
                          />
                          <label htmlFor={symptom.id} className="ml-2 text-sm purple:text-purple-700 dark:text-gray-300 pink:text-pink-700">
                            {symptom.emoji} {symptom.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      情绪状态 (1-5)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        name="mood"
                        min="1"
                        max="5"
                        value={recordData.mood}
                        onChange={handleRecordChange}
                        className="w-full"
                      />
                      <span className="text-sm purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 w-6">
                        {recordData.mood}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 mb-1">
                      备注
                    </label>
                    <textarea
                      name="notes"
                      value={recordData.notes}
                      onChange={handleRecordChange}
                      rows="3"
                      className="w-full px-3 py-2 border purple:border-purple-300 dark:border-gray-600 pink:border-pink-300 rounded-lg purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 purple:text-purple-900 dark:text-white pink:text-pink-900"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRecordForm(false)}
                    className="px-4 py-2 purple:text-purple-700 dark:text-gray-300 pink:text-pink-700 purple:bg-purple-200 dark:bg-gray-600 pink:bg-pink-200 rounded-lg hover:purple:bg-purple-300 dark:hover:bg-gray-500 hover:pink:bg-pink-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualAssistant;