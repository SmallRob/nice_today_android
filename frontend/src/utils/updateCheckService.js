// 更新检查服务模块
class UpdateCheckService {
  constructor() {
    this.STORAGE_KEYS = {
      UPDATE_CONFIG: 'app_update_config',
      LAST_CHECK_TIME: 'app_last_update_check',
      LAST_UPDATE_INFO: 'app_last_update_info',
      CHECK_RECORDS: 'app_update_check_records'
    };
    
    // 默认配置
    this.DEFAULT_CONFIG = {
      checkFrequency: 'startup', // 'startup', 'daily', 'weekly'
      enabled: true,
      lastCheckTime: null,
      lastUpdateCheck: null
    };
    
    // 检查频率对应的毫秒数
    this.CHECK_FREQUENCIES = {
      startup: 0, // 每次启动检查
      daily: 24 * 60 * 60 * 1000, // 24小时
      weekly: 7 * 24 * 60 * 60 * 1000 // 7天
    };
    
    this.initialize();
  }
  
  // 初始化服务
  async initialize() {
    try {
      // 加载配置
      await this.loadConfig();
      console.log('UpdateCheckService initialized');
    } catch (error) {
      console.error('Failed to initialize UpdateCheckService:', error);
    }
  }
  
  // 加载配置
  async loadConfig() {
    try {
      const savedConfig = localStorage.getItem(this.STORAGE_KEYS.UPDATE_CONFIG);
      if (savedConfig) {
        this.config = { ...this.DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      } else {
        this.config = { ...this.DEFAULT_CONFIG };
        await this.saveConfig();
      }
      
      // 加载检查记录
      const records = localStorage.getItem(this.STORAGE_KEYS.CHECK_RECORDS);
      this.checkRecords = records ? JSON.parse(records) : [];
      
    } catch (error) {
      console.error('Failed to load update config:', error);
      this.config = { ...this.DEFAULT_CONFIG };
      this.checkRecords = [];
    }
  }
  
  // 保存配置
  async saveConfig() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.UPDATE_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save update config:', error);
    }
  }
  
  // 保存检查记录
  async saveCheckRecords() {
    try {
      // 只保留最近100条记录
      if (this.checkRecords.length > 100) {
        this.checkRecords = this.checkRecords.slice(-100);
      }
      localStorage.setItem(this.STORAGE_KEYS.CHECK_RECORDS, JSON.stringify(this.checkRecords));
    } catch (error) {
      console.error('Failed to save check records:', error);
    }
  }
  
  // 检查是否需要执行版本检查
  shouldCheckForUpdate() {
    if (!this.config.enabled) return false;
    
    const frequency = this.CHECK_FREQUENCIES[this.config.checkFrequency];
    
    // 如果是启动时检查，且上次检查时间不是今天，则需要检查
    if (this.config.checkFrequency === 'startup') {
      const today = new Date().toDateString();
      const lastCheckDate = this.config.lastCheckTime ? new Date(this.config.lastCheckTime).toDateString() : null;
      return lastCheckDate !== today;
    }
    
    // 对于每日/每周检查，检查时间间隔
    if (!this.config.lastCheckTime) return true;
    
    const now = Date.now();
    const timeSinceLastCheck = now - this.config.lastCheckTime;
    
    return timeSinceLastCheck >= frequency;
  }
  
  // 获取服务器版本信息
  async fetchServerVersion(apiBaseUrl) {
    const versionUrl = `${apiBaseUrl}/version.json`;
    const timeout = 8000; // 8秒超时
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(versionUrl, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const versionData = await response.json();
      
      // 验证版本数据格式
      if (!versionData || !versionData.version) {
        throw new Error('Invalid version data format');
      }
      
      return versionData;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
  
  // 版本号比较（支持语义化版本号）
  compareVersions(currentVersion, serverVersion) {
    // 清理版本号，移除前缀如 'v'
    const cleanCurrent = currentVersion.replace(/^v/i, '');
    const cleanServer = serverVersion.replace(/^v/i, '');
    
    // 分割版本号为数字数组
    const currentParts = cleanCurrent.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });
    
    const serverParts = cleanServer.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });
    
    // 确保数组长度一致
    const maxLength = Math.max(currentParts.length, serverParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPart = currentParts[i] || 0;
      const serverPart = serverParts[i] || 0;
      
      if (serverPart > currentPart) return 1; // 服务器版本更高
      if (serverPart < currentPart) return -1; // 当前版本更高
    }
    
    return 0; // 版本相同
  }
  
  // 执行版本检查
  async checkForUpdate(currentVersion, apiBaseUrl) {
    if (!this.shouldCheckForUpdate() && !forceCheck) {
      return null;
    }
    
    const checkRecord = {
      timestamp: Date.now(),
      currentVersion,
      apiBaseUrl,
      status: 'pending'
    };
    
    try {
      const serverData = await this.fetchServerVersion(apiBaseUrl);
      
      const comparison = this.compareVersions(currentVersion, serverData.version);
      
      checkRecord.status = 'success';
      checkRecord.serverVersion = serverData.version;
      checkRecord.hasUpdate = comparison > 0;
      checkRecord.updateInfo = serverData;
      
      // 更新配置中的最后检查时间
      this.config.lastCheckTime = Date.now();
      await this.saveConfig();
      
      // 如果有更新，保存更新信息
      if (comparison > 0) {
        localStorage.setItem(this.STORAGE_KEYS.LAST_UPDATE_INFO, JSON.stringify({
          timestamp: Date.now(),
          currentVersion,
          serverVersion: serverData.version,
          updateUrl: `${apiBaseUrl}/upgrade`,
          updateInfo: serverData
        }));
      }
      
      // 记录检查结果
      this.checkRecords.push(checkRecord);
      await this.saveCheckRecords();
      
      return {
        hasUpdate: comparison > 0,
        currentVersion,
        serverVersion: serverData.version,
        updateUrl: `${apiBaseUrl}/upgrade`,
        updateInfo: serverData,
        comparison
      };
      
    } catch (error) {
      checkRecord.status = 'failed';
      checkRecord.error = error.message;
      
      // 记录检查结果（失败）
      this.checkRecords.push(checkRecord);
      await this.saveCheckRecords();
      
      // 静默处理错误，不抛出
      console.warn('Update check failed:', error.message);
      return null;
    }
  }
  
  // 强制检查更新（忽略检查频率）
  async forceCheckForUpdate(currentVersion, apiBaseUrl) {
    return await this.checkForUpdate(currentVersion, apiBaseUrl, true);
  }
  
  // 获取更新配置
  getConfig() {
    return { ...this.config };
  }
  
  // 更新配置
  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
  }
  
  // 获取检查记录
  getCheckRecords() {
    return [...this.checkRecords];
  }
  
  // 获取最后一次更新信息
  getLastUpdateInfo() {
    try {
      const info = localStorage.getItem(this.STORAGE_KEYS.LAST_UPDATE_INFO);
      return info ? JSON.parse(info) : null;
    } catch (error) {
      console.error('Failed to get last update info:', error);
      return null;
    }
  }
  
  // 清除更新信息（用户选择稍后更新）
  async clearUpdateInfo() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.LAST_UPDATE_INFO);
    } catch (error) {
      console.error('Failed to clear update info:', error);
    }
  }
}

// 创建单例实例
const updateCheckService = new UpdateCheckService();

export default updateCheckService;