/**
 * 配置系统诊断工具
 * 用于诊断配置管理器初始化和数据读取问题
 */

export const diagnoseConfigSystem = () => {
  const report = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    issues: [],
    recommendations: []
  };

  console.log('===== 配置系统诊断报告 =====');
  console.log('诊断时间:', report.timestamp);

  // 1. 检查旧版存储
  console.log('\n1. 旧版存储检查:');
  const oldConfigs = localStorage.getItem('nice_today_user_configs');
  const oldIndex = localStorage.getItem('nice_today_active_config_index');

  report.legacyStorage = {
    exists: !!oldConfigs,
    activeIndex: oldIndex
  };

  if (oldConfigs) {
    try {
      const parsed = JSON.parse(oldConfigs);
      console.log('  ✓ 旧版配置存在');
      console.log('    配置数量:', parsed.length);
      console.log('    活跃索引:', oldIndex);

      if (parsed.length > 0) {
        const firstConfig = parsed[0];
        console.log('    第一个配置:');
        console.log('      昵称:', firstConfig.nickname);
        console.log('      出生日期:', firstConfig.birthDate);
        console.log('      星座:', firstConfig.zodiac);
        console.log('      属相:', firstConfig.zodiacAnimal);

        report.legacyStorage.configCount = parsed.length;
        report.legacyStorage.sampleConfig = {
          nickname: firstConfig.nickname,
          birthDate: firstConfig.birthDate
        };
      }
    } catch (e) {
      console.error('  ✗ 旧版配置解析失败:', e.message);
      report.issues.push({
        level: 'error',
        source: 'legacy_storage',
        message: `旧版配置数据损坏: ${e.message}`
      });
    }
  } else {
    console.log('  ✗ 旧版配置不存在');
  }

  // 2. 检查新版存储
  console.log('\n2. 新版存储检查:');
  const newConfigs = localStorage.getItem('nice_today_user_configs_v2');
  const newIndex = localStorage.getItem('nice_today_active_config_index_v2');
  const metadata = localStorage.getItem('nice_today_config_metadata');

  report.enhancedStorage = {
    exists: !!newConfigs,
    activeIndex: newIndex
  };

  if (newConfigs) {
    try {
      const parsed = JSON.parse(newConfigs);
      console.log('  ✓ 新版配置存在');
      console.log('    配置数量:', parsed.length);
      console.log('    活跃索引:', newIndex);
      console.log('    元数据:', metadata ? '存在' : '不存在');

      if (parsed.length > 0) {
        const firstConfig = parsed[0];
        console.log('    第一个配置:');
        console.log('      昵称:', firstConfig.nickname);
        console.log('      出生日期:', firstConfig.birthDate);
        console.log('      星座:', firstConfig.zodiac);
        console.log('      属相:', firstConfig.zodiacAnimal);
        console.log('      是否使用:', firstConfig.isused);
        console.log('      系统默认:', firstConfig.isSystemDefault);

        report.enhancedStorage.configCount = parsed.length;
        report.enhancedStorage.sampleConfig = {
          nickname: firstConfig.nickname,
          birthDate: firstConfig.birthDate,
          isused: firstConfig.isused
        };
      }
    } catch (e) {
      console.error('  ✗ 新版配置解析失败:', e.message);
      report.issues.push({
        level: 'error',
        source: 'enhanced_storage',
        message: `新版配置数据损坏: ${e.message}`
      });
    }
  } else {
    console.log('  ✗ 新版配置不存在');
    report.recommendations.push({
      action: '执行数据迁移',
      reason: '检测到旧版配置但新版配置为空'
    });
  }

  // 3. 检查缓存层
  console.log('\n3. 缓存层检查:');
  const cachePrefix = 'nice_today_cache_v2_';
  const cacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(cachePrefix)) {
      cacheKeys.push(key);
      console.log('  ', key);
    }
  }
  console.log('  缓存项数量:', cacheKeys.length);
  report.cacheKeys = cacheKeys;

  // 4. 数据一致性检查
  console.log('\n4. 数据一致性检查:');
  if (oldConfigs && !newConfigs) {
    console.log('  ⚠️  发现问题: 旧版数据存在，新版数据为空');
    console.log('  → 需要执行数据迁移');
    report.status = 'migration_needed';
    report.recommendations.push({
      action: '执行数据迁移',
      priority: 'high',
      details: '旧版配置需要迁移到新版系统'
    });
  } else if (!oldConfigs && newConfigs) {
    console.log('  ✓ 数据状态正常: 仅新版数据存在');
    report.status = 'enhanced_only';
  } else if (oldConfigs && newConfigs) {
    console.log('  ⚠️  警告: 旧版和新版数据都存在');
    console.log('  → 可能重复配置，需要确认');
    report.status = 'both_exist';
    report.recommendations.push({
      action: '确认数据源',
      priority: 'medium',
      details: '两个版本的数据都存在，需要确认使用哪个版本'
    });
  } else {
    console.log('  ✗ 警告: 无任何配置数据');
    report.status = 'no_data';
  }

  // 5. 管理器状态检查（需要导入）
  console.log('\n5. 管理器状态:');
  console.log('  注意: 此项需要在运行时检查，需要实际导入管理器');
  console.log('  建议调用 checkManagerStatus() 方法');

  // 6. 生成建议
  console.log('\n===== 诊断建议 =====');
  if (report.recommendations.length > 0) {
    report.recommendations.forEach((rec, idx) => {
      console.log(`${idx + 1}. [${rec.priority || 'normal'}] ${rec.action}`);
      if (rec.reason || rec.details) {
        console.log(`   原因: ${rec.reason || rec.details}`);
      }
    });
  } else {
    console.log('  ✓ 未发现配置系统问题');
  }

  console.log('\n===== 诊断完成 =====');
  return report;
};

/**
 * 在运行时检查管理器状态
 */
export const checkManagerStatus = async () => {
  console.log('\n===== 管理器状态检查 =====');

  try {
    const { enhancedUserConfigManager } = await import('./EnhancedUserConfigManager.js');
    const { userConfigManager } = await import('./userConfigManager.js');

    // 检查新版管理器
    console.log('\n新版管理器:');
    console.log('  initialized:', enhancedUserConfigManager.initialized);
    console.log('  configCount:', enhancedUserConfigManager.configs.length);
    console.log('  activeIndex:', enhancedUserConfigManager.activeConfigIndex);

    if (enhancedUserConfigManager.initialized) {
      const currentConfig = enhancedUserConfigManager.getCurrentConfig();
      console.log('  当前配置:');
      console.log('    nickname:', currentConfig.nickname);
      console.log('    birthDate:', currentConfig.birthDate);
    }

    // 检查旧版管理器
    console.log('\n旧版管理器:');
    console.log('  initialized:', userConfigManager.initialized);
    console.log('  configCount:', userConfigManager.configs.length);
    console.log('  activeIndex:', userConfigManager.activeConfigIndex);

    if (userConfigManager.initialized) {
      const currentConfig = userConfigManager.getCurrentConfig();
      console.log('  当前配置:');
      console.log('    nickname:', currentConfig.nickname);
      console.log('    birthDate:', currentConfig.birthDate);
    }

    return {
      enhanced: {
        initialized: enhancedUserConfigManager.initialized,
        configCount: enhancedUserConfigManager.configs.length,
        activeConfig: enhancedUserConfigManager.initialized ?
          enhancedUserConfigManager.getCurrentConfig() : null
      },
      legacy: {
        initialized: userConfigManager.initialized,
        configCount: userConfigManager.configs.length,
        activeConfig: userConfigManager.initialized ?
          userConfigManager.getCurrentConfig() : null
      }
    };
  } catch (error) {
    console.error('检查管理器状态失败:', error);
    return {
      error: error.message
    };
  }
};

/**
 * 执行数据迁移
 */
export const performDataMigration = async () => {
  console.log('\n===== 执行数据迁移 =====');

  try {
    const { configMigrationTool } = await import('./ConfigMigrationTool.js');

    // 检查是否需要迁移
    const check = await configMigrationTool.checkMigrationNeeded();
    console.log('迁移检查:', check);

    if (!check.needed) {
      console.log('无需迁移');
      return { success: true, needed: false };
    }

    // 执行迁移
    const result = await configMigrationTool.performMigration();
    console.log('迁移结果:', result);

    return result;
  } catch (error) {
    console.error('数据迁移失败:', error);
    return { success: false, error: error.message };
  }
};

export default {
  diagnoseConfigSystem,
  checkManagerStatus,
  performDataMigration
};
