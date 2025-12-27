/**
 * 用户配置模板功能测试脚本
 * 用于测试模板复制、修改和保存功能
 */

import { userConfigManager } from './userConfigManager';

/**
 * 测试套件
 */
class TemplateConfigTestSuite {
  constructor() {
    this.testResults = [];
  }

  /**
   * 记录测试结果
   */
  logTestResult(testName, passed, error = null) {
    const result = {
      test: testName,
      passed,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);

    const statusIcon = passed ? '✅' : '❌';
    const message = passed ? '通过' : `失败: ${error ? error.message : '未知错误'}`;
    console.log(`${statusIcon} ${testName}: ${message}`);
  }

  /**
   * 测试1: 深拷贝功能
   */
  async testDeepClone() {
    console.log('\n========== 测试1: 深拷贝功能 ==========');
    
    try {
      // 获取默认配置
      const defaultTemplate = userConfigManager.getDefaultTemplate();
      
      // 修改深拷贝后的配置
      const clonedConfig = userConfigManager.deepCloneConfig(defaultTemplate);
      clonedConfig.nickname = '测试用户';
      clonedConfig.birthDate = '2000-01-01';
      
      // 验证原始配置未被修改
      const originalTemplate = userConfigManager.getDefaultTemplate();
      const isOriginalUnchanged = originalTemplate.nickname !== '测试用户' && 
                                   originalTemplate.birthDate !== '2000-01-01';
      
      this.logTestResult(
        '深拷贝功能测试',
        isOriginalUnchanged,
        isOriginalUnchanged ? null : new Error('原始配置被修改')
      );
      
      return isOriginalUnchanged;
    } catch (error) {
      this.logTestResult('深拷贝功能测试', false, error);
      return false;
    }
  }

  /**
   * 测试2: 唯一昵称生成
   */
  async testUniqueNickname() {
    console.log('\n========== 测试2: 唯一昵称生成 ==========');
    
    try {
      // 生成多个昵称
      const nickname1 = userConfigManager.generateUniqueNickname();
      const nickname2 = userConfigManager.generateUniqueNickname();
      const nickname3 = userConfigManager.generateUniqueNickname();
      
      // 验证昵称唯一且递增
      const areAllUnique = nickname1 !== nickname2 && 
                           nickname2 !== nickname3 && 
                           nickname1 !== nickname3;
      
      const areIncremental = nickname1.endsWith('1') || 
                             nickname2.endsWith('2') || 
                             nickname3.endsWith('3');
      
      this.logTestResult(
        '唯一昵称生成测试',
        areAllUnique && areIncremental,
        areAllUnique && areIncremental ? null : new Error('昵称生成不符合预期')
      );
      
      return areAllUnique && areIncremental;
    } catch (error) {
      this.logTestResult('唯一昵称生成测试', false, error);
      return false;
    }
  }

  /**
   * 测试3: 从模板复制配置
   */
  async testDuplicateFromTemplate() {
    console.log('\n========== 测试3: 从模板复制配置 ==========');
    
    try {
      // 从模板复制配置
      const result = await userConfigManager.duplicateConfigFromTemplate({
        nickname: '测试复制用户'
      });
      
      if (!result.success) {
        throw new Error(result.error || '复制失败');
      }
      
      // 验证配置属性
      const config = result.config;
      const hasRequiredFields = config && 
                                 config.nickname && 
                                 config.birthDate && 
                                 config.birthTime &&
                                 config.birthLocation &&
                                 typeof config.isFromTemplate === 'boolean';
      
      const isMarkedAsTemplate = config.isFromTemplate === true;
      
      this.logTestResult(
        '从模板复制配置测试',
        hasRequiredFields && isMarkedAsTemplate,
        hasRequiredFields && isMarkedAsTemplate ? null : new Error('配置属性不完整')
      );
      
      return hasRequiredFields && isMarkedAsTemplate;
    } catch (error) {
      this.logTestResult('从模板复制配置测试', false, error);
      return false;
    }
  }

  /**
   * 测试4: 添加模板配置到存储
   */
  async testAddConfigFromTemplate() {
    console.log('\n========== 测试4: 添加模板配置到存储 ==========');
    
    try {
      // 获取初始配置数量
      const initialConfigs = userConfigManager.getAllConfigs();
      const initialCount = initialConfigs.length;
      
      // 从模板添加配置
      const result = await userConfigManager.addConfigFromTemplate({
        nickname: `测试用户${Date.now()}`
      });
      
      if (!result.success) {
        throw new Error(result.error || '添加失败');
      }
      
      // 验证配置已添加
      const newConfigs = userConfigManager.getAllConfigs();
      const newCount = newConfigs.length;
      const configAdded = newCount === initialCount + 1;
      
      // 验证新配置
      const addedConfig = newConfigs[newConfigs.length - 1];
      const isNewConfigValid = addedConfig && 
                               addedConfig.nickname && 
                               addedConfig.isFromTemplate;
      
      this.logTestResult(
        '添加模板配置到存储测试',
        configAdded && isNewConfigValid,
        configAdded && isNewConfigValid ? null : new Error('配置添加失败')
      );
      
      return configAdded && isNewConfigValid;
    } catch (error) {
      this.logTestResult('添加模板配置到存储测试', false, error);
      return false;
    }
  }

  /**
   * 测试5: 修改模板配置
   */
  async testUpdateConfigFromTemplate() {
    console.log('\n========== 测试5: 修改模板配置 ==========');
    
    try {
      // 先添加一个模板配置
      const addResult = await userConfigManager.addConfigFromTemplate({
        nickname: '待修改用户'
      });
      
      if (!addResult.success) {
        throw new Error(addResult.error || '添加测试配置失败');
      }
      
      // 获取配置索引
      const configs = userConfigManager.getAllConfigs();
      const index = configs.length - 1;
      
      // 修改配置
      const updateResult = await userConfigManager.updateConfigFromTemplate(index, {
        birthDate: '1995-06-15',
        gender: 'female'
      });
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || '修改失败');
      }
      
      // 验证修改结果
      const updatedConfig = updateResult.config;
      const isDateUpdated = updatedConfig.birthDate === '1995-06-15';
      const isGenderUpdated = updatedConfig.gender === 'female';
      const isStillTemplate = updatedConfig.isFromTemplate === true;
      
      this.logTestResult(
        '修改模板配置测试',
        isDateUpdated && isGenderUpdated && isStillTemplate,
        isDateUpdated && isGenderUpdated && isStillTemplate ? null : new Error('配置修改失败')
      );
      
      return isDateUpdated && isGenderUpdated && isStillTemplate;
    } catch (error) {
      this.logTestResult('修改模板配置测试', false, error);
      return false;
    }
  }

  /**
   * 测试6: 批量从模板复制
   */
  async testBatchDuplicateFromTemplate() {
    console.log('\n========== 测试6: 批量从模板复制 ==========');
    
    try {
      // 获取初始配置数量
      const initialConfigs = userConfigManager.getAllConfigs();
      const initialCount = initialConfigs.length;
      
      // 批量复制3个配置
      const batchCount = 3;
      const result = await userConfigManager.batchDuplicateFromTemplate(batchCount, {
        birthLocation: {
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          lng: 121.53,
          lat: 31.23
        }
      });
      
      if (!result.success) {
        throw new Error(result.error || '批量复制失败');
      }
      
      // 验证批量复制结果
      const newConfigs = userConfigManager.getAllConfigs();
      const newCount = newConfigs.length;
      const expectedCount = initialCount + batchCount;
      const configsAdded = newCount === expectedCount;
      
      // 验证所有新配置
      const addedConfigs = newConfigs.slice(initialCount);
      const allValid = addedConfigs.every(config => 
        config && config.nickname && config.isFromTemplate
      );
      
      // 验证昵称唯一
      const nicknames = addedConfigs.map(c => c.nickname);
      const uniqueNicknames = new Set(nicknames);
      const allNicknamesUnique = uniqueNicknames.size === batchCount;
      
      this.logTestResult(
        '批量从模板复制测试',
        configsAdded && allValid && allNicknamesUnique,
        configsAdded && allValid && allNicknamesUnique ? null : new Error('批量复制失败')
      );
      
      return configsAdded && allValid && allNicknamesUnique;
    } catch (error) {
      this.logTestResult('批量从模板复制测试', false, error);
      return false;
    }
  }

  /**
   * 测试7: 边界情况 - 空配置处理
   */
  async testEdgeCases() {
    console.log('\n========== 测试7: 边界情况处理 ==========');
    
    try {
      const tests = [];
      
      // 测试7.1: 从null配置深拷贝
      try {
        const cloned = userConfigManager.deepCloneConfig(null);
        tests.push({
          name: 'null配置深拷贝',
          passed: cloned === null
        });
      } catch (error) {
        tests.push({ name: 'null配置深拷贝', passed: false });
      }
      
      // 测试7.2: 从undefined配置深拷贝
      try {
        const cloned = userConfigManager.deepCloneConfig(undefined);
        tests.push({
          name: 'undefined配置深拷贝',
          passed: cloned === undefined
        });
      } catch (error) {
        tests.push({ name: 'undefined配置深拷贝', passed: false });
      }
      
      // 测试7.3: 从空对象复制
      try {
        const result = await userConfigManager.duplicateConfigFromTemplate({});
        tests.push({
          name: '空参数复制',
          passed: result.success && result.config && result.config.nickname
        });
      } catch (error) {
        tests.push({ name: '空参数复制', passed: false });
      }
      
      // 测试7.4: 从包含循环引用的配置复制
      try {
        const circularConfig = {};
        circularConfig.self = circularConfig;
        const cloned = userConfigManager.deepCloneConfig(circularConfig);
        tests.push({
          name: '循环引用处理',
          passed: cloned !== undefined && cloned.self === undefined
        });
      } catch (error) {
        tests.push({ name: '循环引用处理', passed: false });
      }
      
      const allPassed = tests.every(t => t.passed);
      
      tests.forEach(test => {
        this.logTestResult(test.name, test.passed);
      });
      
      return allPassed;
    } catch (error) {
      this.logTestResult('边界情况处理测试', false, error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('========================================');
    console.log('开始运行用户配置模板功能测试套件');
    console.log('========================================');
    
    const results = [];
    
    // 运行所有测试
    results.push(await this.testDeepClone());
    results.push(await this.testUniqueNickname());
    results.push(await this.testDuplicateFromTemplate());
    results.push(await this.testAddConfigFromTemplate());
    results.push(await this.testUpdateConfigFromTemplate());
    results.push(await this.testBatchDuplicateFromTemplate());
    results.push(await this.testEdgeCases());
    
    // 汇总测试结果
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(2);
    
    console.log('\n========================================');
    console.log('测试结果汇总');
    console.log('========================================');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log('========================================\n');
    
    // 导出测试报告
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate
      },
      details: this.testResults
    };
    
    return report;
  }
}

// 创建测试套件实例
const templateConfigTestSuite = new TemplateConfigTestSuite();

// 导出测试套件
export default templateConfigTestSuite;

// 如果直接运行此脚本，执行测试
if (typeof window === 'undefined') {
  templateConfigTestSuite.runAllTests()
    .then(report => {
      console.log('测试完成，测试报告:', JSON.stringify(report, null, 2));
      process.exit(report.summary.failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}
