/**
 * 增强版用户配置管理器
 * 集成数据持久化、数据完整性检查、节点级更新等功能
 * 提供原子操作和事务完整性保证
 */

import { dataPersistenceManager } from './DataPersistenceManager.js';
import { dataIntegrityManager } from './DataIntegrityManager.js';
import { baziUpdateManager } from './BaziUpdateManager.js';
import { generateLunarAndTrueSolarFields, validateAndFixLunarDate, batchValidateLunarDates } from './LunarCalendarHelper.js';
import { calculateDetailedBazi } from './baziHelper.js';

// 默认配置模板
const DEFAULT_CONFIG = {
  nickname: '叉子',
  realName: '张三',
  birthDate: '1991-04-30',
  birthTime: '12:30',
  shichen: '午时',
  birthLocation: {
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    lng: 116.48,
    lat: 39.95
  },
  zodiac: '金牛座',
  zodiacAnimal: '羊',
  gender: 'male',
  mbti: 'INFP',
  nameScore: null,
  bazi: null,
  isused: false,
  // 新增字段：农历日期和真太阳时
  lunarBirthDate: null, // 农历出生日期，格式："辛丑年 八月 初四"
  trueSolarTime: "12:30",  // 真太阳时，格式："12:30"
  lunarInfo: null,      // 完整的农历信息对象
  lastCalculated: null  // 最后计算时间
};

// 存储键名
const STORAGE_KEYS = {
  USER_CONFIGS: 'nice_today_user_configs_v2',
  ACTIVE_CONFIG_INDEX: 'nice_today_active_config_index_v2',
  CONFIG_METADATA: 'nice_today_config_metadata'
};

class EnhancedUserConfigManager {
  constructor() {
    this.configs = [];
    this.activeConfigIndex = 0;
    this.listeners = [];
    this.initialized = false;
    this.metadata = {
      version: '2.0.0',
      lastModified: null,
      dataChecksum: null,
      backupCount: 0
    };
    
    // 绑定方法
    this.handleStorageError = this.handleStorageError.bind(this);
    this.handleDataCorruption = this.handleDataCorruption.bind(this);
  }

  /**
   * 初始化配置管理器
   */
  async initialize() {
    try {
      console.log('开始初始化增强版用户配置管理器...');
      
      // 初始化数据持久化管理器
      await dataPersistenceManager.initialize();
      
      // 从多级存储加载配置
      const loadResult = await this.loadConfigsFromStorage();
      
      if (loadResult.success) {
        this.configs = loadResult.configs;
        this.activeConfigIndex = loadResult.activeIndex;
        this.metadata = loadResult.metadata;
        
        console.log('配置加载成功:', {
          configCount: this.configs.length,
          activeIndex: this.activeConfigIndex,
          metadata: this.metadata
        });
      } else {
        // 加载失败，使用默认配置
        console.warn('配置加载失败，使用默认配置');
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
        await this.saveConfigsToStorage();
      }
      
      // 验证数据完整性
      const integrityCheck = await this.validateAllConfigs();
      
      if (!integrityCheck.allValid) {
        console.warn('发现数据完整性问题，进行修复...');
        await this.repairDataIntegrity(integrityCheck);
      }
      
      this.initialized = true;
      this.notifyListeners();
      
      console.log('增强版用户配置管理器初始化完成');
      return true;
      
    } catch (error) {
      console.error('初始化增强版用户配置管理器失败:', error);
      
      // 紧急恢复机制
      this.configs = [DEFAULT_CONFIG];
      this.activeConfigIndex = 0;
      this.initialized = true;
      
      return false;
    }
  }

  /**
   * 从多级存储加载配置
   */
  async loadConfigsFromStorage() {
    try {
      // 尝试从主存储加载
      const primaryResult = await dataPersistenceManager.loadData(STORAGE_KEYS.USER_CONFIGS);
      const indexResult = await dataPersistenceManager.loadData(STORAGE_KEYS.ACTIVE_CONFIG_INDEX);
      const metadataResult = await dataPersistenceManager.loadData(STORAGE_KEYS.CONFIG_METADATA);
      
      if (primaryResult.success && primaryResult.data) {
        const configs = primaryResult.data;
        const activeIndex = indexResult.success ? parseInt(indexResult.data, 10) : 0;
        const metadata = metadataResult.success ? metadataResult.data : this.metadata;
        
        // 验证配置数据完整性
        const validation = dataIntegrityManager.batchValidate(configs);
        
        if (validation.validCount === configs.length) {
          return {
            success: true,
            configs,
            activeIndex: Math.max(0, Math.min(activeIndex, configs.length - 1)),
            metadata
          };
        }
      }
      
      // 主存储加载失败，尝试从备份恢复
      return await this.tryBackupRecovery();
      
    } catch (error) {
      console.error('从存储加载配置失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 尝试从备份恢复
   */
  async tryBackupRecovery() {
    try {
      const backupResult = await dataPersistenceManager.loadBackup(STORAGE_KEYS.USER_CONFIGS);
      
      if (backupResult.success && backupResult.data) {
        console.log('从备份恢复配置成功');
        
        // 恢复主存储
        await dataPersistenceManager.saveData(STORAGE_KEYS.USER_CONFIGS, backupResult.data);
        
        return {
          success: true,
          configs: backupResult.data,
          activeIndex: 0,
          metadata: { ...this.metadata, backupRecovery: true }
        };
      }
      
      return { success: false, error: '备份恢复失败' };
      
    } catch (error) {
      console.error('备份恢复失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 保存配置到多级存储
   */
  async saveConfigsToStorage() {
    try {
      // 更新元数据
      this.metadata.lastModified = new Date().toISOString();
      this.metadata.dataChecksum = this.generateDataChecksum();
      
      // 保存到主存储
      const saveResult = await dataPersistenceManager.saveData(
        STORAGE_KEYS.USER_CONFIGS, 
        this.configs
      );
      
      if (!saveResult.success) {
        throw new Error('保存到主存储失败');
      }
      
      // 保存活跃索引
      await dataPersistenceManager.saveData(
        STORAGE_KEYS.ACTIVE_CONFIG_INDEX, 
        this.activeConfigIndex.toString()
      );
      
      // 保存元数据
      await dataPersistenceManager.saveData(
        STORAGE_KEYS.CONFIG_METADATA, 
        this.metadata
      );
      
      // 创建备份
      await dataPersistenceManager.createBackup(STORAGE_KEYS.USER_CONFIGS, this.configs);
      this.metadata.backupCount++;
      
      console.log('配置保存成功', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex,
        checksum: this.metadata.dataChecksum
      });
      
      return true;
      
    } catch (error) {
      console.error('保存配置失败:', error);
      this.handleStorageError(error);
      return false;
    }
  }

  /**
   * 验证所有配置的完整性
   */
  async validateAllConfigs() {
    const validation = dataIntegrityManager.batchValidate(this.configs);
    
    // 检查活跃索引有效性
    if (this.activeConfigIndex < 0 || this.activeConfigIndex >= this.configs.length) {
      validation.invalidCount++;
      validation.details.push({
        index: -1,
        config: null,
        validation: { valid: false, errors: [{ field: 'activeIndex', message: '活跃索引无效' }] },
        integrity: { isIntegrity: false, issues: ['活跃索引超出范围'] },
        isValid: false
      });
    }
    
    // 验证农历日期一致性
    const lunarValidation = batchValidateLunarDates(this.configs);
    if (lunarValidation.fixed > 0) {
      validation.invalidCount += lunarValidation.fixed;
      validation.validCount = Math.max(0, validation.validCount - lunarValidation.fixed);
    }
    
    return {
      allValid: validation.validCount === this.configs.length && 
                this.activeConfigIndex >= 0 && 
                this.activeConfigIndex < this.configs.length,
      validation,
      lunarValidation
    };
  }

  /**
   * 修复数据完整性
   */
  async repairDataIntegrity(integrityCheck) {
    try {
      const repairs = [];
      
      // 修复无效配置
      for (let i = 0; i < integrityCheck.validation.details.length; i++) {
        const detail = integrityCheck.validation.details[i];
        
        if (!detail.isValid && detail.config) {
          const repair = dataIntegrityManager.suggestDataRepairs(detail.config);
          
          if (repair.hasRepairs) {
            this.configs[i] = repair.repairedConfig;
            repairs.push(`配置 ${i}: ${repair.repairs.join(', ')}`);
          }
        }
      }
      
      // 修复农历日期一致性
      if (integrityCheck.lunarValidation && integrityCheck.lunarValidation.fixed > 0) {
        for (const detail of integrityCheck.lunarValidation.details) {
          if (detail.fixed && detail.index >= 0 && detail.index < this.configs.length) {
            this.configs[detail.index] = validateAndFixLunarDate(this.configs[detail.index]);
            repairs.push(`配置 ${detail.index}: 修复农历日期和真太阳时`);
          }
        }
      }
      
      // 修复活跃索引
      if (this.activeConfigIndex < 0 || this.activeConfigIndex >= this.configs.length) {
        this.activeConfigIndex = 0;
        repairs.push('活跃索引已修复为0');
      }
      
      // 确保至少有一个配置
      if (this.configs.length === 0) {
        this.configs = [DEFAULT_CONFIG];
        repairs.push('已添加默认配置');
      }
      
      // 保存修复后的配置
      if (repairs.length > 0) {
        await this.saveConfigsToStorage();
        console.log('数据完整性修复完成:', repairs);
      }
      
      return { repaired: repairs.length > 0, repairs };
      
    } catch (error) {
      console.error('数据完整性修复失败:', error);
      return { repaired: false, error: error.message };
    }
  }

  /**
   * 获取当前活跃配置
   */
  getCurrentConfig() {
    if (!this.initialized || this.configs.length === 0) {
      return DEFAULT_CONFIG;
    }
    
    const currentConfig = this.configs[this.activeConfigIndex];
    
    // 验证配置完整性
    const validation = dataIntegrityManager.validateConfig(currentConfig);
    
    if (!validation.valid) {
      console.warn('当前配置验证失败，进行紧急修复');
      const repair = dataIntegrityManager.suggestDataRepairs(currentConfig);
      return repair.repairedConfig;
    }
    
    return currentConfig;
  }

  /**
   * 获取所有配置
   */
  getAllConfigs() {
    if (!this.initialized) {
      return [DEFAULT_CONFIG];
    }

    return [...this.configs];
  }

  /**
   * 获取当前活跃配置的索引
   * @returns {Number} 当前配置索引
   */
  getActiveConfigIndex() {
    return this.activeConfigIndex;
  }

  /**
   * 使用节点级更新修改配置
   */
  async updateConfigWithNodeUpdate(index, updates, updateType = 'auto') {
    if (!this.initialized || index < 0 || index >= this.configs.length) {
      throw new Error('无效的配置索引');
    }
    
    try {
      const currentConfig = this.configs[index];
      
      // 执行节点级更新
      const updateResult = await baziUpdateManager.executeNodeUpdate(
        currentConfig, 
        updates, 
        updateType
      );
      
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }
      
      // 更新配置
      let updatedConfig = updateResult.updatedConfig;
      
      // 如果更新了出生日期、时间或位置，重新计算农历和真太阳时
      const needsLunarRecalculation = 
        updates.birthDate !== undefined || 
        updates.birthTime !== undefined || 
        updates.birthLocation !== undefined;
      
      if (needsLunarRecalculation) {
        updatedConfig = validateAndFixLunarDate(updatedConfig);
      }
      
      this.configs[index] = updatedConfig;
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('节点级更新成功:', {
        index,
        affectedFields: updateResult.affectedFields,
        needsLunarRecalculation,
        warnings: updateResult.warnings
      });
      
      return {
        success: true,
        updatedConfig,
        transaction: updateResult.transaction
      };
      
    } catch (error) {
      console.error('节点级更新失败:', error);
      
      return {
        success: false,
        error: error.message,
        originalConfig: this.configs[index]
      };
    }
  }

  /**
   * 添加新配置
   */
  async addConfig(config) {
    try {
      // 验证配置数据
      const validation = dataIntegrityManager.validateConfig(config);
      
      if (!validation.valid) {
        throw new Error(`配置验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      // 验证昵称唯一性
      const nicknameExists = this.configs.some(c => c.nickname === config.nickname);
      if (nicknameExists) {
        throw new Error(`昵称 '${config.nickname}' 已存在，请选择其他昵称`);
      }
      
      // 确保基础信息配置完整，八字信息单独处理
      const finalConfig = {
        ...config,
        // 如果没有八字信息，设置为null
        bazi: config.bazi || null,
        lunarBirthDate: config.lunarBirthDate || null,
        trueSolarTime: config.trueSolarTime || null,
        lunarInfo: config.lunarInfo || null,
        lastCalculated: config.lastCalculated || null
      };
      
      // 添加配置
      this.configs.push(finalConfig);
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('添加新配置成功', finalConfig.nickname);
      return true;
      
    } catch (error) {
      console.error('添加配置失败:', error);
      return false;
    }
  }

  /**
   * 删除配置
   */
  async removeConfig(index) {
    if (!this.initialized || index < 0 || index >= this.configs.length || this.configs.length <= 1) {
      throw new Error('无法删除配置：索引无效或只剩一个配置');
    }
    
    try {
      // 删除配置
      this.configs.splice(index, 1);
      
      // 调整活跃索引
      if (index === this.activeConfigIndex) {
        this.activeConfigIndex = Math.max(0, this.activeConfigIndex - 1);
      } else if (index < this.activeConfigIndex) {
        this.activeConfigIndex--;
      }
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('删除配置成功');
      return true;
      
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  }
  
  /**
   * 更新八字信息
   * @param {string} nickname - 用户昵称
   * @param {Object} baziInfo - 八字信息
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateBaziInfo(nickname, baziInfo) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    
    try {
      // 查找对应用户
      const configIndex = this.configs.findIndex(config => config.nickname === nickname);
      
      if (configIndex === -1) {
        throw new Error(`未找到昵称为 '${nickname}' 的用户配置`);
      }
      
      // 更新八字信息
      this.configs[configIndex] = {
        ...this.configs[configIndex],
        bazi: baziInfo.bazi || this.configs[configIndex].bazi,
        lunarBirthDate: baziInfo.lunarBirthDate || this.configs[configIndex].lunarBirthDate,
        trueSolarTime: baziInfo.trueSolarTime || this.configs[configIndex].trueSolarTime,
        lunarInfo: baziInfo.lunarInfo || this.configs[configIndex].lunarInfo,
        lastCalculated: baziInfo.lastCalculated || new Date().toISOString()
      };
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('八字信息更新成功', nickname);
      return true;
      
    } catch (error) {
      console.error('更新八字信息失败:', error);
      return false;
    }
  }
  
  /**
   * 从出生信息计算并更新八字信息
   * @param {string} nickname - 用户昵称
   * @param {Object} birthInfo - 出生信息 {birthDate, birthTime, longitude}
   * @returns {Promise<boolean>} 是否更新成功
   */
  async calculateAndSyncBaziInfo(nickname, birthInfo) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    
    try {
      // 查找对应用户
      const configIndex = this.configs.findIndex(config => config.nickname === nickname);
      
      if (configIndex === -1) {
        throw new Error(`未找到昵称为 '${nickname}' 的用户配置`);
      }
      
      const config = this.configs[configIndex];
      
      // 如果没有提供出生信息，使用配置中的信息
      const birthDate = birthInfo.birthDate || config.birthDate;
      const birthTime = birthInfo.birthTime || config.birthTime;
      const longitude = birthInfo.longitude || config.birthLocation?.lng || 116.40;
      
      // 计算八字信息
      const baziInfo = calculateDetailedBazi(birthDate, birthTime, longitude);
      
      if (!baziInfo) {
        throw new Error('八字计算失败');
      }
      
      // 更新八字信息
      return await this.updateBaziInfo(nickname, {
        ...baziInfo,
        lastCalculated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('计算并同步八字信息失败:', error);
      return false;
    }
  }
  
  /**
   * 为新配置添加基础信息，八字信息后续可异步更新
   * @param {Object} basicConfig - 基础配置信息
   * @returns {Promise<boolean>} 是否添加成功
   */
  async addBasicConfig(basicConfig) {
    try {
      // 验证基础配置数据
      const validation = dataIntegrityManager.validateConfig(basicConfig);
      
      if (!validation.valid) {
        throw new Error(`基础配置验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
      }
      
      // 验证昵称唯一性
      const nicknameExists = this.configs.some(c => c.nickname === basicConfig.nickname);
      if (nicknameExists) {
        throw new Error(`昵称 '${basicConfig.nickname}' 已存在，请选择其他昵称`);
      }
      
      // 确保基础信息配置完整，八字信息设置为null
      const finalConfig = {
        ...basicConfig,
        bazi: null, // 八字信息后续异步计算
        lunarBirthDate: null,
        trueSolarTime: null,
        lunarInfo: null,
        lastCalculated: null
      };
      
      // 添加配置
      this.configs.push(finalConfig);
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('添加基础配置成功', finalConfig.nickname);
      return true;
      
    } catch (error) {
      console.error('添加基础配置失败:', error);
      return false;
    }
  }

  /**
   * 设置活跃配置
   */
  async setActiveConfig(index) {
    if (!this.initialized || index < 0 || index >= this.configs.length) {
      throw new Error('无效的配置索引');
    }
    
    try {
      this.activeConfigIndex = index;
      
      // 保存到存储
      await this.saveConfigsToStorage();
      
      // 通知监听器
      this.notifyListeners();
      
      console.log('设置活跃配置成功');
      return true;
      
    } catch (error) {
      console.error('设置活跃配置失败:', error);
      return false;
    }
  }

  /**
   * 生成数据校验和
   */
  generateDataChecksum() {
    const dataString = JSON.stringify({
      configs: this.configs,
      activeIndex: this.activeConfigIndex
    });
    
    // 简单的校验和算法
    let checksum = 0;
    for (let i = 0; i < dataString.length; i++) {
      checksum = ((checksum << 5) - checksum) + dataString.charCodeAt(i);
      checksum = checksum & checksum; // 转换为32位整数
    }
    
    return checksum.toString(16);
  }

  /**
   * 处理存储错误
   */
  handleStorageError(error) {
    console.error('存储错误处理:', error);
    
    // 记录错误到元数据
    if (!this.metadata.errors) {
      this.metadata.errors = [];
    }
    
    this.metadata.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      type: 'storage_error'
    });
    
    // 限制错误记录数量
    if (this.metadata.errors.length > 10) {
      this.metadata.errors = this.metadata.errors.slice(-10);
    }
  }

  /**
   * 处理数据损坏
   */
  handleDataCorruption() {
    console.warn('检测到数据损坏，尝试恢复...');
    
    // 尝试从备份恢复
    this.tryBackupRecovery().then(result => {
      if (result.success) {
        console.log('数据损坏恢复成功');
        this.notifyListeners();
      } else {
        console.error('数据损坏恢复失败，使用默认配置');
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
        this.notifyListeners();
      }
    });
  }

  /**
   * 添加配置变更监听器
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('监听器必须是函数');
    }
    
    this.listeners.push(listener);
    
    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有监听器
   */
  notifyListeners() {
    const currentConfig = this.getCurrentConfig();
    
    this.listeners.forEach(listener => {
      try {
        listener({
          configs: [...this.configs],
          activeConfigIndex: this.activeConfigIndex,
          currentConfig,
          metadata: { ...this.metadata }
        });
      } catch (error) {
        console.error('监听器执行出错:', error);
      }
    });
  }

  /**
   * 导出配置数据
   * @returns {String} JSON字符串
   */
  exportConfigs() {
    try {
      return JSON.stringify({
        configs: this.configs,
        activeConfigIndex: this.activeConfigIndex,
        metadata: this.metadata,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('导出配置失败:', error);
      return null;
    }
  }

  /**
   * 导入配置数据
   * @param {String} jsonData JSON字符串
   * @returns {Boolean} 是否导入成功
   */
  async importConfigs(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (!data.configs || !Array.isArray(data.configs)) {
        throw new Error('无效的配置数据格式');
      }

      // 验证所有配置的完整性
      const validation = dataIntegrityManager.batchValidate(data.configs);
      if (validation.validCount !== data.configs.length) {
        console.warn('导入的配置存在数据完整性问题，将进行修复');
      }

      this.configs = data.configs;
      this.activeConfigIndex = data.activeConfigIndex || 0;

      // 确保至少有一组配置
      if (this.configs.length === 0) {
        this.configs = [DEFAULT_CONFIG];
        this.activeConfigIndex = 0;
      }

      // 确保索引在有效范围内
      this.activeConfigIndex = Math.max(0, Math.min(this.activeConfigIndex, this.configs.length - 1));

      // 保存到存储
      await this.saveConfigsToStorage();
      this.notifyListeners();

      console.log('导入配置成功', {
        configCount: this.configs.length,
        activeIndex: this.activeConfigIndex
      });

      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    return {
      initialized: this.initialized,
      configCount: this.configs.length,
      activeIndex: this.activeConfigIndex,
      listenerCount: this.listeners.length,
      metadata: { ...this.metadata },
      storageStatus: dataPersistenceManager.getStatus(),
      lastValidation: dataIntegrityManager.batchValidate(this.configs)
    };
  }

  /**
   * 重置系统
   */
  async resetSystem() {
    try {
      this.configs = [DEFAULT_CONFIG];
      this.activeConfigIndex = 0;
      this.metadata = {
        version: '2.0.0',
        lastModified: new Date().toISOString(),
        dataChecksum: this.generateDataChecksum(),
        backupCount: 0,
        reset: true
      };
      
      await this.saveConfigsToStorage();
      this.notifyListeners();
      
      console.log('系统重置完成');
      return true;
      
    } catch (error) {
      console.error('系统重置失败:', error);
      return false;
    }
  }
}

// 创建单例实例
export const enhancedUserConfigManager = new EnhancedUserConfigManager();

export default EnhancedUserConfigManager;