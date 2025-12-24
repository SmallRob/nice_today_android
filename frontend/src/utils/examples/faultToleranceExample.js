/**
 * 容错机制使用示例
 * 演示如何使用并发锁、节点恢复和操作日志
 */

import { 
  concurrencyLock,
  nodeRecoveryManager,
  operationLogger,
  enhancedUserConfigManager 
} from '../index.js';

// ============================================================================
// 示例 1: 使用并发锁保护关键操作
// ============================================================================
async function example1_ProtectedUpdate() {
  console.log('=== 示例 1: 并发锁保护 ===\n');

  try {
    // 使用 withLock 方法（推荐）
    const result = await concurrencyLock.withLock(
      'protected-operation',
      async () => {
        // 模拟耗时操作
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        operationLogger.log('info', 'PROTECTED_OPERATION', {
          message: '执行受保护的操作',
          status: 'success'
        });
        
        return { status: 'success', data: '操作结果' };
      },
      { 
        owner: 'example1',
        timeout: 10000 // 10秒超时
      }
    );
    
    console.log('操作结果:', result);
  } catch (error) {
    console.error('操作失败:', error.message);
  }

  console.log('\n');
}

// ============================================================================
// 示例 2: 手动获取和释放锁
// ============================================================================
async function example2_ManualLock() {
  console.log('=== 示例 2: 手动锁管理 ===\n');

  const lockKey = 'manual-operation';
  
  try {
    // 手动获取锁
    const acquired = await concurrencyLock.acquire(lockKey, {
      timeout: 5000,
      owner: 'example2'
    });
    
    if (acquired) {
      console.log('锁已获取，执行操作...');
      
      // 执行操作
      await new Promise(resolve => setTimeout(resolve, 500));
      
      operationLogger.log('info', 'MANUAL_LOCK_OPERATION', {
        message: '手动锁操作成功',
        lockKey
      });
      
      // 手动释放锁
      concurrencyLock.release(lockKey, { owner: 'example2' });
      console.log('锁已释放');
    }
  } catch (error) {
    console.error('获取锁失败:', error.message);
  }

  console.log('\n');
}

// ============================================================================
// 示例 3: 检查锁状态
// ============================================================================
async function example3_CheckLockStatus() {
  console.log('=== 示例 3: 检查锁状态 ===\n');

  // 检查锁是否存在
  const isLocked = concurrencyLock.isLocked('example-operation');
  console.log('锁状态:', isLocked ? '已锁定' : '未锁定');
  
  // 获取所有锁的状态
  const lockStatus = concurrencyLock.getLockStatus();
  console.log('所有锁的状态:', lockStatus);
  
  // 清理超时的锁
  const cleanedCount = concurrencyLock.cleanupExpiredLocks();
  console.log('清理了', cleanedCount, '个超时的锁');

  console.log('\n');
}

// ============================================================================
// 示例 4: 使用增强版配置管理器的容错功能
// ============================================================================
async function example4_EnhancedManagerWithFaultTolerance() {
  console.log('=== 示例 4: 增强版管理器容错 ===\n');

  // 确保配置管理器已初始化
  await enhancedUserConfigManager.initialize();

  // 启用容错机制
  enhancedUserConfigManager.setFaultToleranceEnabled(true);
  enhancedUserConfigManager.setAutoRecoveryEnabled(true);

  console.log('容错状态:', enhancedUserConfigManager.getFaultToleranceStatus());

  // 执行更新（会自动应用容错机制）
  const configs = enhancedUserConfigManager.getAllConfigs();
  if (configs.length > 0) {
    try {
      const result = await enhancedUserConfigManager.updateConfigWithNodeUpdate(
        0,
        {
          nickname: '更新后的昵称'
        },
        'auto'
      );

      console.log('更新结果:', result.success ? '成功' : '失败');
      if (result.recovered) {
        console.log('已自动恢复, 恢复ID:', result.recoveryId);
      }
    } catch (error) {
      console.error('更新失败:', error.message);
    }
  }

  console.log('\n');
}

// ============================================================================
// 示例 5: 查询操作日志
// ============================================================================
async function example5_QueryLogs() {
  console.log('=== 示例 5: 查询操作日志 ===\n');

  // 记录一些测试日志
  operationLogger.log('info', 'TEST_LOG_1', { message: '测试日志1' });
  operationLogger.log('warn', 'TEST_LOG_2', { message: '测试警告' });
  operationLogger.log('error', 'TEST_LOG_3', { message: '测试错误' });
  operationLogger.log('success', 'TEST_LOG_4', { message: '测试成功' });

  // 查询所有日志
  const allLogs = operationLogger.getLogs();
  console.log('总日志数:', allLogs.length);

  // 查询最近的日志
  const recentLogs = operationLogger.getRecentLogs(10);
  console.log('最近的10条日志:');
  recentLogs.forEach((log, index) => {
    console.log(`  ${index + 1}. [${log.level}] ${log.operation}`);
  });

  // 查询错误日志
  const errorLogs = operationLogger.getErrorLogs();
  console.log('错误日志数:', errorLogs.length);

  console.log('\n');
}

// ============================================================================
// 示例 6: 查询恢复历史
// ============================================================================
async function example6_QueryRecoveryHistory() {
  console.log('=== 示例 6: 查询恢复历史 ===\n');

  // 获取所有恢复历史
  const history = nodeRecoveryManager.getRecoveryHistory();
  console.log('恢复历史总数:', history.length);

  // 获取统计信息
  const stats = nodeRecoveryManager.getStatistics();
  console.log('恢复统计:', stats);

  // 导出恢复历史
  const exportData = nodeRecoveryManager.exportHistory();
  console.log('导出数据大小:', exportData.length, '字符');

  console.log('\n');
}

// ============================================================================
// 示例 7: 获取综合统计信息
// ============================================================================
async function example7_GetStatistics() {
  console.log('=== 示例 7: 综合统计信息 ===\n');

  const stats = enhancedUserConfigManager.getFaultToleranceStatistics();
  console.log('容错统计信息:');
  console.log(JSON.stringify(stats, null, 2));

  console.log('\n');
}

// ============================================================================
// 示例 8: 执行清理维护
// ============================================================================
async function example8_CleanupMaintenance() {
  console.log('=== 示例 8: 清理维护 ===\n');

  const result = await enhancedUserConfigManager.cleanupMaintenance();
  console.log('清理结果:');
  console.log('  清理的备份数:', result.backupsCleaned);
  console.log('  清理的日志数:', result.logsCleaned);
  console.log('  清理的锁数:', result.locksCleaned);

  console.log('\n');
}

// ============================================================================
// 示例 9: 导出诊断数据
// ============================================================================
async function example9_ExportDiagnosticData() {
  console.log('=== 示例 9: 导出诊断数据 ===\n');

  const diagnosticData = {
    logs: enhancedUserConfigManager.exportOperationLogs(),
    recoveryHistory: enhancedUserConfigManager.exportRecoveryHistory(),
    statistics: enhancedUserConfigManager.getFaultToleranceStatistics(),
    timestamp: new Date().toISOString()
  };

  console.log('诊断数据（前500字符）:');
  console.log(JSON.stringify(diagnosticData, null, 2).substring(0, 500) + '...');

  console.log('\n');
}

// ============================================================================
// 运行所有示例
// ============================================================================
async function runAllExamples() {
  console.log('========================================');
  console.log('  容错机制使用示例');
  console.log('========================================\n');

  try {
    await example1_ProtectedUpdate();
    await example2_ManualLock();
    await example3_CheckLockStatus();
    await example4_EnhancedManagerWithFaultTolerance();
    await example5_QueryLogs();
    await example6_QueryRecoveryHistory();
    await example7_GetStatistics();
    await example8_CleanupMaintenance();
    await example9_ExportDiagnosticData();

    console.log('========================================');
    console.log('  所有示例执行完成');
    console.log('========================================');
  } catch (error) {
    console.error('执行示例时出错:', error);
  }
}

// 导出示例函数
export {
  example1_ProtectedUpdate,
  example2_ManualLock,
  example3_CheckLockStatus,
  example4_EnhancedManagerWithFaultTolerance,
  example5_QueryLogs,
  example6_QueryRecoveryHistory,
  example7_GetStatistics,
  example8_CleanupMaintenance,
  example9_ExportDiagnosticData,
  runAllExamples
};

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
