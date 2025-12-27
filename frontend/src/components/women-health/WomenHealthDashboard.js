import React, { useState, useEffect } from 'react';
import { DataStorageManager } from '../utils/dataStorage';
import { PredictionEngine } from '../utils/predictionAlgorithm';

const WomenHealthDashboard = () => {
  const [cycles, setCycles] = useState([]);
  const [records, setRecords] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPhase, setCurrentPhase] = useState('menstrual');
  const [cycleDay, setCycleDay] = useState(1);

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
  }, []);

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
  }, [cycles]);

  // 获取选定日期的健康记录
  const getHealthRecordForDate = (date) => {
    return records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen purple:bg-purple-50 dark:bg-gray-900 pink:bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen purple:bg-purple-50 dark:bg-gray-900 pink:bg-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold purple:text-purple-900 dark:text-white pink:text-pink-900">
            女性健康管理
          </h1>
          <p className="mt-2 purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">
            科学预测，贴心关怀，助力女性健康生活
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要日历区域 */}
          <div className="lg:col-span-2 purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
            <h2 className="text-xl font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">日历视图</h2>
            <div className="purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 rounded-lg p-8 text-center">
              <p className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">日历组件将在这里显示</p>
              <p className="text-sm purple:text-purple-600 dark:text-gray-500 pink:text-pink-600 mt-2">
                展示当月月历，经期预测范围用红色花朵图标标注，支持月份切换查看不同周期
              </p>
            </div>
          </div>

          {/* 侧边栏信息 */}
          <div className="space-y-6">
            {/* 周期信息 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">周期信息</h3>
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

            {/* 生理周期阶段展示 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">生理周期阶段</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-pink-50 dark:bg-pink-900/20 pink:bg-pink-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-pink-500 mr-3"></div>
                  <div>
                    <p className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">经期</p>
                    <p className="text-sm purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">第1-5天 · 子宫内膜脱落</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 pink:bg-purple-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <div>
                    <p className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">卵泡期</p>
                    <p className="text-sm purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">第6-13天 · 卵泡发育</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 pink:bg-yellow-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                  <div>
                    <p className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">排卵期</p>
                    <p className="text-sm purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">第14天 · 受孕最佳时机</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 pink:bg-orange-200 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                  <div>
                    <p className="font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">黄体期</p>
                    <p className="text-sm purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">第15-28天 · 黄体形成</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 健康管理建议 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">健康建议</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 pink:bg-blue-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">饮食建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    多摄入富含铁质的食物，如红肉、菠菜等，补充经期流失的铁元素
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 pink:bg-green-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">运动建议</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    适度进行瑜伽、散步等轻柔运动，有助于缓解经期不适
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 pink:bg-purple-100 rounded-lg">
                  <p className="text-sm font-medium purple:text-purple-900 dark:text-white pink:text-pink-900">情绪调节</p>
                  <p className="text-xs purple:text-purple-700 dark:text-gray-400 pink:text-pink-700 mt-1">
                    保持充足睡眠，尝试冥想或深呼吸练习来放松心情
                  </p>
                </div>
              </div>
            </div>

            {/* 健康记录 */}
            <div className="purple:bg-purple-100 dark:bg-gray-800 pink:bg-pink-100 rounded-xl shadow-sm border purple:border-purple-200 dark:border-gray-700 pink:border-pink-200 p-6">
              <h3 className="text-lg font-semibold purple:text-purple-900 dark:text-white pink:text-pink-900 mb-4">健康记录</h3>
              <div className="purple:bg-purple-50 dark:bg-gray-700 pink:bg-pink-50 rounded-lg p-4 text-center">
                <p className="purple:text-purple-700 dark:text-gray-400 pink:text-pink-700">健康记录将在这里显示</p>
                <p className="text-sm purple:text-purple-600 dark:text-gray-500 pink:text-pink-600 mt-2">
                  支持记录每日身体状况并生成周期报告
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenHealthDashboard;