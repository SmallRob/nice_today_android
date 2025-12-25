/**
 * 模板复制功能测试脚本
 * 测试用户配置模板复制功能的各种场景
 */

import { enhancedUserConfigManager } from './EnhancedUserConfigManager.js';

/**
 * 测试 1: 基础模板复制功能
 */
async function testBasicTemplateCopy() {
  console.log('\n========== 测试 1: 基础模板复制功能 ==========');

  try {
    // 生成唯一昵称
    const uniqueName1 = enhancedUserConfigManager.generateUniqueNickname();
    console.log('生成的唯一昵称:', uniqueName1);

    // 从模板复制配置
    const templateConfig = await enhancedUserConfigManager.duplicateConfigFromTemplate({
      nickname: '测试用户1'
    });
    console.log('复制的模板配置:', {
      nickname: templateConfig.nickname,
      birthDate: templateConfig.birthDate,
      isSystemDefault: templateConfig.isSystemDefault,
      isused: templateConfig.isused
    });

    // 验证深拷贝：确保不会修改原始模板
    templateConfig.nickname = '修改后的昵称';
    const defaultTemplate = enhancedUserConfigManager.getDefaultTemplate();
    console.log('原始模板昵称是否被修改:', defaultTemplate.nickname === '修改后的昵称' ? '❌ 错误' : '✅ 正确');

  } catch (error) {
    console.error('测试 1 失败:', error);
  }
}

/**
 * 测试 2: 唯一昵称生成
 */
async function testUniqueNicknameGeneration() {
  console.log('\n========== 测试 2: 唯一昵称生成 ==========');

  try {
    // 测试昵称唯一性
    const names = [];
    for (let i = 0; i < 5; i++) {
      const name = enhancedUserConfigManager.generateUniqueNickname();
      names.push(name);
      console.log(`第 ${i + 1} 次生成昵称: ${name}`);
    }

    // 检查是否有重复
    const uniqueNames = new Set(names);
    console.log('昵称唯一性检查:', names.length === uniqueNames.size ? '✅ 全部唯一' : '❌ 存在重复');

  } catch (error) {
    console.error('测试 2 失败:', error);
  }
}

/**
 * 测试 3: 从模板添加配置并保存
 */
async function testAddConfigFromTemplate() {
  console.log('\n========== 测试 3: 从模板添加配置并保存 ==========');

  try {
    // 从模板添加配置（自动生成昵称）
    const success = await enhancedUserConfigManager.addConfigFromTemplate();
    console.log('从模板添加配置结果:', success ? '✅ 成功' : '❌ 失败');

    // 获取所有配置查看结果
    const allConfigs = enhancedUserConfigManager.getAllConfigs();
    console.log('当前配置数量:', allConfigs.length);
    console.log('最新配置:', allConfigs[allConfigs.length - 1]);

  } catch (error) {
    console.error('测试 3 失败:', error);
  }
}

/**
 * 测试 4: 批量从模板复制
 */
async function testBatchDuplicateFromTemplate() {
  console.log('\n========== 测试 4: 批量从模板复制 ==========');

  try {
    // 批量复制 3 个配置
    const newConfigs = await enhancedUserConfigManager.batchDuplicateFromTemplate(3, {
      birthLocation: {
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        lng: 121.53,
        lat: 31.23
      }
    });

    console.log('批量复制成功，创建配置数量:', newConfigs.length);
    newConfigs.forEach((config, index) => {
      console.log(`配置 ${index + 1}:`, {
        nickname: config.nickname,
        birthLocation: `${config.birthLocation.province} ${config.birthLocation.city}`
      });
    });

  } catch (error) {
    console.error('测试 4 失败:', error);
  }
}

/**
 * 测试 5: 并发安全检查
 */
async function testConcurrencySafety() {
  console.log('\n========== 测试 5: 并发安全检查 ==========');

  try {
    // 模拟并发复制
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(enhancedUserConfigManager.addConfigFromTemplate());
    }

    const results = await Promise.all(promises);
    console.log('并发复制结果:', results.every(r => r) ? '✅ 全部成功' : '❌ 部分失败');

    // 检查是否有重复昵称
    const allConfigs = enhancedUserConfigManager.getAllConfigs();
    const nicknames = allConfigs.map(c => c.nickname);
    const uniqueNicknames = new Set(nicknames);
    console.log('昵称重复检查:', nicknames.length === uniqueNicknames.size ? '✅ 无重复' : '❌ 存在重复');

  } catch (error) {
    console.error('测试 5 失败:', error);
  }
}

/**
 * 测试 6: 深拷贝安全性
 */
async function testDeepCopySafety() {
  console.log('\n========== 测试 6: 深拷贝安全性 ==========');

  try {
    // 获取默认模板
    const template1 = enhancedUserConfigManager.getDefaultTemplate();
    const template2 = enhancedUserConfigManager.duplicateConfigFromTemplate();

    // 修改 template1
    template1.nickname = '修改后的模板1';
    template1.birthLocation.province = '测试省份';

    // 检查 template2 是否被影响
    const isIndependent = template2.nickname !== '修改后的模板1' &&
                         template2.birthLocation.province !== '测试省份';

    console.log('深拷贝隔离性检查:', isIndependent ? '✅ 完全隔离' : '❌ 存在引用问题');

    // 检查 birthLocation 对象是否深拷贝
    const template3 = enhancedUserConfigManager.getDefaultTemplate();
    console.log('原始模板 birthLocation:', template3.birthLocation.province);
    console.log('深拷贝安全性:', template3.birthLocation.province !== '测试省份' ? '✅ 正确' : '❌ 错误');

  } catch (error) {
    console.error('测试 6 失败:', error);
  }
}

/**
 * 主测试函数
 */
export async function runTemplateCopyTests() {
  console.log('\n========================================');
  console.log('开始测试模板复制功能');
  console.log('========================================');

  await testBasicTemplateCopy();
  await testUniqueNicknameGeneration();
  await testAddConfigFromTemplate();
  await testBatchDuplicateFromTemplate();
  await testConcurrencySafety();
  await testDeepCopySafety();

  console.log('\n========================================');
  console.log('所有测试完成');
  console.log('========================================\n');
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTemplateCopyTests().then(() => {
    console.log('测试脚本执行完毕');
    process.exit(0);
  }).catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}
