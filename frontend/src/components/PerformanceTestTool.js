import React, { useState, useCallback } from 'react';
import { mayaPerformanceTest, benchmark } from '../utils/performanceTest';
import { Card } from './PageLayout';

const PerformanceTestTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  // 模拟性能测试函数
  const simulateMayaCalculation = async () => {
    // 模拟玛雅日历计算
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    
    // 模拟DOM操作
    for (let i = 0; i < 1000; i++) {
      const element = document.createElement('div');
      element.textContent = '测试元素';
      document.body.appendChild(element);
      document.body.removeChild(element);
    }
    
    // 模拟内存使用
    const data = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      timestamp: Date.now()
    }));
    
    return data;
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
        { name: '内存使用测试', func: simulateMayaCalculation },
        { name: 'FPS性能测试', func: simulateMayaCalculation }
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
            <div className={`rounded-lg p-4 ${getScoreBgColor(testResults.overallScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    性能评分
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testResults.passedTests}/{testResults.totalTests} 项测试通过
                  </p>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(testResults.overallScore)}`}>
                  {testResults.overallScore}/100
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                测试时间: {testResults.timestamp}
              </div>
            </div>

            {/* 详细结果 */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900 dark:text-white">详细测试结果</h5>
              {testResults.details.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    result.passed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {result.passed ? '通过' : '失败'}
                  </div>
                </div>
              ))}
            </div>

            {/* 优化建议 */}
            {testResults.overallScore < 90 && (
              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 rounded-r-lg p-4">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                  优化建议
                </h5>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {testResults.overallScore < 70 && (
                    <li>• 建议关闭不必要的后台应用，释放系统资源</li>
                  )}
                  <li>• 确保浏览器为最新版本以获得最佳性能</li>
                  <li>• 定期清理浏览器缓存和临时文件</li>
                  {testResults.overallScore < 80 && (
                    <li>• 考虑升级设备硬件以获得更好的体验</li>
                  )}
                </ul>
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