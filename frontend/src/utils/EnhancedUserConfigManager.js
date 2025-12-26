/**
 * 增强版用户配置管理器
 * 集成数据持久化、数据完整性检查、节点级更新等功能
 * 提供原子操作和事务完整性保证
 * 支持并发访问保护和自动节点恢复
 */

import { dataPersistenceManager } from './DataPersistenceManager.js';
import { dataIntegrityManager } from './DataIntegrityManager.js';
import { baziUpdateManager } from './BaziUpdateManager.js';
import { generateLunarAndTrueSolarFields, validateAndFixLunarDate, batchValidateLunarDates } from './LunarCalendarHelper.js';
import { calculateDetailedBazi } from './baziHelper.js';
import { baziCacheManager } from './BaziCacheManager.js';
import { concurrencyLock } from './ConcurrencyLock.js';
import { nodeRecoveryManager } from './NodeRecoveryManager.js';
import { operationLogger } from './OperationLogger.js';

// 默认配置模板（冻结的不可变对象，确保系统配置不会被意外修改）
const DEFAULT_CONFIG = Object.freeze({
  nickname: '叉子',
  realName: '',
  birthDate: '1991-04-30',
  birthTime: '12:30',
  shichen: '午时',
  birthLocation: Object.freeze({
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    lng: 116.48,
    lat: 39.95
  }),
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
});

/**
 * 深拷贝配置对象，确保用户配置与默认配置完全隔离
 * @param {Object} sourceConfig - 源配置对象
 * @returns {Object} 深拷贝的新配置对象
 */
function deepCloneConfig(sourceConfig) {
  if (!sourceConfig || typeof sourceConfig !== 'object') {
    return sourceConfig;
  }

  // 使用安全的深拷贝方法处理可能的循环引用
  const seen = new WeakSet();
  
  function safeClone(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    if (seen.has(obj)) {
      // 发现循环引用，返回 undefined 避免错误
      console.warn('发现循环引用，已跳过该对象');
      return undefined;
    }
    
    seen.add(obj);
    
    if (Array.isArray(obj)) {
      const clonedArray = [];
      for (let i = 0; i < obj.length; i++) {
        clonedArray[i] = safeClone(obj[i]);
      }
      seen.delete(obj);
      return clonedArray;
    }
    
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = safeClone(obj[key]);
      }
    }
    seen.delete(obj);
    return clonedObj;
  }
  
  const cloned = safeClone(sourceConfig);
  
  // 确保 birthLocation 对象也被深拷贝
  if (sourceConfig.birthLocation && cloned.birthLocation) {
    cloned.birthLocation = { ...sourceConfig.birthLocation };
  }

  // 如果存在八字信息，需要特殊处理 full 属性（可能包含循环引用的 lunar 对象）
  if (cloned.bazi && typeof cloned.bazi === 'object' && cloned.bazi.full) {
    // 安全地提取 full 对象，避免循环引用
    const full = cloned.bazi.full;

    // 检查 full 是否是 lunar 对象
    const hasLunarMethods = full && typeof full.getYearInGanZhi === 'function';

    // 提取 lunar 对象的安全属性
    const safeLunar = hasLunarMethods ? {
      yearStr: full.getYearInGanZhi() + '年',
      monthStr: full.getMonthInChinese() + '月',
      dayStr: full.getDayInChinese(),
      text: `${full.getYearInGanZhi()}年 ${full.getMonthInChinese()}月${full.getDayInChinese()}`,
      // 添加其他必要属性
      zodiacAnimal: full.getYearShengXiao ? full.getYearShengXiao() : '',
      monthInChinese: full.getMonthInChinese(),
      dayInChinese: full.getDayInChinese(),
      yearInChinese: full.getYearInGanZhi ? full.getYearInGanZhi() : '',
      monthGanZhi: full.getMonthInGanZhi ? full.getMonthInGanZhi() : '',
      dayGanZhi: full.getDayInGanZhi ? full.getDayInGanZhi() : ''
    } : null;

    // 创建新的 bazi 对象，移除 full 属性避免循环引用
    cloned.bazi = {
      ...cloned.bazi,
      lunar: safeLunar,
      // 移除 full 属性
      full: undefined
    };
  }

  // 清理可能导致 React 问题的 undefined 属性
  if (cloned.bazi && typeof cloned.bazi === 'object') {
    // 移除 undefined 属性
    const cleanedBazi = {};
    for (const key in cloned.bazi) {
      if (cloned.bazi[key] !== undefined) {
        cleanedBazi[key] = cloned.bazi[key];
      }
    }
    cloned.bazi = cleanedBazi;
  }

  return cloned;
}

/**
 * 从默认配置创建新配置模板
 * @param {Object} overrides - 需要覆盖的字段
 * @returns {Object} 新配置对象（深拷贝）
 */
function createConfigFromDefault(overrides = {}) {
  return deepCloneConfig({
    ...DEFAULT_CONFIG,
    ...overrides
  });
}

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
    // 容错机制配置
    this.faultToleranceEnabled = true; // 是否启用容错机制
    this.autoRecoveryEnabled = true;   // 是否启用自动恢复
    this.maxRecoveryAttempts = 3;    // 最大恢复尝试次数
    
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
      
      // 初始化八字缓存管理器
      await baziCacheManager.initialize();
      
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
        // 加载失败，使用默认配置（创建深拷贝）
        console.warn('配置加载失败，使用默认配置');
        this.configs = [createConfigFromDefault()];
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

      // 紧急恢复机制（使用深拷贝）
      this.configs = [createConfigFromDefault()];
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
      const activeIndexResult = await dataPersistenceManager.saveData(
        STORAGE_KEYS.ACTIVE_CONFIG_INDEX,
        this.activeConfigIndex.toString()
      );
      if (!activeIndexResult.success) {
        throw new Error('保存活跃索引失败');
      }

      // 保存元数据
      const metadataResult = await dataPersistenceManager.saveData(
        STORAGE_KEYS.CONFIG_METADATA,
        this.metadata
      );
      if (!metadataResult.success) {
        throw new Error('保存元数据失败');
      }
      
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
   * 获取当前活跃配置（返回深拷贝以防止意外修改）
   */
  getCurrentConfig() {
    if (!this.initialized || this.configs.length === 0) {
      return createConfigFromDefault();
    }

    const currentConfig = this.configs[this.activeConfigIndex];

    // 验证配置完整性
    const validation = dataIntegrityManager.validateConfig(currentConfig);

    if (!validation.valid) {
      console.warn('当前配置验证失败，进行紧急修复');
      const repair = dataIntegrityManager.suggestDataRepairs(currentConfig);
      return repair.repairedConfig;
    }

    return deepCloneConfig(currentConfig);
  }

  /**
   * 获取所有配置（返回深拷贝以防止意外修改）
   */
  getAllConfigs() {
    if (!this.initialized) {
      return [createConfigFromDefault()];
    }

    return this.configs.map(config => deepCloneConfig(config));
  }

  /**
   * 获取当前活跃配置的索引
   * @returns {Number} 当前配置索引
   */
  getActiveConfigIndex() {
    return this.activeConfigIndex;
  }

  /**
   * 使用节点级更新修改配置（带容错机制）
   */
  async updateConfigWithNodeUpdate(index, updates, updateType = 'auto') {
    console.log('========== updateConfigWithNodeUpdate 开始 ==========');
    console.log('参数:', { index, updateType, configsLength: this.configs.length, initialized: this.initialized });

    if (!this.initialized || index < 0 || index >= this.configs.length) {
      console.error('无效的配置索引:', { index, configsLength: this.configs.length, initialized: this.initialized });
      throw new Error(`无效的配置索引: index=${index}, configs.length=${this.configs.length}`);
    }

    const currentConfig = this.configs[index];
    const lockKey = `config-update-${index}`;
    const operationId = `update-${Date.now()}`;

    console.log('当前配置:', { nickname: currentConfig.nickname, birthDate: currentConfig.birthDate });
    console.log('更新字段:', Object.keys(updates));

    operationLogger.log('info', 'UPDATE_STARTED', {
      operationId,
      index,
      configNickname: currentConfig.nickname,
      updateType,
      updates: Object.keys(updates)
    });

    // 使用并发锁保护关键操作
    return await concurrencyLock.withLock(lockKey, async () => {
      try {
        // 执行节点级更新
        const updateResult = await baziUpdateManager.executeNodeUpdate(
          currentConfig,
          updates,
          updateType
        );

        if (!updateResult.success) {
          throw new Error(updateResult.error || '节点级更新失败');
        }

        // 更新配置（深拷贝确保与原始配置隔离）
        let updatedConfig = deepCloneConfig(updateResult.updatedConfig);

        // 如果更新了出生日期、时间或位置，重新计算农历和真太阳时
        const needsLunarRecalculation =
          updates.birthDate !== undefined ||
          updates.birthTime !== undefined ||
          updates.birthLocation !== undefined;

        if (needsLunarRecalculation) {
          updatedConfig = validateAndFixLunarDate(updatedConfig);
        }

        this.configs[index] = updatedConfig;

        console.log('配置已更新到内存（深拷贝），准备保存到存储...');

        // 保存到存储
        const saveResult = await this.saveConfigsToStorage();
        console.log('saveConfigsToStorage 返回结果:', saveResult);

        // 通知监听器
        this.notifyListeners();
        console.log('监听器已通知');

        operationLogger.log('success', 'UPDATE_SUCCESS', {
          operationId,
          index,
          configNickname: currentConfig.nickname,
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
        operationLogger.log('error', 'UPDATE_ERROR', {
          operationId,
          index,
          configNickname: currentConfig.nickname,
          error: error.message,
          stack: error.stack
        });

        // 容错机制：尝试自动恢复
        if (this.autoRecoveryEnabled && this.faultToleranceEnabled) {
          operationLogger.log('info', 'ATTEMPTING_AUTO_RECOVERY', {
            operationId,
            index,
            configNickname: currentConfig.nickname
          });

          const recoveryResult = await nodeRecoveryManager.detectAndRecover(
            index,
            currentConfig,
            updates,
            error,
            this.configs
          );

          if (recoveryResult.success) {
            // 恢复成功，保存并通知
            await this.saveConfigsToStorage();
            this.notifyListeners();

            operationLogger.log('success', 'RECOVERY_SUCCESS', {
              operationId,
              recoveryId: recoveryResult.recoveryId,
              index,
              configNickname: currentConfig.nickname
            });

            return {
              success: true,
              updatedConfig: recoveryResult.node,
              recovered: true,
              recoveryId: recoveryResult.recoveryId,
              warnings: recoveryResult.warnings
            };
          } else {
            operationLogger.log('error', 'RECOVERY_FAILED', {
              operationId,
              recoveryId: recoveryResult.recoveryId,
              index,
              configNickname: currentConfig.nickname,
              recoveryError: recoveryResult.error
            });

            // 恢复失败，抛出原始错误
            throw new Error(`更新失败且自动恢复失败: ${error.message}`);
          }
        } else {
          // 未启用容错机制，直接抛出错误
          throw error;
        }
      }
    }, {
      owner: `config-manager-${operationId}`,
      timeout: 60000 // 60秒超时
    });
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

      // 确保基础信息配置完整，八字信息单独处理（深拷贝确保隔离）
      const finalConfig = deepCloneConfig({
        ...config,
        // 如果没有八字信息，设置为null
        bazi: config.bazi || null,
        lunarBirthDate: config.lunarBirthDate || null,
        trueSolarTime: config.trueSolarTime || null,
        lunarInfo: config.lunarInfo || null,
        lastCalculated: config.lastCalculated || null
      });

      // 添加配置
      this.configs.push(finalConfig);

      // 设置新添加的配置为活跃配置
      this.activeConfigIndex = this.configs.length - 1;

      // 保存到存储
      await this.saveConfigsToStorage();

      // 通知监听器（强制刷新）
      this.notifyListeners(true);

      console.log('添加新配置成功（深拷贝）', finalConfig.nickname);
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
   * @param {Object} baziInfo - 八字信息（统一格式，包含顶层属性）
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

      // 如果 baziInfo.bazi 存在，使用它作为八字数据
      // 否则如果 baziInfo 本身就是八字数据（旧格式），直接使用它
      const finalBaziData = baziInfo.bazi || baziInfo;

      // 更新八字信息（保存完整的八字数据，包括顶层属性）
      this.configs[configIndex] = {
        ...this.configs[configIndex],
        bazi: finalBaziData,
        lunarBirthDate: baziInfo.lunarBirthDate || finalBaziData?.lunar?.text || this.configs[configIndex].lunarBirthDate,
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

    // 验证参数
    if (!nickname || typeof nickname !== 'string') {
      console.error('calculateAndSyncBaziInfo: 昵称参数无效', nickname);
      return false;
    }

    try {
      // 查找对应用户
      const configIndex = this.configs.findIndex(config => config.nickname === nickname);

      if (configIndex === -1) {
        console.error(`未找到昵称为 '${nickname}' 的用户配置`, {
          configsLength: this.configs.length,
          configNicknames: this.configs.map(c => c.nickname)
        });
        return false;
      }

      const config = this.configs[configIndex];

      // 如果没有提供出生信息，使用配置中的信息
      const birthDate = birthInfo.birthDate || config.birthDate;
      const birthTime = birthInfo.birthTime || config.birthTime;
      const longitude = birthInfo.longitude || config.birthLocation?.lng || 116.40;

      // 验证出生信息
      if (!birthDate || !birthTime) {
        console.error('出生信息不完整', { birthDate, birthTime, nickname });
        return false;
      }

      // 计算八字信息
      const baziInfo = calculateDetailedBazi(birthDate, birthTime, longitude);

      if (!baziInfo) {
        console.error('八字计算失败', { birthDate, birthTime, longitude, nickname });
        return false;
      }

      // 更新八字信息
      const result = await this.updateBaziInfo(nickname, {
        ...baziInfo,
        lastCalculated: new Date().toISOString()
      });

      return result;

    } catch (error) {
      console.error('计算并同步八字信息失败:', {
        error: error.message,
        nickname,
        birthInfo
      });
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

      // 确保基础信息配置完整，八字信息设置为null（深拷贝确保隔离）
      const finalConfig = deepCloneConfig({
        ...basicConfig,
        bazi: null, // 八字信息后续异步计算
        lunarBirthDate: null,
        trueSolarTime: null,
        lunarInfo: null,
        lastCalculated: null
      });

      // 添加配置
      this.configs.push(finalConfig);

      // 将新配置设为活跃配置
      this.activeConfigIndex = this.configs.length - 1;

      // 保存到存储
      await this.saveConfigsToStorage();

      // 通知监听器
      this.notifyListeners();

      console.log('添加基础配置成功（深拷贝）', finalConfig.nickname, 'activeIndex:', this.activeConfigIndex);
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
   * 重新排序配置（支持拖拽排序）
   * @param {number} fromIndex - 源索引
   * @param {number} toIndex - 目标索引
   * @returns {Promise<boolean>} 是否排序成功
   */
  async reorderConfig(fromIndex, toIndex) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }

    if (fromIndex < 0 || fromIndex >= this.configs.length ||
        toIndex < 0 || toIndex >= this.configs.length) {
      throw new Error('无效的配置索引');
    }

    if (fromIndex === toIndex) {
      return true; // 无需排序
    }

    try {
      // 保存旧的活跃索引
      const oldActiveIndex = this.activeConfigIndex;

      // 移动配置项
      const [movedConfig] = this.configs.splice(fromIndex, 1);
      this.configs.splice(toIndex, 0, movedConfig);

      // 调整活跃配置索引
      if (oldActiveIndex === fromIndex) {
        this.activeConfigIndex = toIndex;
      } else if (fromIndex < oldActiveIndex && toIndex >= oldActiveIndex) {
        this.activeConfigIndex = oldActiveIndex - 1;
      } else if (fromIndex > oldActiveIndex && toIndex <= oldActiveIndex) {
        this.activeConfigIndex = oldActiveIndex + 1;
      }

      // 保存到存储
      await this.saveConfigsToStorage();

      // 通知监听器
      this.notifyListeners();

      console.log(`配置排序成功: 从索引 ${fromIndex} 移动到 ${toIndex}，活跃索引从 ${oldActiveIndex} 调整为 ${this.activeConfigIndex}`);
      return true;

    } catch (error) {
      console.error('配置排序失败:', error);
      throw error;
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
   * @param {Boolean} forceReload - 是否强制重新加载
   */
  notifyListeners(forceReload = false) {
    const currentConfig = this.getCurrentConfig();

    this.listeners.forEach(listener => {
      try {
        listener({
          configs: [...this.configs],
          activeConfigIndex: this.activeConfigIndex,
          currentConfig,
          metadata: { ...this.metadata },
          forceReload
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
      lastValidation: dataIntegrityManager.batchValidate(this.configs),
      baziCacheStats: baziCacheManager.getCacheStats()
    };
  }

  /**
   * 从八字缓存获取八字信息
   * @param {string} nickname 用户昵称
   * @returns {Object|null} 八字信息
   */
  getBaziFromCache(nickname) {
    return baziCacheManager.getBaziByNickname(nickname);
  }

  /**
   * 从八字缓存获取八字信息（通过出生信息）
   * @param {string} birthDate 出生日期
   * @param {string} birthTime 出生时间
   * @param {number} longitude 经度
   * @returns {Object|null} 八字信息
   */
  getBaziFromCacheByBirthInfo(birthDate, birthTime, longitude) {
    return baziCacheManager.getBaziByBirthInfo(birthDate, birthTime, longitude);
  }

  /**
   * 同步用户配置的八字到缓存
   * @param {string} nickname 用户昵称
   * @returns {Promise<boolean>} 是否同步成功
   */
  async syncBaziToCache(nickname) {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    
    const configIndex = this.configs.findIndex(c => c.nickname === nickname);
    if (configIndex === -1) {
      throw new Error(`未找到昵称为 '${nickname}' 的用户配置`);
    }
    
    const config = this.configs[configIndex];
    
    // 同步八字到缓存
    const success = baziCacheManager.syncConfigBaziToCache(config);
    
    if (success) {
      console.log('八字信息已同步到缓存:', nickname);
    }
    
    return success;
  }

  /**
   * 批量同步所有配置的八字到缓存
   * @returns {Promise<Object>} 同步统计
   */
  async syncAllBaziToCache() {
    if (!this.initialized) {
      throw new Error('配置管理器未初始化');
    }
    
    return baziCacheManager.batchSyncConfigs(this.configs);
  }

  /**
   * 清除指定用户的八字缓存
   * @param {string} nickname 用户昵称
   */
  clearBaziCache(nickname) {
    baziCacheManager.clearCache(nickname);
    console.log('已清除用户八字缓存:', nickname);
  }

  /**
   * 清除所有八字缓存
   */
  clearAllBaziCache() {
    baziCacheManager.clearAllCache();
    console.log('已清除所有八字缓存');
  }

  /**
   * 从缓存获取默认配置的八字
   * @param {Object} defaultConfig 默认配置对象
   * @returns {Object|null} 八字信息
   */
  getDefaultBaziFromCache(defaultConfig) {
    return baziCacheManager.getDefaultConfigBazi(defaultConfig);
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

  // ==================== 容错机制相关方法 ====================

  /**
   * 启用/禁用容错机制
   * @param {boolean} enabled 是否启用
   */
  setFaultToleranceEnabled(enabled) {
    this.faultToleranceEnabled = enabled;
    operationLogger.log('info', 'FAULT_TOLERANCE_TOGGLED', {
      enabled,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 启用/禁用自动恢复
   * @param {boolean} enabled 是否启用
   */
  setAutoRecoveryEnabled(enabled) {
    this.autoRecoveryEnabled = enabled;
    operationLogger.log('info', 'AUTO_RECOVERY_TOGGLED', {
      enabled,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取容错机制状态
   * @returns {Object} 容错状态
   */
  getFaultToleranceStatus() {
    return {
      faultToleranceEnabled: this.faultToleranceEnabled,
      autoRecoveryEnabled: this.autoRecoveryEnabled,
      maxRecoveryAttempts: this.maxRecoveryAttempts
    };
  }

  /**
   * 获取操作日志
   * @param {Object} filters 过滤条件
   * @returns {Array} 日志列表
   */
  getOperationLogs(filters = {}) {
    return operationLogger.getLogs(filters);
  }

  /**
   * 获取最近的操作日志
   * @param {number} count 日志数量
   * @returns {Array} 日志列表
   */
  getRecentLogs(count = 50) {
    return operationLogger.getRecentLogs(count);
  }

  /**
   * 获取错误日志
   * @returns {Array} 错误日志列表
   */
  getErrorLogs() {
    return operationLogger.getErrorLogs();
  }

  /**
   * 导出操作日志
   * @returns {string} JSON格式的日志
   */
  exportOperationLogs() {
    return operationLogger.exportLogs();
  }

  /**
   * 清空操作日志
   */
  clearOperationLogs() {
    operationLogger.clearLogs();
  }

  /**
   * 获取恢复历史
   * @param {Object} filters 过滤条件
   * @returns {Array} 恢复历史
   */
  getRecoveryHistory(filters = {}) {
    return nodeRecoveryManager.getRecoveryHistory(filters);
  }

  /**
   * 导出恢复历史
   * @returns {string} JSON格式的恢复历史
   */
  exportRecoveryHistory() {
    return nodeRecoveryManager.exportHistory();
  }

  /**
   * 获取容错统计信息
   * @returns {Object} 统计信息
   */
  getFaultToleranceStatistics() {
    const recoveryStats = nodeRecoveryManager.getStatistics();
    const errorLogs = operationLogger.getErrorLogs();
    const recentErrors = errorLogs.slice(-20); // 最近20个错误

    return {
      recovery: recoveryStats,
      errors: {
        total: errorLogs.length,
        recent: recentErrors.length
      },
      locks: concurrencyLock.getLockStatus()
    };
  }

/**
 * 生成唯一的新用户昵称（格式：新用户123，数字自动递增）
 * @returns {string} 唯一的昵称
 */
generateUniqueNickname() {
  const basePrefix = '新用户';
  let maxNumber = 0;

  // 查找现有配置中最大的数字
  this.configs.forEach(config => {
    if (config.nickname && config.nickname.startsWith(basePrefix)) {
      const numberStr = config.nickname.substring(basePrefix.length);
      const number = parseInt(numberStr, 10);
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }
  });

  // 生成新的昵称（从当前最大数字+1开始，或从1开始）
  const newNumber = maxNumber + 1;
  return `${basePrefix}${newNumber}`;
}

/**
 * 从默认配置模板复制创建新配置
 * @param {Object} overrides - 需要覆盖的字段（可选）
 * @returns {Promise<Object>} 新创建的配置（深拷贝）
 */
async duplicateConfigFromTemplate(overrides = {}) {
  if (!this.initialized) {
    throw new Error('配置管理器未初始化');
  }

  try {
    console.log('========== 开始从模板复制配置 ==========');

    // 1. 深拷贝默认配置模板，确保不修改原始模板
    const templateConfig = deepCloneConfig(DEFAULT_CONFIG);

    // 2. 生成唯一的昵称（如果未指定）
    const finalNickname = overrides.nickname || this.generateUniqueNickname();

    // 3. 验证昵称唯一性
    const nicknameExists = this.configs.some(c => c.nickname === finalNickname);
    if (nicknameExists) {
      throw new Error(`昵称 '${finalNickname}' 已存在，无法创建重复配置`);
    }

    // 4. 应用用户指定的覆盖字段
    const finalConfig = deepCloneConfig({
      ...templateConfig,
      nickname: finalNickname,
      ...overrides,
      // 确保以下字段被重置或保留
      bazi: overrides.bazi || null,  // 八字信息不复制，需要重新计算
      lunarBirthDate: null,
      trueSolarTime: null,
      lunarInfo: null,
      lastCalculated: null,
      isSystemDefault: false,  // 标记为非系统默认配置
      isused: false  // 初始状态为未使用
    });

    console.log('模板配置复制成功:', {
      templateNickname: DEFAULT_CONFIG.nickname,
      newNickname: finalConfig.nickname,
      birthDate: finalConfig.birthDate,
      overrides: Object.keys(overrides)
    });

    console.log('========== 模板配置复制完成 ==========');

    return finalConfig;

  } catch (error) {
    console.error('从模板复制配置失败:', error);
    throw error;
  }
}

/**
 * 从默认配置模板直接添加新配置（保存到存储）
 * @param {Object} overrides - 需要覆盖的字段（可选）
 * @returns {Promise<boolean>} 是否添加成功
 */
async addConfigFromTemplate(overrides = {}) {
  try {
    // 生成新配置
    const newConfig = await this.duplicateConfigFromTemplate(overrides);

    // 验证配置数据
    const validation = dataIntegrityManager.validateConfig(newConfig);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 添加到配置列表
    this.configs.push(newConfig);

    // 设置新配置为活跃配置
    this.activeConfigIndex = this.configs.length - 1;

    // 保存到存储
    await this.saveConfigsToStorage();

    // 通知监听器
    this.notifyListeners(true);

    console.log('从模板添加配置成功:', newConfig.nickname);
    return true;

  } catch (error) {
    console.error('从模板添加配置失败:', error);
    throw error;
  }
}

/**
 * 批量从模板复制配置
 * @param {number} count - 要复制的数量
 * @param {Object} overrides - 需要覆盖的字段（可选）
 * @returns {Promise<Array>} 新创建的配置列表
 */
async batchDuplicateFromTemplate(count, overrides = {}) {
  if (!this.initialized) {
    throw new Error('配置管理器未初始化');
  }

  if (count <= 0) {
    throw new Error('复制数量必须大于0');
  }

  const newConfigs = [];
  const lockKey = 'batch-duplicate-template';
  const operationId = `batch-duplicate-${Date.now()}`;

  operationLogger.log('info', 'BATCH_DUPLICATE_STARTED', {
    operationId,
    count,
    overrides: Object.keys(overrides)
  });

  return await concurrencyLock.withLock(lockKey, async () => {
    try {
      for (let i = 0; i < count; i++) {
        // 为每个配置生成唯一的昵称
        const configOverrides = {
          ...overrides,
          nickname: this.generateUniqueNickname()
        };

        const newConfig = await this.duplicateConfigFromTemplate(configOverrides);

        // 验证配置
        const validation = dataIntegrityManager.validateConfig(newConfig);
        if (!validation.valid) {
          throw new Error(`第 ${i + 1} 个配置验证失败: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        newConfigs.push(newConfig);
      }

      // 批量添加到配置列表
      this.configs.push(...newConfigs);

      // 设置最后一个新配置为活跃配置
      this.activeConfigIndex = this.configs.length - 1;

      // 保存到存储
      await this.saveConfigsToStorage();

      // 通知监听器
      this.notifyListeners(true);

      operationLogger.log('success', 'BATCH_DUPLICATE_SUCCESS', {
        operationId,
        count: newConfigs.length,
        newNicknames: newConfigs.map(c => c.nickname)
      });

      console.log(`批量从模板复制配置成功: ${newConfigs.length} 个配置`);
      return newConfigs;

    } catch (error) {
      operationLogger.log('error', 'BATCH_DUPLICATE_ERROR', {
        operationId,
        count,
        error: error.message
      });
      throw error;
    }
  }, {
    owner: `config-manager-${operationId}`,
    timeout: 120000 // 2分钟超时（批量操作可能需要更长时间）
  });
}

/**
 * 获取默认配置模板（只读，深拷贝）
 * @returns {Object} 默认配置的深拷贝
 */
getDefaultTemplate() {
  return deepCloneConfig(DEFAULT_CONFIG);
}

/**
 * 清理过期的备份和锁
 * @returns {Promise<Object>} 清理结果
 */
async cleanupMaintenance() {
  const results = {
    backupsCleaned: 0,
    logsCleaned: 0,
    locksCleaned: 0
  };

  try {
    // 清理过期的配置备份
    results.backupsCleaned = nodeRecoveryManager.cleanupOldBackups();

    // 清理过期的日志
    operationLogger.cleanExpiredLogs();
    results.logsCleaned = 1;

    // 清理过期的锁
    results.locksCleaned = concurrencyLock.cleanupExpiredLocks();

    operationLogger.log('info', 'MAINTENANCE_CLEANUP', {
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    operationLogger.log('error', 'MAINTENANCE_ERROR', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}
}

// 创建单例实例
export const enhancedUserConfigManager = new EnhancedUserConfigManager();

export default EnhancedUserConfigManager;
export { DEFAULT_CONFIG };