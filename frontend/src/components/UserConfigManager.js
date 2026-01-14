import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserConfig } from '../contexts/UserConfigContext';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import { DEFAULT_REGION } from '../data/ChinaLocationData';
import { getShichenSimple, normalizeShichen } from '../utils/astronomy';
import ConfigEditModal from './ConfigEditModal';
import NameScoringModal from './NameScoringModal';
import { getMeaning } from '../utils/nameScoring';
import './user-config-manager/private-styles.css'; // 私有样式，适配9:16屏幕

// 性别选项
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'secret', label: '保密' }
];

// 配置列表项组件
const ConfigForm = ({ config, index, isActive, isExpanded, onToggleExpand, onEdit, onDelete, onSetActive, onScoreName }) => {
  // 检查是否是系统默认配置
  const isSystemDefault = config?.isSystemDefault === true;

  return (
    <div className={`config-form-wrapper ${isActive ? 'is-active' : isSystemDefault ? 'opacity-60' : ''}`}>
      {/* 标题区域 */}
      <div
        className={`config-form-header ${isSystemDefault ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => !isSystemDefault && onToggleExpand && onToggleExpand()}
      >
        <div className="config-form-title-section overflow-hidden">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            {isActive && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
            )}
            {isSystemDefault && (
              <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] rounded-full whitespace-nowrap flex-shrink-0">
                <span>系统默认</span>
              </span>
            )}
            <h3 className="config-form-title text-sm max-w-[6rem] break-words">
              {config?.nickname || `配置 ${index + 1}`}
            </h3>
            {config.realName && (
              <div className="flex items-center ml-1 space-x-1 overflow-hidden">
                <span className="text-gray-500 text-xs flex-shrink-0">|</span>
                <span className="text-xs font-medium text-gray-700 dark:text-white truncate max-w-[3em] break-words">{config.realName}</span>
                {config?.nameScore && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold whitespace-nowrap flex-shrink-0 ${
                    config.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    config.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    config.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    config.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {config.nameScore.totalScore}分
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          {isActive && (
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-[10px] rounded-full whitespace-nowrap">
              使用中
            </span>
          )}
          {!isSystemDefault && (
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* 配置信息（展开时显示） */}
      {isExpanded && (
        <div className="config-form-content">
          <div className="config-form-grid">
            <div className="config-form-detail flex flex-col sm:flex-row">
              <span className="config-form-label text-gray-500 dark:text-white flex-shrink-0 w-[45%] sm:w-auto">昵称：</span>
              <span className="config-form-value text-gray-900 dark:text-white font-medium break-words sm:break-normal">{config?.nickname || '-'}</span>
            </div>
            <div className="config-form-detail flex flex-col sm:flex-row">
              <span className="config-form-label text-gray-500 dark:text-white flex-shrink-0 w-[45%] sm:w-auto">姓名：</span>
              <span className="config-form-value text-gray-900 dark:text-white font-medium break-words sm:break-normal">{config.realName || '-'}</span>
            </div>
          </div>

          {/* 姓名评分结果展示 */}
          {config.nameScore && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 dark:text-white text-sm">姓名评分：</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${
                    config.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    config.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    config.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    config.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {config.nameScore.totalScore}分
                  </span>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>天格: {config.nameScore.tian}分 {getMeaning(config.nameScore.tian).text}</div>
                    <div>人格: {config.nameScore.ren}分 {getMeaning(config.nameScore.ren).text}</div>
                    <div>地格: {config.nameScore.di}分 {getMeaning(config.nameScore.di).text}</div>
                    <div>外格: {config.nameScore.wai}分 {getMeaning(config.nameScore.wai).text}</div>
                    <div>总格: {config.nameScore.zong}分 {getMeaning(config.nameScore.zong).text}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 姓名评分入口 */}
          {config.realName && /[一-龥]/.test(config.realName) ? (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 dark:text-white text-sm">操作：</span>
                </div>
                <button
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={() => onScoreName && onScoreName(index)}
                >
                  {config.nameScore ? '重新评分' : '评分'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-white text-sm">操作：</span>
                <button
                  className="ml-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={() => onEdit && onEdit(index)}
                >
                  填写姓名并评分
                </button>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="config-form-actions">
            {!isActive && !isSystemDefault && (
              <button
                className="btn btn-outline w-full py-2 text-sm"
                onClick={() => onSetActive(index)}
              >
                设为默认
              </button>
            )}
            {onEdit && !isSystemDefault && (
              <button
                className="btn btn-primary w-full py-2 text-sm"
                onClick={() => onEdit(index)}
              >
                编辑
              </button>
            )}
            {onEdit && isSystemDefault && (
              <button
                className="btn btn-outline w-full py-2 text-sm opacity-50 cursor-not-allowed"
                disabled
              >
                编辑（系统默认）
              </button>
            )}
            {!isSystemDefault && (
              <button
                className="btn btn-danger w-full py-2 text-sm"
                onClick={() => onDelete(index)}
              >
                删除
              </button>
            )}
            {isSystemDefault && (
              <button
                className="btn btn-outline w-full py-2 text-sm opacity-50 cursor-not-allowed"
                disabled
              >
                删除（系统默认）
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserConfigManager = () => {
  // 从全局配置上下文获取数据
  const {
    configs,
    currentConfig,
    loading: contextLoading,
    error: contextError,
  } = useUserConfig();

  // 本地状态
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [message, setMessage] = useState(null); // 用于显示提示信息
  const [isTempScoringOpen, setIsTempScoringOpen] = useState(false); // 临时评分弹窗状态
  const [tempScoringConfigIndex, setTempScoringConfigIndex] = useState(null); // 临时评分使用的配置索引
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 编辑弹窗状态
  const [editingConfigIndex, setEditingConfigIndex] = useState(null); // 正在编辑的配置索引
  // 用户信息折叠状态
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(true);

  // 显示提示信息
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    // 根据消息类型和长度调整显示时间
    const displayTime = type === 'error' ? 8000 : 3000; // 错误消息显示8秒，其他消息3秒
    setTimeout(() => {
      setMessage(null);
    }, displayTime);
  }, []);

  // 当编辑模态框打开且是新建配置时，显示提示信息
  useEffect(() => {
    if (isEditModalOpen && editingConfigIndex < 0) { // 新建配置
      setTimeout(() => {
        showMessage('请填写配置信息', 'info');
      }, 100);
    }
  }, [isEditModalOpen, editingConfigIndex, showMessage]);

  // 处理添加新配置
  const handleAddConfig = useCallback(() => {
    setEditingConfigIndex(-1); // 使用特殊标记 -1 表示新建
    setIsEditModalOpen(true);
  }, []); // 移除showMessage依赖，避免不必要的重渲染

  // 处理删除配置
  const handleDeleteConfig = useCallback(async (index) => {
    if (configs.length <= 1) {
      showMessage('至少需要保留一个配置', 'error');
      return;
    }

    // 使用自定义确认对话框替代window.confirm
    if (window.confirm('确定要删除这个配置吗？')) {
      try {
        // 从存储中移除配置
        await enhancedUserConfigManager.removeConfig(index);
        showMessage('删除配置成功', 'success');
      } catch (error) {
        console.error('删除配置失败:', error);
        showMessage(`删除配置失败: ${error.message}`, 'error');
      }
    }
  }, [configs.length, showMessage]);

  // 处理编辑配置
  const handleEditConfig = useCallback((index) => {
    setEditingConfigIndex(index);
    setIsEditModalOpen(true);
  }, []);

  // 处理姓名评分
  const handleScoreName = useCallback((index) => {
    setTempScoringConfigIndex(index);
    setIsTempScoringOpen(true);
  }, []);

  // 处理设置活跃配置
  const handleSetActiveConfig = useCallback(async (index) => {
    try {
      // 调用管理器方法
      const success = await enhancedUserConfigManager.setActiveConfig(index);

      if (!success) {
        throw new Error('配置管理器返回失败');
      }

      // 更新本地状态
      setActiveConfigIndex(index);
      setExpandedIndex(index);
      console.log('设置活跃配置成功，索引:', index);
    } catch (error) {
      console.error('切换配置失败:', error);
      showMessage('切换配置失败: ' + (error.message || '未知错误'), 'error');
    }
  }, [showMessage]);

  // 处理展开/折叠
  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? -1 : index);
  }, []);

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white">正在加载配置...</p>
        </div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{contextError}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  // 用户信息卡片组件
  const UserInfoCard = ({ config }) => {
    if (!config) return null;

    // 获取显示姓名（优先使用真实姓名，否则使用昵称或"匿名者"）
    const displayName = config?.realName || config?.nickname || '匿名者';
    const nickName = config?.nickname || '未设置昵称';

    // 获取姓名首字用于头像
    const avatarText = displayName ? displayName.charAt(0) : '?';

    // 评分等级
    const getScoreLevel = (score) => {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'fair';
      return 'poor';
    };

    const scoreLevel = config.nameScore ? getScoreLevel(config.nameScore.totalScore) : null;

    // 格式化地点
    const formatLocation = (loc) => {
      if (!loc) return '未设置';
      const parts = [loc.province, loc.city, loc.district].filter(Boolean);
      if (parts.length === 0) return '未设置';
      return parts.join(' ') + (loc.lng && loc.lat ?
        ` (经度: ${parseFloat(loc.lng).toFixed(2)}, 纬度: ${parseFloat(loc.lat).toFixed(2)})` : '');
    };

    return (
      <div className="user-info-card">
        {/* 装饰性顶部条 */}
        <div className="decorative-bar"></div>

        {/* 用户头部信息 */}
        <div className="user-header">
          {/* 头像 */}
          <div className="default-avatar">
            <span className="avatar-text">{avatarText}</span>
          </div>

          {/* 用户名称区域 */}
          <div className="user-names">
            {/* 姓名行 */}
            <div className="username-row">
              <h3 className="username">{displayName}</h3>
              {/* 评分徽章 */}
              {config.nameScore && (
                <span className={`score-badge score-${scoreLevel}`}>
                  {config.nameScore.totalScore}分
                </span>
              )}
            </div>

            {/* 昵称标签 */}
            <p className="user-tag">@{nickName || '未设置'}</p>
          </div>
        </div>

        {/* 用户详情区域 */}
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">出生日期</span>
            <span className="detail-value birthdate">{config.birthDate || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">出生时间</span>
            <span className="detail-value birthtime">
              {config.birthTime || '12:30'}
              <span className="text-xs text-gray-500 ml-2">
                ({normalizeShichen(config.shichen || getShichenSimple(config.birthTime || '12:30'))})
              </span>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">性别</span>
            <span className="detail-value gender">
              {GENDER_OPTIONS.find(opt => opt.value === config.gender)?.label || '保密'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">星座</span>
            <span className="detail-value zodiac">{config.zodiac || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">生肖</span>
            <span className="detail-value zodiac">{config.zodiacAnimal || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">MBTI类型</span>
            <span className="detail-value mbti">{config.mbti || '未设置'}</span>
          </div>

          <div className="detail-row" style={{ display: 'block' }}>
            <span className="detail-value location block w-full truncate text-xs sm:text-sm opacity-80 break-words" title={formatLocation(config.birthLocation)}>
              📍 {formatLocation(config.birthLocation)}
            </span>
          </div>

          {/* 八字命盘展示 - 恢复并在数据存在时显示 */}
          {config.bazi && config.bazi.year && (
            <div className="bazi-grid-container">
              <div className="bazi-header-row">
                <span className="bazi-section-title">八字命盘</span>
              </div>
              <div className="bazi-pillars-grid">
                {/* 年柱 */}
                <div className="bazi-pillar">
                  <span className="pillar-label">年柱</span>
                  <span className="pillar-text">{config.bazi.year}</span>
                  <span className="pillar-sub">{config.bazi.wuxing?.year || ''}</span>
                  <span className="pillar-nayin">{config.bazi.nayin?.year || ''}</span>
                </div>
                {/* 月柱 */}
                <div className="bazi-pillar">
                  <span className="pillar-label">月柱</span>
                  <span className="pillar-text">{config.bazi.month}</span>
                  <span className="pillar-sub">{config.bazi.wuxing?.month || ''}</span>
                  <span className="pillar-nayin">{config.bazi.nayin?.month || ''}</span>
                </div>
                {/* 日柱 */}
                <div className="bazi-pillar">
                  <span className="pillar-label">日柱</span>
                  <span className="pillar-text">{config.bazi.day}</span>
                  <span className="pillar-sub">{config.bazi.wuxing?.day || ''}</span>
                  <span className="pillar-nayin">{config.bazi.nayin?.day || ''}</span>
                </div>
                {/* 时柱 */}
                <div className="bazi-pillar">
                  <span className="pillar-label">时柱</span>
                  <span className="pillar-text">{config.bazi.hour}</span>
                  <span className="pillar-sub">{config.bazi.wuxing?.hour || ''}</span>
                  <span className="pillar-nayin">{config.bazi.nayin?.hour || ''}</span>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮组 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-700/30">
            {/* 姓名评分按钮 */}
            {((!config.realName) || (config.realName && /[一-龥]/.test(config.realName))) && (
              <button
                className="score-btn w-full flex items-center justify-center py-2 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
                onClick={() => {
                  setTempScoringConfigIndex(activeConfigIndex);
                  setIsTempScoringOpen(true);
                }}
              >
                {config.nameScore ? '🔄 重新评分' : '✏️ 姓名评分'}
              </button>
            )}

            {/* 清理缓存按钮 */}
            <button
              className="score-btn w-full flex items-center justify-center py-2 text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
              onClick={() => {
                if (window.confirm('确定要清理当前用户的缓存吗？这将清除八字、星座特质等缓存数据，下次使用时会重新计算。')) {
                  const success = enhancedUserConfigManager.clearBaziCache(config.nickname);
                  if (success) {
                    showMessage('✅ 缓存清理成功', 'success');
                  } else {
                    showMessage('❌ 缓存清理失败', 'error');
                  }
                }
              }}
            >
              🗑️ 清理缓存
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-config-manager-wrapper space-y-4">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900 border-l-4 border-red-400' 
            : message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900 border-l-4 border-green-400' 
              : 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400'
        }`}>
          <p className={`${
            message.type === 'error' 
              ? 'text-red-700 dark:text-red-300' 
              : message.type === 'success' 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-blue-700 dark:text-blue-300'
          } whitespace-pre-line`}>
            {message.text}
          </p>
        </div>
      )}
      
      {/* 用户信息 - 使用优化的卡片样式 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">用户信息</h2>
          <button
            onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isUserInfoExpanded ? "收起" : "展开"}
          >
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-white transition-transform duration-200 ${isUserInfoExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className={`card-content ${!isUserInfoExpanded ? 'hidden' : ''}`}>
          {configs[activeConfigIndex] ? (
            <UserInfoCard config={configs[activeConfigIndex]} />
          ) : (
            <p className="text-gray-500 dark:text-white text-center py-4">当前没有可用配置</p>
          )}
        </div>
      </div>

      {/* 配置管理卡片 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">配置管理</h2>
        </div>
        <div className="card-content space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-blue-400">🎯 配置管理</span>
              管理您的个人信息配置，您可以创建多个配置，并随时切换使用哪个配置。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <button
              className="btn btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-3"
              onClick={handleAddConfig}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">添加新配置</span>
            </button>

            <button
              className="btn btn-outline flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-3 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
              onClick={() => {
                // 为他人评分时，不使用配置索引
                setTempScoringConfigIndex(null);
                setIsTempScoringOpen(true);
              }}
            >
              <span className="text-base sm:text-lg flex-shrink-0">💯</span>
              <span className="text-xs sm:text-sm whitespace-nowrap">为他人评分</span>
            </button>
          </div>
        </div>
      </div>

      {/* 临时评分弹窗 */}
      {isTempScoringOpen && (
        <NameScoringModal
          isOpen={isTempScoringOpen}
          onClose={() => {
            setIsTempScoringOpen(false);
            setTempScoringConfigIndex(null);
          }}
          name={configs[tempScoringConfigIndex]?.realName || ''}
          isPersonal={tempScoringConfigIndex !== null}
          onSaveScore={async (score, inputName) => {
            // 保存评分到配置（仅个人评分）
            if (tempScoringConfigIndex !== null && score) {
              const totalScore = score.totalScore || (score.tian + score.ren + score.di + score.wai + score.zong); // 如果没有总分，计算总分
              const updateData = { nameScore: { ...score, totalScore } };

              // 如果用户输入了姓名且配置中没有姓名，则保存姓名
              if (inputName && inputName.trim() && /[一-龥]/.test(inputName.trim())) {
                const config = configs[tempScoringConfigIndex];
                if (!config.realName) {
                  updateData.realName = inputName.trim();
                  console.log('保存姓名到配置:', updateData.realName);
                }
              }

              try {
                // 更新配置
                await enhancedUserConfigManager.updateConfigWithNodeUpdate(tempScoringConfigIndex, updateData);
                console.log('姓名评分已保存到配置索引:', tempScoringConfigIndex);
                
                // 显示成功消息
                showMessage('✅ 姓名评分保存成功', 'success');
                
                // 强制刷新配置列表以更新评分显示
                setTimeout(() => {
                  setExpandedIndex(prev => prev === tempScoringConfigIndex ? -1 : tempScoringConfigIndex);
                  setTimeout(() => {
                    setExpandedIndex(tempScoringConfigIndex);
                  }, 100);
                }, 300);
              } catch (error) {
                console.error('保存姓名评分失败:', error);
                showMessage('❌ 保存评分失败: ' + error.message, 'error');
              }
            }
            // 临时为他人评分时不保存
          }}
          showMessage={showMessage}
        />
      )}

      {/* 配置编辑弹窗 */}
      {isEditModalOpen && (
        <ConfigEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingConfigIndex(null);
          }}
          config={editingConfigIndex >= 0 ? configs[editingConfigIndex] : {}}
          index={editingConfigIndex}
          isNew={editingConfigIndex < 0}
          onSave={async (index, configData) => {
            try {
              // 保存配置
              if (index < 0) {
                // 新建配置
                await enhancedUserConfigManager.addBasicConfig(configData);
              } else {
                // 更新现有配置
                await enhancedUserConfigManager.updateConfigWithNodeUpdate(index, configData);
              }
              showMessage('✅ 配置保存成功', 'success');
              return true;
            } catch (error) {
              console.error('保存配置失败:', error);
              showMessage('❌ 保存配置失败: ' + error.message, 'error');
              throw error;
            }
          }}
          showMessage={showMessage}
        />
      )}

      {/* 配置列表 */}
      <div className="space-y-3">
        {configs && Array.isArray(configs) && configs.length > 0 ? configs.map((config, index) => (
          <ConfigForm
            key={index}
            config={config}
            index={index}
            isActive={index === activeConfigIndex}
            isExpanded={expandedIndex === index}
            onToggleExpand={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
            onDelete={handleDeleteConfig}
            onSetActive={handleSetActiveConfig}
            onEdit={handleEditConfig}
            onScoreName={handleScoreName}
          />
        )) : (
          <div className="text-center py-8 text-gray-500 dark:text-white">
            <p>暂无配置，请添加新配置</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConfigManager;