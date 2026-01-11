import React, { useState, useCallback, useRef } from 'react';
import { Card } from './PageLayout.js';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import { baziCacheManager } from '../utils/BaziCacheManager';
import mobileFileSystem, { checkAndRequestStoragePermission } from '../utils/mobileFileSystem';

/**
 * 用户数据管理组件
 * 提供集中管理、备份、迁移用户数据的功能
 */
const UserDataManager = ({ showMessage, onAddNewConfig }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false); // 并发控制
  const [backupStatus, setBackupStatus] = useState({
    configs: false,
    cache: false,
    settings: false,
    total: 0
  });

  /**
   * 检测设备类型并请求存储权限（使用移动端文件系统工具）
   */
  const checkDeviceAndRequestPermission = useCallback(async () => {
    try {
      const env = mobileFileSystem.detectEnvironment();
      
      // 如果是原生环境，请求存储权限
      if (env.isNative) {
        const permissionResult = await checkAndRequestStoragePermission();
        if (!permissionResult.granted) {
          return {
            hasPermission: false,
            isMobile: true,
            error: permissionResult.message
          };
        }
      }
      
      // Web环境或权限已授予
      return { hasPermission: true, isMobile: env.isNative || !env.isWeb };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        hasPermission: false,
        isMobile: true,
        error: error.message || '权限检查失败'
      };
    }
  }, []);

  /**
   * 优化后的导出配置功能（使用移动端文件系统工具，带并发控制）
   */
  const handleExportConfigs = useCallback(async () => {
    // 防止重复触发
    if (isProcessingRef.current) {
      console.warn('导出操作正在进行中，请稍候');
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);
      
      // 检查设备权限
      const permissionResult = await checkDeviceAndRequestPermission();
      
      if (!permissionResult.hasPermission) {
        showMessage('存储权限不足：' + permissionResult.error, 'error');
        return;
      }

      const jsonData = enhancedUserConfigManager.exportConfigs();
      if (!jsonData) {
        showMessage('导出配置失败，没有可导出的数据', 'error');
        return;
      }

      // 验证数据大小
      const dataSize = new Blob([jsonData]).size;
      if (dataSize > 10 * 1024 * 1024) { // 10MB
        showMessage('配置数据过大，无法导出', 'error');
        return;
      }

      // 使用移动端文件系统工具保存文件
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `nice-today-configs-${timestamp}.json`;
      
      const result = await mobileFileSystem.saveFile(filename, jsonData, 'application/json');
      
      if (result.success) {
        const methodText = result.method === 'capacitor-filesystem' 
          ? '已保存到设备存储'
          : result.method === 'filesystem-access-api'
          ? '已保存到选择的位置'
          : '已下载到默认位置';
        
        showMessage(`配置${methodText}`, 'success');
      } else {
        if (result.error === '已取消保存') {
          showMessage('已取消保存', 'info');
        } else {
          showMessage('导出配置失败: ' + result.error, 'error');
        }
      }
    } catch (error) {
      console.error('导出配置失败:', error);
      showMessage('导出配置失败: ' + (error.message || '未知错误'), 'error');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [showMessage, checkDeviceAndRequestPermission]);

  /**
   * 优化后的导入配置功能（使用移动端文件系统工具，带并发控制）
   */
  const handleImportConfigs = useCallback(async () => {
    // 防止重复触发
    if (isProcessingRef.current) {
      console.warn('导入操作正在进行中，请稍候');
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);

      // 检查设备权限
      const permissionResult = await checkDeviceAndRequestPermission();
      
      if (!permissionResult.hasPermission) {
        showMessage('存储权限不足：' + permissionResult.error, 'error');
        return;
      }

      // 使用移动端文件系统工具读取文件
      const result = await mobileFileSystem.readFile('.json');
      
      if (result.success) {
        const success = enhancedUserConfigManager.importConfigs(result.content);
        if (success) {
          showMessage('导入配置成功', 'success');
        } else {
          showMessage('导入配置失败，请检查文件格式', 'error');
        }
      } else {
        if (result.error === '已取消选择' || result.error === '未选择文件') {
          showMessage('已取消选择', 'info');
        } else {
          showMessage('导入配置失败: ' + result.error, 'error');
        }
      }
    } catch (error) {
      console.error('导入配置失败:', error);
      showMessage('导入配置失败: ' + (error.message || '未知错误'), 'error');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [showMessage, checkDeviceAndRequestPermission]);

  /**
   * 收集所有用户数据
   */
  const collectUserData = useCallback(async () => {
    const data = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    // 1. 收集配置数据
    try {
      const configs = enhancedUserConfigManager.getAllConfigs();
      data.data.configs = {
        count: configs.length,
        items: configs
      };
      setBackupStatus(prev => ({ ...prev, configs: true }));
    } catch (error) {
      console.error('收集配置数据失败:', error);
    }

    // 2. 收集缓存数据
    try {
      const cacheData = baziCacheManager.getAllCache();
      data.data.cache = {
        count: Object.keys(cacheData || {}).length,
        items: cacheData
      };
      setBackupStatus(prev => ({ ...prev, cache: true }));
    } catch (error) {
      console.error('收集缓存数据失败:', error);
    }

    // 3. 收集其他设置（可扩展）
    try {
      // 从localStorage收集其他相关设置
      const settings = {};
      const keysToBackup = [
        'theme',
        'language',
        'userPreferences'
      ];
      
      keysToBackup.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          settings[key] = JSON.parse(value);
        }
      });
      
      if (Object.keys(settings).length > 0) {
        data.data.settings = settings;
        setBackupStatus(prev => ({ ...prev, settings: true }));
      }
    } catch (error) {
      console.error('收集设置数据失败:', error);
    }

    // 计算总数据量
    const totalData = JSON.stringify(data).length;
    const totalKB = (totalData / 1024).toFixed(2);
    setBackupStatus(prev => ({ ...prev, total: totalKB }));

    return JSON.stringify(data, null, 2);
  }, []);

  /**
   * 创建JSON备份文件（使用移动端文件系统工具，带并发控制）
   */
  const createJSONBackup = useCallback(async () => {
    // 防止重复触发
    if (isProcessingRef.current) {
      console.warn('备份操作正在进行中，请稍候');
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);
      setBackupStatus({ configs: false, cache: false, settings: false, total: 0 });

      const jsonData = await collectUserData();
      
      // 检查设备权限
      const permissionResult = await checkDeviceAndRequestPermission();
      
      if (!permissionResult.hasPermission) {
        showMessage('存储权限不足：' + permissionResult.error, 'error');
        return;
      }

      // 使用移动端文件系统工具保存文件
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `nice-today-backup-${timestamp}.json`;
      
      const result = await mobileFileSystem.saveFile(filename, jsonData, 'application/json');
      
      if (result.success) {
        const methodText = result.method === 'capacitor-filesystem' 
          ? '已保存到设备存储'
          : result.method === 'filesystem-access-api'
          ? '已保存到选择的位置'
          : '已下载到默认位置';
        
        showMessage(`备份成功！${methodText}，数据大小: ${backupStatus.total}KB`, 'success');
      } else {
        if (result.error === '已取消保存') {
          showMessage('已取消备份', 'info');
        } else {
          showMessage('创建备份失败: ' + result.error, 'error');
        }
      }
    } catch (error) {
      console.error('创建备份失败:', error);
      showMessage('创建备份失败: ' + (error.message || '未知错误'), 'error');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [collectUserData, checkDeviceAndRequestPermission, showMessage, backupStatus.total]);

  /**
   * 恢复备份数据（使用移动端文件系统工具，带并发控制）
   */
  const restoreBackup = useCallback(async () => {
    // 防止重复触发
    if (isProcessingRef.current) {
      console.warn('恢复操作正在进行中，请稍候');
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);

      // 检查设备权限
      const permissionResult = await checkDeviceAndRequestPermission();
      
      if (!permissionResult.hasPermission) {
        showMessage('存储权限不足：' + permissionResult.error, 'error');
        return;
      }

      // 使用移动端文件系统工具读取文件
      const result = await mobileFileSystem.readFile('.json');
      
      if (!result.success) {
        if (result.error === '已取消选择' || result.error === '未选择文件') {
          showMessage('已取消恢复', 'info');
        } else {
          showMessage('读取备份文件失败: ' + result.error, 'error');
        }
        return;
      }

      try {
        const data = JSON.parse(result.content);

        // 验证数据格式
        if (!data.data || !data.exportTime) {
          showMessage('备份文件格式不正确', 'error');
          return;
        }

        // 恢复配置
        if (data.data.configs && data.data.configs.items) {
          enhancedUserConfigManager.importConfigs(JSON.stringify(data.data.configs.items));
        }

        // 恢复缓存
        if (data.data.cache && data.data.cache.items) {
          Object.entries(data.data.cache.items).forEach(([key, value]) => {
            baziCacheManager.cacheBazi(key, value.birthInfo, value.baziInfo);
          });
        }

        // 恢复设置
        if (data.data.settings) {
          Object.entries(data.data.settings).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
          });
        }

        showMessage('数据恢复成功！页面将自动刷新', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        showMessage('解析备份文件失败: ' + (error.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('恢复备份失败:', error);
      showMessage('恢复备份失败: ' + (error.message || '未知错误'), 'error');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [checkDeviceAndRequestPermission, showMessage]);

  /**
   * 清空所有数据
   */
  const clearAllData = useCallback(() => {
    if (!window.confirm('确定要清空所有用户数据吗？此操作不可撤销！')) {
      return;
    }

    try {
      // 清空配置
      localStorage.removeItem('userConfigs');
      
      // 清空缓存
      localStorage.removeItem('baziCache');
      
      // 清空其他设置
      localStorage.removeItem('theme');
      localStorage.removeItem('language');
      localStorage.removeItem('userPreferences');

      showMessage('所有数据已清空，页面将自动刷新', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage('清空数据失败: ' + error.message, 'error');
    }
  }, [showMessage]);

  return (
    <Card title="用户数据管理" className="mb-6">
      <div className="space-y-6">
        {/* 功能说明 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
            <span className="font-semibold text-blue-700 dark:text-blue-400">📦 数据管理中心</span>
            在这里集中管理您的所有用户数据，包括配置、缓存和设置。支持备份到本地或云存储，方便数据迁移。
          </p>
        </div>
        
        {/* 快速操作提示 */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            快速操作提示
          </h4>
          <ul className="text-sm text-gray-700 dark:text-white space-y-1 list-disc list-inside">
            <li>如需管理用户配置（添加、编辑、删除），请前往 "用户面板" -&gt; "配置管理"</li>
            <li>如需创建新的用户配置，请前往 "用户面板" -&gt; 点击 "添加新配置" 按钮</li>
            <li>您也可以直接使用下面的按钮快速添加新配置</li>
          </ul>
          
          {/* 直接添加新配置按钮 */}
          {onAddNewConfig && (
            <div className="mt-4">
              <button
                onClick={onAddNewConfig}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>➕</span>
                <span>直接添加新配置</span>
              </button>
            </div>
          )}
        </div>

        {/* 备份功能区 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">💾</span>
            数据备份与恢复
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 创建备份 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">完整数据备份</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  备份所有用户数据，包括配置、缓存和设置
                </p>
                {backupStatus.total > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    上次备份大小: {backupStatus.total}KB
                  </p>
                )}
              </div>
              <button
                onClick={createJSONBackup}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>创建备份</span>
                  </>
                )}
              </button>
            </div>

            {/* 恢复备份 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">恢复备份数据</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  从备份文件恢复数据，将覆盖当前数据
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  ⚠️ 恢复前建议先创建当前数据备份
                </p>
              </div>
              <button
                onClick={restoreBackup}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>恢复备份</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 配置管理区 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">⚙️</span>
            配置导入导出
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 导出配置 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">导出用户配置</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  仅导出用户配置数据，用于分享或迁移
                </p>
              </div>
              <button
                onClick={handleExportConfigs}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>导出配置</span>
                  </>
                )}
              </button>
            </div>

            {/* 导入配置 */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">导入用户配置</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  从配置文件导入数据，将添加到现有配置
                </p>
              </div>
              <button
                onClick={handleImportConfigs}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>导入配置</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 数据清理区 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🗑️</span>
            数据清理
          </h3>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="mb-3">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">清空所有数据</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                清空所有用户数据，包括配置、缓存和设置。此操作不可撤销！
              </p>
            </div>
            <button
              onClick={clearAllData}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <span>⚠️</span>
                  <span>清空所有数据</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">💡 使用提示</h4>
          <ul className="text-sm text-gray-700 dark:text-white space-y-1 list-disc list-inside">
            <li>移动端（Android/iOS）首次使用时，浏览器会请求存储权限，请允许以正常使用</li>
            <li>建议定期创建备份，防止数据丢失</li>
            <li>更换设备时，通过备份文件可以快速迁移所有数据</li>
            <li>配置文件可以分享给其他人，让他们导入您的配置</li>
            <li>备份文件包含敏感信息，请妥善保管</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default UserDataManager;
