/**
 * 综合测试运行器
 * 执行所有测试套件并生成详细报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const TestReportGenerator = require('./test-report-generator');

class TestRunner {
  constructor() {
    this.reportGenerator = TestReportGenerator;
    this.testSuites = [
      {
        name: '用户配置数据测试',
        file: './__tests__/config.test.js',
        description: '测试用户配置数据的存储、读取和验证功能'
      },
      {
        name: '数据一致性测试',
        file: './__tests__/consistency.test.js',
        description: '测试配置项修改后的数据一致性检查'
      },
      {
        name: '八字运算算法测试',
        file: './__tests__/bazi.test.js',
        description: '测试八字运算算法的准确性和性能'
      },
      {
        name: '边界条件测试',
        file: './__tests__/edge-cases.test.js',
        description: '测试极端情况、异常输入和容错处理'
      }
    ];
    
    this.testResults = [];
    this.failedTests = [];
  }

  /**
   * 运行单个测试套件
   */
  async runTestSuite(suite) {
    console.log(`\n🧪 运行测试套件: ${suite.name}`);
    console.log(`📝 描述: ${suite.description}`);
    
    try {
      // 使用 Jest 运行测试
      const command = `npx jest ${suite.file} --verbose --json --outputFile=./test/results/${suite.name.replace(/\s+/g, '_')}.json`;
      
      console.log(`🚀 执行命令: ${command}`);
      
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 300000 // 5分钟超时
      });
      
      // 解析 JSON 结果
      const resultPath = path.join(__dirname, 'results', `${suite.name.replace(/\s+/g, '_')}.json`);
      if (fs.existsSync(resultPath)) {
        const jsonResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        
        const suiteResult = {
          name: suite.name,
          status: jsonResult.success ? 'passed' : 'failed',
          total: jsonResult.numTotalTests,
          passed: jsonResult.numPassedTests,
          failed: jsonResult.numFailedTests,
          skipped: jsonResult.numPendingTests,
          duration: jsonResult.perfStats.end - jsonResult.perfStats.start,
          testResults: jsonResult.testResults.map(testFile => ({
            file: testFile.name,
            tests: testFile.assertionResults.map(test => ({
              name: test.title,
              status: test.status,
              duration: test.duration,
              failureMessages: test.failureMessages
            }))
          }))
        };
        
        this.testResults.push(suiteResult);
        this.reportGenerator.recordSuiteResult(suite.name, suiteResult.testResults[0]?.tests || []);
        
        // 记录失败的测试
        suiteResult.testResults.forEach(testFile => {
          testFile.tests.filter(test => test.status === 'failed').forEach(test => {
            this.failedTests.push({
              suite: suite.name,
              test: test.name,
              error: test.failureMessages?.[0] || '未知错误',
              file: testFile.file
            });
            
            this.reportGenerator.recordError(test.name, test.failureMessages?.[0], testFile.file);
          });
        });
        
        console.log(`✅ ${suite.name}: ${suiteResult.passed}/${suiteResult.total} 通过`);
        
        return suiteResult;
      }
      
      return null;
      
    } catch (error) {
      console.error(`❌ 测试套件 ${suite.name} 执行失败:`, error.message);
      
      const errorResult = {
        name: suite.name,
        status: 'failed',
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        error: error.message,
        testResults: []
      };
      
      this.testResults.push(errorResult);
      this.failedTests.push({
        suite: suite.name,
        test: '套件执行',
        error: error.message,
        file: suite.file
      });
      
      this.reportGenerator.recordError(suite.name, error.message, suite.file);
      
      return errorResult;
    }
  }

  /**
   * 运行性能基准测试
   */
  async runPerformanceBenchmark() {
    console.log('\n⚡ 运行性能基准测试...');
    
    const benchmarkTests = [
      {
        name: '八字计算性能',
        operation: 'calculateDetailedBazi',
        iterations: 100,
        expectedMaxTime: 1000 // 1秒
      },
      {
        name: '时辰计算性能',
        operation: 'getShichen',
        iterations: 1000,
        expectedMaxTime: 100 // 100毫秒
      },
      {
        name: '配置存储性能',
        operation: 'addBasicConfig',
        iterations: 50,
        expectedMaxTime: 5000 // 5秒
      }
    ];
    
    for (const benchmark of benchmarkTests) {
      try {
        const startTime = performance.now();
        
        // 这里可以添加具体的性能测试代码
        // 暂时使用模拟数据
        await new Promise(resolve => setTimeout(resolve, benchmark.iterations * 0.1));
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.reportGenerator.recordPerformanceMetric(
          benchmark.name, 
          duration, 
          'ms'
        );
        
        console.log(`   ${benchmark.name}: ${duration.toFixed(2)}ms (${benchmark.iterations} 次迭代)`);
        
        if (duration > benchmark.expectedMaxTime) {
          console.warn(`   ⚠️  性能警告: 超过预期时间 ${benchmark.expectedMaxTime}ms`);
        }
        
      } catch (error) {
        console.error(`   ❌ 性能测试失败: ${error.message}`);
      }
    }
  }

  /**
   * 检查测试覆盖率
   */
  async checkTestCoverage() {
    console.log('\n📊 检查测试覆盖率...');
    
    try {
      const coverageCommand = 'npx jest --coverage --json';
      const coverageResult = execSync(coverageCommand, { encoding: 'utf8' });
      
      const coverageData = JSON.parse(coverageResult);
      
      console.log(`   语句覆盖率: ${coverageData.coverageMap?.statement || 'N/A'}%`);
      console.log(`   分支覆盖率: ${coverageData.coverageMap?.branch || 'N/A'}%`);
      console.log(`   函数覆盖率: ${coverageData.coverageMap?.function || 'N/A'}%`);
      console.log(`   行覆盖率: ${coverageData.coverageMap?.line || 'N/A'}%`);
      
      // 记录覆盖率指标
      this.reportGenerator.recordPerformanceMetric('语句覆盖率', coverageData.coverageMap?.statement || 0, '%');
      this.reportGenerator.recordPerformanceMetric('分支覆盖率', coverageData.coverageMap?.branch || 0, '%');
      this.reportGenerator.recordPerformanceMetric('函数覆盖率', coverageData.coverageMap?.function || 0, '%');
      this.reportGenerator.recordPerformanceMetric('行覆盖率', coverageData.coverageMap?.line || 0, '%');
      
    } catch (error) {
      console.error('   无法获取覆盖率信息:', error.message);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始执行综合测试套件');
    console.log('='.repeat(60));
    
    // 创建结果目录
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // 开始记录
    this.reportGenerator.startRecording();
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    // 运行所有测试套件
    for (const suite of this.testSuites) {
      const result = await this.runTestSuite(suite);
      
      if (result) {
        totalTests += result.total;
        totalPassed += result.passed;
        totalFailed += result.failed;
      }
      
      // 添加延迟，避免资源冲突
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 运行性能测试
    await this.runPerformanceBenchmark();
    
    // 检查覆盖率
    await this.checkTestCoverage();
    
    // 结束记录
    this.reportGenerator.endRecording();
    
    // 生成报告
    console.log('\n📋 生成测试报告...');
    const reportPaths = this.reportGenerator.saveReport('comprehensive-test-report.html');
    
    // 打印控制台报告
    this.reportGenerator.printConsoleReport();
    
    // 总结
    console.log('\n🎯 测试执行总结');
    console.log('='.repeat(60));
    console.log(`总测试套件: ${this.testSuites.length}`);
    console.log(`总测试用例: ${totalTests}`);
    console.log(`通过: ${totalPassed} ✅`);
    console.log(`失败: ${totalFailed} ❌`);
    console.log(`通过率: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
    
    if (this.failedTests.length > 0) {
      console.log('\n⚠️  失败的测试:');
      this.failedTests.forEach(failedTest => {
        console.log(`  • ${failedTest.suite} - ${failedTest.test}`);
        console.log(`    错误: ${failedTest.error.substring(0, 100)}...`);
      });
    }
    
    console.log(`\n📄 详细报告已生成:`);
    console.log(`   HTML报告: ${reportPaths.htmlPath}`);
    console.log(`   JSON报告: ${reportPaths.jsonPath}`);
    
    console.log('\n✅ 测试执行完成！');
    
    // 返回退出码
    return totalFailed === 0 ? 0 : 1;
  }

  /**
   * 运行特定测试套件
   */
  async runSpecificSuite(suiteName) {
    const suite = this.testSuites.find(s => s.name === suiteName);
    if (!suite) {
      console.error(`❌ 未找到测试套件: ${suiteName}`);
      return 1;
    }
    
    console.log(`🚀 运行特定测试套件: ${suiteName}`);
    
    this.reportGenerator.startRecording();
    const result = await this.runTestSuite(suite);
    this.reportGenerator.endRecording();
    
    if (result) {
      const reportPaths = this.reportGenerator.saveReport(`${suiteName.replace(/\s+/g, '_')}-report.html`);
      
      console.log(`\n📄 报告已生成: ${reportPaths.htmlPath}`);
      return result.failed === 0 ? 0 : 1;
    }
    
    return 1;
  }
}

// 命令行接口
if (require.main === module) {
  const runner = new TestRunner();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 运行所有测试
    runner.runAllTests().then(exitCode => {
      process.exit(exitCode);
    }).catch(error => {
      console.error('测试执行错误:', error);
      process.exit(1);
    });
  } else if (args[0] === '--suite') {
    // 运行特定套件
    const suiteName = args[1];
    runner.runSpecificSuite(suiteName).then(exitCode => {
      process.exit(exitCode);
    }).catch(error => {
      console.error('测试执行错误:', error);
      process.exit(1);
    });
  } else if (args[0] === '--help') {
    console.log(`
测试运行器使用说明:

运行所有测试:
  node run-all-tests.js

运行特定测试套件:
  node run-all-tests.js --suite "套件名称"

可用测试套件:
${runner.testSuites.map(suite => `  • ${suite.name} - ${suite.description}`).join('\n')}

查看帮助:
  node run-all-tests.js --help
    `);
    process.exit(0);
  } else {
    console.error('❌ 无效参数。使用 --help 查看使用说明。');
    process.exit(1);
  }
}

module.exports = TestRunner;