import React, { useState, useCallback } from 'react';
import { mayaPerformanceTest } from '../utils/performanceTest';
import { Card } from './PageLayout';

const PerformanceTestTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    details: false,
    recommendations: false
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // 优化的性能测试函数
  const simulateMayaCalculation = async () => {
    // 模拟玛雅日历计算 - 更轻量级
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20));
    
    // 模拟DOM操作 - 减少操作次数
    for (let i = 0; i < 50; i++) {
      const element = document.createElement('div');
      element.textContent = '测试元素';
      element.style.display = 'none'; // 隐藏元素避免重绘
      document.body.appendChild(element);
      document.body.removeChild(element);
    }
    
    // 模拟内存使用 - 减少数据量
    const data = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      timestamp: Date.now()
    }));
    
    return data;
  };

  // 专门用于FPS测试的函数
  const simulateFPSMeasurement = async () => {
    // 简单的动画测试，不进行复杂操作
    const startTime = performance.now();
    
    // 模拟一些轻量级的动画操作
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          // 非常轻量级的操作
          const dummyElement = document.createElement('div');
          dummyElement.style.opacity = '0';
          document.body.appendChild(dummyElement);
          document.body.removeChild(dummyElement);
          resolve();
        });
      });
    }
    
    return performance.now() - startTime;
  };

  // 专门用于内存测试的函数
  const simulateMemoryUsage = async () => {
    // 创建一些临时对象来模拟内存使用
    const tempObjects = [];
    
    for (let i = 0; i < 100; i++) {
      tempObjects.push({
        id: i,
        data: new Array(100).fill(0).map((_, j) => j),
        timestamp: Date.now()
      });
    }
    
    // 短暂延迟后清理
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // 清理内存
    tempObjects.length = 0;
    
    return true;
  };

  // 运行性能测试
  const runPerformanceTest = useCallback(async () => {
    setIsRunning(true);
    setTestResults(null);
    setProgress(0);
    
    try {
      const testFunctions = [
        { name: '玛雅日历计算', func: simulateMayaCalculation },
        { name: 'DOM渲染测试', func: simulateMayaCalculation },
        { name: '内存使用测试', func: simulateMemoryUsage },
        { name: 'FPS性能测试', func: simulateFPSMeasurement }
      ];
      
      const results = [];
      
      for (let i = 0; i < testFunctions.length; i++) {
        const test = testFunctions[i];
        setCurrentTest(test.name);
        setProgress((i / testFunctions.length) * 100);
        
        try {
          const result = await mayaPerformanceTest.runCompleteTest(test.name, test.func);
          results.push(result);
        } catch (error) {
          results.push({
            componentName: test.name,
            error: error.message,
            score: 0,
            passed: false
          });
        }
        
        // 延迟以显示进度
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 计算总体评分
      const overallScore = Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length);
      const passedTests = results.filter(r => r.passed).length;
      
      setTestResults({
        overallScore,
        passedTests,
        totalTests: results.length,
        details: results,
        timestamp: new Date().toLocaleString()
      });
      
      setProgress(100);
      setCurrentTest('测试完成');
      
    } catch (error) {
      console.error('性能测试失败:', error);
      setTestResults({
        error: error.message,
        overallScore: 0,
        passedTests: 0,
        totalTests: 0,
        details: []
      });
    } finally {
      setTimeout(() => setIsRunning(false), 1000);
    }
  }, []);

  // 获取分数颜色
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取分数背景色
  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };
  
  // 优化切换展开/折叠状态，添加动画效果
  const toggleSection = useCallback((section) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // 设置动画定时器
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);
  
  // 优化的展开图标组件
  const ExpandIcon = ({ isExpanded }) => (
    <svg 
      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <Card title="性能测试工具" className="mb-6">
      <div className="space-y-4">
        {/* 测试说明 */}
        <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            设备性能评估
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            此工具将测试您的设备在运行玛雅日历、DOM渲染、内存使用等方面的本地化运算效能，
            生成综合评分报告并提供优化建议。
          </p>
        </div>

        {/* 测试控制 */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">性能测试</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              评估设备本地化运算效能
            </p>
          </div>
          
          <button
            onClick={runPerformanceTest}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isRunning 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? '测试中...' : '开始测试'}
          </button>
        </div>

        {/* 进度条 */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{currentTest}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 测试结果 */}
        {testResults && !isRunning && (
          <div className="space-y-4">
            {/* 总体评分 */}
            <div className={`rounded-lg overflow-hidden ${getScoreBgColor(testResults.overallScore)}`}>
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleSection('summary')}
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    性能评分
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testResults.passedTests}/{testResults.totalTests} 项测试通过
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`text-3xl font-bold ${getScoreColor(testResults.overallScore)}`}>
                    {testResults.overallScore}/100
                  </div>
                  <ExpandIcon isExpanded={expandedSections.summary} />
                </div>
              </div>
              
              {expandedSections.summary && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    测试时间: {testResults.timestamp}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">总体评级: </span>
                      <span className={`font-medium ${getScoreColor(testResults.overallScore)}`}>
                        {testResults.overallScore >= 90 ? '优秀' : 
                         testResults.overallScore >= 70 ? '良好' : 
                         testResults.overallScore >= 50 ? '一般' : '较差'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">通过率: </span>
                      <span className={`font-medium ${getScoreColor((testResults.passedTests / testResults.totalTests) * 100)}`}>
                        {Math.round((testResults.passedTests / testResults.totalTests) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 详细结果 */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => toggleSection('details')}
              >
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">详细测试结果</h5>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    {testResults.details.length} 项
                  </span>
                </div>
                <ExpandIcon isExpanded={expandedSections.details} />
              </div>
              
              <div className={`transition-all duration-300 overflow-hidden ${
                expandedSections.details ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-2">
                  {testResults.details.map((result, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-200 ${
                      isAnimating ? 'transform scale-95' : ''
                    }`}>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.componentName}
                        </span>
                        {result.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {result.error}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                        result.passed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {result.passed ? '通过' : '失败'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 优化建议 */}
            {testResults.overallScore < 90 && (
              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 rounded-r-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors duration-200"
                  onClick={() => toggleSection('recommendations')}
                >
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300">
                      优化建议
                    </h5>
                    <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      {testResults.overallScore < 70 ? '强烈建议' : '建议'}
                    </span>
                  </div>
                  <ExpandIcon isExpanded={expandedSections.recommendations} />
                </div>
                
                <div className={`transition-all duration-300 overflow-hidden ${
                  expandedSections.recommendations ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 pb-4 border-t border-yellow-200 dark:border-yellow-700 pt-2">
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      {testResults.overallScore < 70 && (
                        <li className="transition-all duration-200 hover:translate-x-1">• 建议关闭不必要的后台应用，释放系统资源</li>
                      )}
                      <li className="transition-all duration-200 hover:translate-x-1">• 确保浏览器为最新版本以获得最佳性能</li>
                      <li className="transition-all duration-200 hover:translate-x-1">• 定期清理浏览器缓存和临时文件</li>
                      {testResults.overallScore < 80 && (
                        <li className="transition-all duration-200 hover:translate-x-1">• 考虑升级设备硬件以获得更好的体验</li>
                      )}
                      <li className="transition-all duration-200 hover:translate-x-1">• 使用原生应用以获得更好的性能表现</li>
                      <li className="transition-all duration-200 hover:translate-x-1">• 在设置中启用本地计算模式，减少网络请求延迟</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 重新测试按钮 */}
            <button
              onClick={runPerformanceTest}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              重新测试
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PerformanceTestTool;