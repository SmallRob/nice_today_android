import { useState, useEffect, useCallback } from 'react';
import { getAppVersion } from '../utils/capacitor';
import { Capacitor } from '@capacitor/core';
import updateCheckService from '../utils/updateCheckService';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import versionDetector from '../utils/versionDetector';
import { restartApp } from '../utils/restartApp';
import { errorTrackingSettings } from '../utils/errorTrackingSettings';
import { userConfigManager } from '../utils/userConfigManager';
import { AI_CONFIG } from '../services/globalUserConfig';
import versionData from '../version.json';
import styles from './SettingsPage.module.css';

const SectionCard = ({ title, children }) => (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const ToggleSwitch = ({ checked, onChange, id }) => (
  <label className={styles.toggle} htmlFor={id}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <span className={styles.slider}></span>
  </label>
);

function SettingsPage() {
  const [appVersion, setAppVersion] = useState({
    version: versionData.versionName,
    build: 'web'
  });
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'web',
    isNative: false,
    isAndroid: false,
    isIOS: false
  });
  const [apiBaseUrl, setApiBaseUrl] = useState('https://nice-mcp.leansoftx.com/api');
  const [useLocalCalculation, setUseLocalCalculation] = useState(true);
  const [cacheTimeout, setCacheTimeout] = useState(10800000); // 默认3小时
  const [dataSyncEnabled, setDataSyncEnabled] = useState(true); // 数据同步状态
  const [currentAppVersion, setCurrentAppVersion] = useState('full'); // 当前应用版本
  const [isLoaded, setIsLoaded] = useState(false);
  const { showNotification } = useNotification();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { themeMode: currentTheme, setTheme: handleThemeChange } = useTheme();

  // 更新检查设置状态
  const [updateCheckSettings, setUpdateCheckSettings] = useState({
    enabled: true,
    checkFrequency: 'startup',
    lastCheckTime: null,
    checkRecords: []
  });

  // 错误日志追踪设置
  const [errorTrackingEnabled, setErrorTrackingEnabled] = useState(() => {
    return errorTrackingSettings.isEnabled();
  });

  // AI设置
  const [aiSettings, setAiSettings] = useState({
    useAIInterpretation: AI_CONFIG.DEFAULT_ENABLE_AI,
    selectedAIModelId: AI_CONFIG.DEFAULT_MODEL_ID,
    homeTimeAwareEnabled: AI_CONFIG.DEFAULT_HOME_TIME_AWARE ?? true,
    customModels: []
  });

  // 新增模型表单状态
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({
    id: '',
    name: '',
    API_KEY: '',
    ServiceEndPoint: '',
    deploymentName: ''
  });

  // 切换错误日志追踪
  const handleToggleErrorTracking = useCallback(() => {
    const newState = errorTrackingSettings.toggle();
    setErrorTrackingEnabled(newState);
    showNotification(
      newState ? '错误日志追踪已启用' : '错误日志追踪已关闭',
      'success'
    );
  }, [showNotification]);

  useEffect(() => {
    let isMounted = true;

    const loadAppInfo = async () => {
      try {
        if (!isMounted) return;

        setError(null);

        // 分阶段加载数据，避免同时处理多个异步操作

        // 阶段1：加载基础信息（不依赖外部服务）
        try {
          // 获取平台信息（同步操作）
          const platform = Capacitor.getPlatform();
          setPlatformInfo({
            platform,
            isNative: Capacitor.isNativePlatform(),
            isAndroid: platform === 'android',
            isIOS: platform === 'ios'
          });

          // 从本地存储加载API设置
          const savedApiUrl = localStorage.getItem('apiBaseUrl');
          if (savedApiUrl) {
            setApiBaseUrl(savedApiUrl);
          }

          const savedUseLocal = localStorage.getItem('useLocalCalculation');
          if (savedUseLocal) {
            setUseLocalCalculation(savedUseLocal === 'true');
          } else {
            // 首次使用时默认开启并保存
            localStorage.setItem('useLocalCalculation', 'true');
            setUseLocalCalculation(true);
          }

          // 从本地存储加载缓存超时设置
          const savedCacheTimeout = localStorage.getItem('cacheTimeout');
          if (savedCacheTimeout) {
            setCacheTimeout(parseInt(savedCacheTimeout));
          }

          // 加载数据同步设置
          const savedDataSync = localStorage.getItem('dataSyncEnabled');
          if (savedDataSync !== null) {
            setDataSyncEnabled(savedDataSync === 'true');
          }

          // 初始化版本检测器并获取当前版本
          try {
            await versionDetector.initialize();
            const version = versionDetector.getCurrentVersion();
            if (isMounted) {
              setCurrentAppVersion(version);
            }
          } catch (versionError) {
            console.warn('版本检测器初始化失败:', versionError);
            // 降级到localStorage
            const savedVersion = localStorage.getItem('appVersion') || 'full';
            if (isMounted) {
              setCurrentAppVersion(savedVersion);
            }
          }
        } catch (localError) {
          console.warn('加载本地设置失败:', localError);
          // 本地存储失败不影响应用继续运行
        }

        // 阶段2：异步加载应用版本信息
        try {
          const versionInfo = await getAppVersion();
          if (isMounted) {
            setAppVersion(versionInfo);
          }
        } catch (versionError) {
          console.warn('获取应用版本失败:', versionError);
          if (isMounted) {
            setAppVersion({ version: 'unknown', build: 'unknown' });
          }
        }

        // 阶段3：加载更新检查设置
        try {
          const updateConfig = updateCheckService.getConfig();
          const checkRecords = updateCheckService.getCheckRecords();
          if (isMounted) {
            setUpdateCheckSettings({
              enabled: updateConfig.enabled,
              checkFrequency: updateConfig.checkFrequency,
              lastCheckTime: updateConfig.lastCheckTime,
              checkRecords: checkRecords
            });
          }
        } catch (updateError) {
          console.warn('加载更新检查设置失败:', updateError);
          if (isMounted) {
            setUpdateCheckSettings({
              enabled: true,
              checkFrequency: 'startup',
              lastCheckTime: null,
              checkRecords: []
            });
          }
        }

        // 阶段4：加载 AI 设置
        try {
          const globalSettings = userConfigManager.getGlobalSettings();
          if (globalSettings && isMounted) {
            setAiSettings(prev => ({
              ...prev,
              useAIInterpretation: globalSettings.useAIInterpretation ?? AI_CONFIG.DEFAULT_ENABLE_AI,
              selectedAIModelId: globalSettings.selectedAIModelId || AI_CONFIG.DEFAULT_MODEL_ID,
              homeTimeAwareEnabled: globalSettings.homeTimeAwareEnabled ?? (AI_CONFIG.DEFAULT_HOME_TIME_AWARE ?? true),
              customModels: globalSettings.customModels || []
            }));
          }
        } catch (aiError) {
          console.warn('加载 AI 设置失败:', aiError);
        }

      } catch (error) {
        console.error('Error loading app info:', error);
        if (isMounted) {
          setError('加载应用信息失败: ' + error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    // 延迟加载，避免阻塞应用启动
    const timer = setTimeout(() => {
      loadAppInfo();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // 保存API基础URL设置
  const handleApiBaseUrlChange = (e) => {
    const newUrl = e.target.value;
    setApiBaseUrl(newUrl);
    localStorage.setItem('apiBaseUrl', newUrl);
  };

  // 保存使用本地计算设置
  const handleUseLocalCalculationChange = (e) => {
    const newValue = e.target.checked;
    setUseLocalCalculation(newValue);
    localStorage.setItem('useLocalCalculation', newValue.toString());
  };

  // 保存缓存超时设置
  const handleCacheTimeoutChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCacheTimeout(newValue);
    localStorage.setItem('cacheTimeout', newValue.toString());
  };

  // 保存数据同步设置
  const handleDataSyncChange = (e) => {
    const newValue = e.target.checked;
    setDataSyncEnabled(newValue);
    localStorage.setItem('dataSyncEnabled', newValue.toString());
  };

  // 切换应用版本
  const handleVersionSwitch = (version) => {
    if (version === currentAppVersion) {
      showNotification({
        type: 'info',
        title: '提示',
        message: `当前已是${version === 'lite' ? '轻量版' : '炫彩版'}`,
        duration: 2000
      });
      return;
    }

    showNotification({
      type: 'warning',
      title: '版本切换确认',
      message: `确定要切换到${version === 'lite' ? '轻量版' : '炫彩版'}吗？这需要重启应用。`,
      actions: [
        {
          label: '立即重启',
          primary: true,
          onClick: () => {
            versionDetector.switchVersion(version);
            setCurrentAppVersion(version);
            restartApp();
          }
        },
        {
          label: '以后再说',
          onClick: () => {
            // 仅保存设置但不重启
            localStorage.setItem('appVersion', version);
            setCurrentAppVersion(version);
            showNotification({
              type: 'success',
              title: '设置成功',
              message: '版本设置已更新，将在下次启动时生效',
              duration: 3000
            });
          }
        }
      ]
    });
  };

  // 重新加载当前版本
  const handleReloadCurrentVersion = () => {
    const currentVersion = currentAppVersion;
    showNotification({
      type: 'info',
      title: '重新加载确认',
      message: `确定要重新加载${currentVersion === 'lite' ? '轻量版' : '炫彩版'}吗？这将刷新当前页面。`,
      actions: [
        {
          label: '立即刷新',
          primary: true,
          onClick: () => {
            // 刷新页面
            window.location.reload();
          }
        },
        {
          label: '取消',
          onClick: () => {
            // 用户取消操作
          }
        }
      ]
    });
  };

  // 处理更新检查设置变更
  const handleUpdateCheckChange = useCallback(async (field, value) => {
    try {
      const newSettings = {
        ...updateCheckSettings,
        [field]: value
      };

      setUpdateCheckSettings(newSettings);

      // 更新服务配置
      await updateCheckService.updateConfig({
        enabled: newSettings.enabled,
        checkFrequency: newSettings.checkFrequency
      });

      setSuccess('更新检查设置已保存');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      setError('保存更新检查设置失败: ' + error.message);
      setTimeout(() => setError(null), 2000);
    }
  }, [updateCheckSettings]);

  // 处理 AI 设置变更
  const handleAISettingChange = useCallback((field, value) => {
    setAiSettings(prev => ({
      ...prev,
      [field]: value
    }));

    // 保存到全局配置
    try {
      userConfigManager.updateGlobalSettings({ [field]: value });
    } catch (error) {
      console.error('保存 AI 设置失败:', error);
      setError('保存设置失败: ' + error.message);
    }
  }, []);

  // 添加自定义模型
  const handleAddModel = useCallback(() => {
    if (!newModel.name || !newModel.API_KEY || !newModel.ServiceEndPoint) {
      setError('请填写完整的模型信息');
      setTimeout(() => setError(null), 2000);
      return;
    }

    const modelId = newModel.id || `custom-${Date.now()}`;
    const modelToAdd = { ...newModel, id: modelId };
    
    const updatedCustomModels = [...(aiSettings.customModels || []), modelToAdd];
    handleAISettingChange('customModels', updatedCustomModels);
    
    // 自动选中新添加的模型
    handleAISettingChange('selectedAIModelId', modelId);

    setNewModel({
      id: '',
      name: '',
      API_KEY: '',
      ServiceEndPoint: '',
      deploymentName: ''
    });
    setShowAddModel(false);
    setSuccess('模型添加成功');
    setTimeout(() => setSuccess(null), 2000);
  }, [newModel, aiSettings.customModels, handleAISettingChange]);

  // 删除自定义模型
  const handleDeleteModel = useCallback((modelId) => {
    const updatedCustomModels = aiSettings.customModels.filter(m => m.id !== modelId);
    handleAISettingChange('customModels', updatedCustomModels);
    
    // 如果删除的是当前选中的模型，重置为默认
    if (aiSettings.selectedAIModelId === modelId) {
      handleAISettingChange('selectedAIModelId', AI_CONFIG.DEFAULT_MODEL_ID);
    }
    
    setSuccess('模型已删除');
    setTimeout(() => setSuccess(null), 2000);
  }, [aiSettings.customModels, aiSettings.selectedAIModelId, handleAISettingChange]);

  // 手动检查更新
  const handleManualCheckUpdate = async () => {
    try {
      setError('正在检查更新...');

      const result = await updateCheckService.forceCheckForUpdate(
        appVersion.version,
        apiBaseUrl
      );

      if (result && result.hasUpdate) {
        showNotification({
          type: 'update',
          title: '发现新版本',
          message: `新版本 ${result.serverVersion} 已提供，包含重要改进和新功能。`,
          actions: [
            {
              label: '立即更新',
              primary: true,
              onClick: () => {
                if (result.updateUrl) window.open(result.updateUrl, '_blank');
              }
            },
            {
              label: '稍后再说',
              onClick: () => { }
            }
          ]
        });
      } else if (result) {
        showNotification({
          type: 'success',
          title: '检查完成',
          message: '当前已是最新版本',
          duration: 3000
        });
      } else {
        setError('检查更新失败，请检查网络连接');
      }

      setTimeout(() => setError(null), 3000);

      // 刷新检查记录
      const records = updateCheckService.getCheckRecords();
      setUpdateCheckSettings(prev => ({
        ...prev,
        checkRecords: records,
        lastCheckTime: updateCheckService.getConfig().lastCheckTime
      }));

    } catch (error) {
      setError('检查更新失败: ' + error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // 清除检查记录
  const handleClearCheckRecords = useCallback(() => {
    try {
      // 直接清除本地存储中的记录
      localStorage.removeItem('app_update_check_records');

      // 更新状态为空数组
      setUpdateCheckSettings(prev => ({
        ...prev,
        checkRecords: []
      }));

      setSuccess('检查记录已清除');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      setError('清除检查记录失败: ' + error.message);
      setTimeout(() => setError(null), 2000);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className="flex justify-center items-center py-20">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">正在加载设置...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">请稍候，正在初始化应用配置</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 顶部标题区域 */}
        <div className={styles.header}>
          <h1 className={styles.title}>⚙️ 系统设置</h1>
          <p className={styles.subtitle}>配置应用系统参数</p>
        </div>

        {/* 错误和成功提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-500 hover:text-green-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className={styles.container}>
          <div className="pb-8">
            {/* AI 功能设置 */}
            <SectionCard title="AI 功能设置">
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>启用 AI 解读</div>
                    <div className={styles.itemDescription}>开启后，应用将提供基于 AI 的运势解读和建议</div>
                  </div>
                  <ToggleSwitch
                    checked={aiSettings.useAIInterpretation}
                    onChange={(e) => handleAISettingChange('useAIInterpretation', e.target.checked)}
                    id="useAIInterpretation"
                  />
                </div>
              </div>

              {aiSettings.useAIInterpretation && (
                <div className={styles.item}>
                  <div className={styles.itemLabel}>选择 AI 模型</div>
                  <div className={styles.itemDescription}>请选择用于解读的 AI 模型，或添加自定义模型</div>
                  
                  <div className="flex gap-2 mt-2">
                    <select
                      value={aiSettings.selectedAIModelId}
                      onChange={(e) => handleAISettingChange('selectedAIModelId', e.target.value)}
                      className={`${styles.select} flex-1`}
                    >
                      <optgroup label="预设模型">
                        {AI_CONFIG.MODELS.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.id})
                          </option>
                        ))}
                      </optgroup>
                      {(aiSettings.customModels && aiSettings.customModels.length > 0) && (
                        <optgroup label="自定义模型">
                          {aiSettings.customModels.map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name} ({model.id})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    
                    <button 
                      onClick={() => setShowAddModel(!showAddModel)}
                      className={`${styles.button} ${styles.buttonSecondary} !py-2`}
                    >
                      {showAddModel ? '取消' : '添加'}
                    </button>
                  </div>

                  {/* 当前选中模型的详细信息展示 */}
                  <div className="mt-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {(() => {
                      const allModels = [...AI_CONFIG.MODELS, ...(aiSettings.customModels || [])];
                      const currentModel = allModels.find(m => m.id === aiSettings.selectedAIModelId);
                      if (currentModel) {
                        return (
                          <div className="flex justify-between items-center">
                            <span>Endpoint: {currentModel.ServiceEndPoint.substring(0, 30)}...</span>
                            {aiSettings.customModels?.some(m => m.id === currentModel.id) && (
                               <button 
                                 onClick={() => handleDeleteModel(currentModel.id)}
                                 className="text-red-500 hover:text-red-700 ml-2"
                               >
                                 删除
                               </button>
                            )}
                          </div>
                        );
                      }
                      return <span>未找到模型配置</span>;
                    })()}
                  </div>

                  {/* 添加新模型表单 */}
                  {showAddModel && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-3 border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white">添加自定义模型</h3>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">模型名称</label>
                        <input
                          type="text"
                          value={newModel.name}
                          onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                          className={styles.input}
                          placeholder="例如: My Custom GPT"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">模型 ID (可选)</label>
                        <input
                          type="text"
                          value={newModel.id}
                          onChange={(e) => setNewModel({...newModel, id: e.target.value})}
                          className={styles.input}
                          placeholder="留空自动生成"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                        <input
                          type="password"
                          value={newModel.API_KEY}
                          onChange={(e) => setNewModel({...newModel, API_KEY: e.target.value})}
                          className={styles.input}
                          placeholder="sk-..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Service Endpoint</label>
                        <input
                          type="text"
                          value={newModel.ServiceEndPoint}
                          onChange={(e) => setNewModel({...newModel, ServiceEndPoint: e.target.value})}
                          className={styles.input}
                          placeholder="https://api.openai.com/v1/chat/completions"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Deployment Name (可选)</label>
                        <input
                          type="text"
                          value={newModel.deploymentName}
                          onChange={(e) => setNewModel({...newModel, deploymentName: e.target.value})}
                          className={styles.input}
                          placeholder="Azure OpenAI 需要"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleAddModel}
                          className={styles.button}
                        >
                          保存模型
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>首页时令卡片</div>
                    <div className={styles.itemDescription}>在首页显示基于时令的 AI 建议卡片</div>
                  </div>
                  <ToggleSwitch
                    checked={aiSettings.homeTimeAwareEnabled}
                    onChange={(e) => handleAISettingChange('homeTimeAwareEnabled', e.target.checked)}
                    id="homeTimeAwareEnabled"
                  />
                </div>
              </div>
            </SectionCard>

            {/* 应用设置 */}
            <SectionCard title="应用设置">
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>显示主题</div>
                    <div className={styles.itemDescription}>应用主题将自动跟随系统设置</div>
                  </div>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.itemLabel}>应用版本</div>
                <div className={styles.itemDescription}>切换应用版本以适应不同设备性能</div>
                <div className="flex gap-2 mt-3">
                  <button
                    className={`${styles.button} flex-1 ${currentAppVersion !== 'lite' ? styles.buttonSecondary : ''}`}
                    onClick={() => handleVersionSwitch('lite')}
                  >
                    轻量版
                  </button>
                  <button
                    className={`${styles.button} flex-1 ${currentAppVersion !== 'full' ? styles.buttonSecondary : ''}`}
                    onClick={() => handleVersionSwitch('full')}
                  >
                    炫彩版
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    className={`${styles.button} w-full`}
                    onClick={() => handleReloadCurrentVersion()}
                  >
                    重新加载当前版本
                  </button>
                </div>
                <div className={styles.infoText}>
                  {currentAppVersion === 'lite' ? '当前为轻量版，适合低端设备' : '当前为炫彩版，功能更丰富'}
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.itemLabel}>API服务地址</div>
                <div className={styles.itemDescription}>设置后端服务地址</div>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={handleApiBaseUrlChange}
                  className={`${styles.input} mt-2`}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>使用本地计算</div>
                    <div className={styles.itemDescription}>启用后将使用本地JavaScript计算代替API调用</div>
                  </div>
                  <ToggleSwitch
                    checked={useLocalCalculation}
                    onChange={handleUseLocalCalculationChange}
                    id="useLocalCalculation"
                  />
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>数据同步</div>
                    <div className={styles.itemDescription}>自动备份您的数据</div>
                  </div>
                  <ToggleSwitch
                    checked={dataSyncEnabled}
                    onChange={handleDataSyncChange}
                    id="dataSyncEnabled"
                  />
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.itemLabel}>缓存超时时间</div>
                <div className={styles.itemDescription}>设置数据缓存的有效时间</div>
                <select
                  value={cacheTimeout}
                  onChange={handleCacheTimeoutChange}
                  className={styles.select}
                >
                  <option value="3600000">1小时</option>
                  <option value="7200000">2小时</option>
                  <option value="10800000">3小时</option>
                  <option value="14400000">4小时</option>
                  <option value="28800000">8小时</option>
                  <option value="43200000">12小时</option>
                  <option value="86400000">1天</option>
                </select>
              </div>

              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div>
                    <div className={styles.itemLabel}>自动更新检查</div>
                    <div className={styles.itemDescription}>自动检查新版本并提示更新</div>
                  </div>
                  <ToggleSwitch
                    checked={updateCheckSettings.enabled}
                    onChange={(e) => handleUpdateCheckChange('enabled', e.target.checked)}
                    id="updateCheckEnabled"
                  />
                </div>
                {updateCheckSettings.enabled && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                    <div className="mb-3">
                      <div className="text-sm mb-1 font-bold">检查频率</div>
                      <select
                        value={updateCheckSettings.checkFrequency}
                        onChange={(e) => handleUpdateCheckChange('checkFrequency', e.target.value)}
                        className={styles.select}
                      >
                        <option value="startup">启动时检查</option>
                        <option value="daily">每天检查</option>
                        <option value="weekly">每周检查</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleManualCheckUpdate}
                        className={`${styles.button} flex-1 text-sm`}
                      >
                        立即检查更新
                      </button>
                      <button
                        onClick={handleClearCheckRecords}
                        className={`${styles.button} ${styles.buttonSecondary} flex-1 text-sm`}
                      >
                        清除记录
                      </button>
                    </div>
                    {updateCheckSettings.lastCheckTime && (
                      <div className={`${styles.infoText} mt-2`}>
                        上次检查: {new Date(updateCheckSettings.lastCheckTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 关于信息 */}
            <SectionCard title="关于">
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemLabel}>应用版本</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{appVersion.version} ({appVersion.build})</div>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemLabel}>运行平台</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {platformInfo.isNative ?
                      (platformInfo.isAndroid ? 'Android' : (platformInfo.isIOS ? 'iOS' : 'Native')) :
                      'Web'
                    }
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 其他设置 */}
            <SectionCard title="其他">
              <div className={styles.item}>
                <div className={styles.itemHeader}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔴</span>
                    <div>
                      <div className={styles.itemLabel}>错误日志追踪</div>
                      <div className={styles.itemDescription}>
                        {errorTrackingEnabled ? '已启用 - 显示错误追踪球' : '已关闭 - 隐藏错误追踪球'}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={errorTrackingEnabled}
                    onChange={handleToggleErrorTracking}
                    id="errorTracking"
                  />
                </div>
              </div>
            </SectionCard>

            {/* 重置按钮 */}
            {platformInfo.isNative && (
              <button className={`${styles.button} ${styles.buttonDanger} w-full mt-4 mb-8`}>
                重置应用数据
              </button>
            )}
            
            {/* 底部安全区域 */}
            <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
