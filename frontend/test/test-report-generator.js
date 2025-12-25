/**
 * 测试报告生成器
 * 生成详细的测试报告，包括通过/失败用例统计和问题定位信息
 */

const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: [],
      startTime: null,
      endTime: null,
      duration: 0
    };
    this.errorDetails = [];
    this.performanceMetrics = [];
  }

  /**
   * 开始测试记录
   */
  startRecording() {
    this.testResults.startTime = new Date();
    console.log(`🚀 测试开始于: ${this.testResults.startTime.toLocaleString()}`);
  }

  /**
   * 结束测试记录
   */
  endRecording() {
    this.testResults.endTime = new Date();
    this.testResults.duration = this.testResults.endTime - this.testResults.startTime;
    console.log(`✅ 测试结束于: ${this.testResults.endTime.toLocaleString()}`);
    console.log(`⏱️  总耗时: ${(this.testResults.duration / 1000).toFixed(2)} 秒`);
  }

  /**
   * 记录测试套件结果
   */
  recordSuiteResult(suiteName, testResults) {
    const suiteResult = {
      name: suiteName,
      total: testResults.length,
      passed: testResults.filter(r => r.status === 'passed').length,
      failed: testResults.filter(r => r.status === 'failed').length,
      skipped: testResults.filter(r => r.status === 'skipped').length,
      tests: testResults
    };

    this.testResults.suites.push(suiteResult);
    this.testResults.total += suiteResult.total;
    this.testResults.passed += suiteResult.passed;
    this.testResults.failed += suiteResult.failed;
    this.testResults.skipped += suiteResult.skipped;

    console.log(`📊 套件 ${suiteName}: ${suiteResult.passed}/${suiteResult.total} 通过`);
  }

  /**
   * 记录错误详情
   */
  recordError(testName, error, stackTrace) {
    this.errorDetails.push({
      testName,
      error: error.message || error,
      stackTrace,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录性能指标
   */
  recordPerformanceMetric(metricName, value, unit = 'ms') {
    this.performanceMetrics.push({
      name: metricName,
      value,
      unit,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成详细的测试报告
   */
  generateDetailedReport() {
    const report = {
      summary: this.generateSummary(),
      suiteDetails: this.generateSuiteDetails(),
      errorAnalysis: this.generateErrorAnalysis(),
      performanceAnalysis: this.generatePerformanceAnalysis(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    return report;
  }

  /**
   * 生成测试摘要
   */
  generateSummary() {
    const passRate = (this.testResults.passed / this.testResults.total * 100).toFixed(2);
    
    return {
      totalTests: this.testResults.total,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      skipped: this.testResults.skipped,
      passRate: `${passRate}%`,
      duration: `${(this.testResults.duration / 1000).toFixed(2)} 秒`,
      startTime: this.testResults.startTime.toLocaleString(),
      endTime: this.testResults.endTime.toLocaleString()
    };
  }

  /**
   * 生成套件详情
   */
  generateSuiteDetails() {
    return this.testResults.suites.map(suite => ({
      name: suite.name,
      total: suite.total,
      passed: suite.passed,
      failed: suite.failed,
      skipped: suite.skipped,
      passRate: `${(suite.passed / suite.total * 100).toFixed(2)}%`,
      failedTests: suite.tests
        .filter(t => t.status === 'failed')
        .map(t => ({
          name: t.name,
          error: t.error?.message || t.error
        }))
    }));
  }

  /**
   * 生成错误分析
   */
  generateErrorAnalysis() {
    const errorTypes = {};
    this.errorDetails.forEach(error => {
      const errorType = error.error.split(':')[0] || '未知错误';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    return {
      totalErrors: this.errorDetails.length,
      errorTypes: Object.entries(errorTypes).map(([type, count]) => ({
        type,
        count,
        percentage: `${((count / this.errorDetails.length) * 100).toFixed(2)}%`
      })),
      frequentErrors: this.errorDetails
        .slice(0, 10) // 显示前10个错误
        .map(error => ({
          testName: error.testName,
          error: error.error,
          timestamp: error.timestamp
        }))
    };
  }

  /**
   * 生成性能分析
   */
  generatePerformanceAnalysis() {
    const metricsByType = {};
    this.performanceMetrics.forEach(metric => {
      if (!metricsByType[metric.name]) {
        metricsByType[metric.name] = [];
      }
      metricsByType[metric.name].push(metric.value);
    });

    return Object.entries(metricsByType).map(([name, values]) => {
      const sortedValues = values.sort((a, b) => a - b);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = sortedValues[Math.floor(values.length / 2)];

      return {
        name,
        count: values.length,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`,
        average: `${avg.toFixed(2)}ms`,
        median: `${median.toFixed(2)}ms`,
        trend: max > avg * 1.5 ? '有波动' : '稳定'
      };
    });
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    const recommendations = [];

    // 根据失败率给出建议
    const failureRate = this.testResults.failed / this.testResults.total;
    if (failureRate > 0.3) {
      recommendations.push({
        priority: '高',
        category: '测试质量',
        suggestion: '测试失败率较高，建议检查核心功能逻辑和测试用例设计',
        action: 'review_failed_tests'
      });
    }

    // 根据错误类型给出建议
    const errorAnalysis = this.generateErrorAnalysis();
    const frequentErrorTypes = errorAnalysis.errorTypes.filter(e => e.count > 1);
    
    frequentErrorTypes.forEach(errorType => {
      recommendations.push({
        priority: '中',
        category: '错误处理',
        suggestion: `频繁出现 ${errorType.type} 错误，建议加强相关错误处理机制`,
        action: 'improve_error_handling'
      });
    });

    // 性能建议
    const performanceAnalysis = this.generatePerformanceAnalysis();
    performanceAnalysis.forEach(metric => {
      if (metric.average > 1000) { // 超过1秒
        recommendations.push({
          priority: '中',
          category: '性能优化',
          suggestion: `${metric.name} 平均耗时较长，建议进行性能优化`,
          action: 'performance_optimization'
        });
      }
    });

    return recommendations;
  }

  /**
   * 生成HTML格式的报告
   */
  generateHTMLReport() {
    const report = this.generateDetailedReport();
    
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>八字应用测试报告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .card.passed { border-left: 4px solid #28a745; }
        .card.failed { border-left: 4px solid #dc3545; }
        .card.skipped { border-left: 4px solid #ffc107; }
        .card.total { border-left: 4px solid #007bff; }
        .card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
        .card .number { font-size: 32px; font-weight: bold; }
        .section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section h2 { color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
        .error-item { background: #fff5f5; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .recommendation { background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .recommendation.high { border-left-color: #dc3545; }
        .recommendation.medium { border-left-color: #ffc107; }
        .recommendation.low { border-left-color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 八字应用测试报告</h1>
            <p class="timestamp">生成时间: ${report.timestamp}</p>
        </div>

        <!-- 测试摘要 -->
        <div class="summary-cards">
            <div class="card total">
                <h3>总测试数</h3>
                <div class="number">${report.summary.totalTests}</div>
            </div>
            <div class="card passed">
                <h3>通过</h3>
                <div class="number">${report.summary.passed}</div>
            </div>
            <div class="card failed">
                <h3>失败</h3>
                <div class="number">${report.summary.failed}</div>
            </div>
            <div class="card skipped">
                <h3>跳过</h3>
                <div class="number">${report.summary.skipped}</div>
            </div>
        </div>

        <!-- 套件详情 -->
        <div class="section">
            <h2>📋 测试套件详情</h2>
            <table>
                <thead>
                    <tr>
                        <th>套件名称</th>
                        <th>总数</th>
                        <th>通过</th>
                        <th>失败</th>
                        <th>通过率</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.suiteDetails.map(suite => `
                        <tr>
                            <td>${suite.name}</td>
                            <td>${suite.total}</td>
                            <td>${suite.passed}</td>
                            <td>${suite.failed}</td>
                            <td>${suite.passRate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- 错误分析 -->
        <div class="section">
            <h2>❌ 错误分析</h2>
            <p>总错误数: ${report.errorAnalysis.totalErrors}</p>
            
            <h3>错误类型分布</h3>
            <table>
                <thead>
                    <tr>
                        <th>错误类型</th>
                        <th>数量</th>
                        <th>占比</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.errorAnalysis.errorTypes.map(error => `
                        <tr>
                            <td>${error.type}</td>
                            <td>${error.count}</td>
                            <td>${error.percentage}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3>常见错误详情</h3>
            ${report.errorAnalysis.frequentErrors.map(error => `
                <div class="error-item">
                    <strong>${error.testName}</strong><br>
                    ${error.error}<br>
                    <span class="timestamp">${error.timestamp}</span>
                </div>
            `).join('')}
        </div>

        <!-- 性能分析 -->
        <div class="section">
            <h2>⚡ 性能分析</h2>
            <table>
                <thead>
                    <tr>
                        <th>指标名称</th>
                        <th>样本数</th>
                        <th>最小值</th>
                        <th>最大值</th>
                        <th>平均值</th>
                        <th>中位数</th>
                        <th>趋势</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.performanceAnalysis.map(metric => `
                        <tr>
                            <td>${metric.name}</td>
                            <td>${metric.count}</td>
                            <td>${metric.min}</td>
                            <td>${metric.max}</td>
                            <td>${metric.average}</td>
                            <td>${metric.median}</td>
                            <td>${metric.trend}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- 改进建议 -->
        <div class="section">
            <h2>💡 改进建议</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.priority}">
                    <strong>[${rec.priority}优先级] ${rec.category}</strong><br>
                    ${rec.suggestion}<br>
                    <em>建议操作: ${rec.action}</em>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * 保存报告到文件
   */
  saveReport(filename = 'test-report.html') {
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, filename);
    const htmlReport = this.generateHTMLReport();
    
    fs.writeFileSync(reportPath, htmlReport);
    
    // 同时保存JSON格式的详细报告
    const jsonReport = this.generateDetailedReport();
    const jsonPath = path.join(reportDir, filename.replace('.html', '.json'));
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    console.log(`✅ 测试报告已保存到: ${reportPath}`);
    console.log(`📄 JSON格式报告: ${jsonPath}`);
    
    return {
      htmlPath: reportPath,
      jsonPath: jsonPath
    };
  }

  /**
   * 生成控制台报告
   */
  printConsoleReport() {
    const report = this.generateDetailedReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 测试报告摘要');
    console.log('='.repeat(80));
    console.log(`总测试数: ${report.summary.totalTests}`);
    console.log(`通过: ${report.summary.passed} ✅`);
    console.log(`失败: ${report.summary.failed} ❌`);
    console.log(`跳过: ${report.summary.skipped} ⏭️`);
    console.log(`通过率: ${report.summary.passRate}`);
    console.log(`耗时: ${report.summary.duration}`);
    
    console.log('\n📋 测试套件详情:');
    report.suiteDetails.forEach(suite => {
      console.log(`  ${suite.name}: ${suite.passed}/${suite.total} (${suite.passRate})`);
    });
    
    if (report.errorAnalysis.totalErrors > 0) {
      console.log('\n❌ 错误分析:');
      console.log(`  总错误数: ${report.errorAnalysis.totalErrors}`);
      report.errorAnalysis.errorTypes.forEach(error => {
        console.log(`  ${error.type}: ${error.count} (${error.percentage})`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      report.recommendations.forEach(rec => {
        console.log(`  [${rec.priority}] ${rec.suggestion}`);
      });
    }
    
    console.log('='.repeat(80));
  }
}

// 导出单例实例
module.exports = new TestReportGenerator();