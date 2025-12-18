import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { userConfigManager } from '../utils/userConfigManager';

// 星座选项
const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// 生肖选项
const ZODIAC_ANIMAL_OPTIONS = [
  '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'
];

// 优化的加载组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

// 配置表单组件
const ConfigForm = ({ config, index, isActive, onSave, onDelete, onSetActive, isExpanded, onToggleExpand }) => {
  const [formData, setFormData] = useState({ ...config });
  const [hasChanges, setHasChanges] = useState(false);
  const formRef = useRef(null);
  
  // 检测表单是否有变化
  useEffect(() => {
    const changed = 
      formData.nickname !== config.nickname ||
      formData.birthDate !== config.birthDate ||
      formData.zodiac !== config.zodiac ||
      formData.zodiacAnimal !== config.zodiacAnimal;
    setHasChanges(changed);
    
    // 如果有变化且表单数据有效，自动保存
    if (changed && formData.nickname && formData.birthDate) {
      const timer = setTimeout(() => {
        // 自动保存配置
        userConfigManager.autoSaveConfig(formData);
        console.log('自动保存配置成功', formData);
      }, 1000); // 延迟1秒自动保存，避免频繁保存
      
      return () => clearTimeout(timer);
    }
  }, [formData, config]);
  
  // 处理表单字段变化
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // 保存配置
  const handleSave = useCallback(() => {
    // 基本验证
    if (!formData.nickname.trim()) {
      alert('请输入昵称');
      return;
    }
    
    if (!formData.birthDate) {
      alert('请选择出生日期');
      return;
    }
    
    onSave(index, formData);
  }, [formData, index, onSave]);
  
  // 重置表单
  const handleReset = useCallback(() => {
    setFormData({ ...config });
  }, [config]);
  
  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      isActive ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* 标题区域 */}
      <div 
        className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => onToggleExpand(index)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isActive && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            <h3 className="font-medium text-gray-900 dark:text-white">
              {formData.nickname || `配置 ${index + 1}`}
            </h3>
          </div>
          {hasChanges && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
              有未保存更改
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isActive && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              当前使用
            </span>
          )}
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* 表单内容 */}
      {isExpanded && (
        <div className="p-4 space-y-4" ref={formRef}>
          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              昵称
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleFieldChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="输入您的昵称"
            />
          </div>
          
          {/* 出生日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              出生日期
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleFieldChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* 星座 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              星座
            </label>
            <select
              value={formData.zodiac}
              onChange={(e) => handleFieldChange('zodiac', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">请选择星座</option>
              {ZODIAC_OPTIONS.map(zodiac => (
                <option key={zodiac} value={zodiac}>{zodiac}</option>
              ))}
            </select>
          </div>
          
          {/* 生肖 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              生肖
            </label>
            <select
              value={formData.zodiacAnimal}
              onChange={(e) => handleFieldChange('zodiacAnimal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">请选择生肖</option>
              {ZODIAC_ANIMAL_OPTIONS.map(animal => (
                <option key={animal} value={animal}>{animal}</option>
              ))}
            </select>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              保存
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              重置
            </Button>
            
            {!isActive && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSetActive(index)}
              >
                设为当前配置
              </Button>
            )}
            
            {index > 0 && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => onDelete(index)}
              >
                删除
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 主组件
const UserConfigManagerComponent = () => {
  const [configs, setConfigs] = useState([]);
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);
  
  // 初始化配置管理器 - 优化异步加载
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 异步初始化配置管理器
        await new Promise(resolve => setTimeout(resolve, 100)); // 延迟加载避免卡顿
        await userConfigManager.initialize();
        setIsInitialized(true);
        
        // 异步加载配置
        await new Promise(resolve => setTimeout(resolve, 50));
        const allConfigs = userConfigManager.getAllConfigs();
        const activeIndex = userConfigManager.getActiveConfigIndex();
        
        setConfigs(allConfigs);
        setActiveConfigIndex(activeIndex);
        
        // 默认展开当前配置
        setExpandedIndex(activeIndex);
        setLoading(false);
      } catch (error) {
        console.error('初始化用户配置失败:', error);
        setError('初始化失败: ' + error.message);
        setLoading(false);
      }
    };
    
    init();
  }, []);
  
  // 添加配置变更监听器
  useEffect(() => {
    if (!isInitialized) return;
    
    const removeListener = userConfigManager.addListener(({
      configs: updatedConfigs,
      activeConfigIndex: updatedActiveIndex
    }) => {
      setConfigs([...updatedConfigs]);
      setActiveConfigIndex(updatedActiveIndex);
    });
    
    return () => {
      removeListener();
    };
  }, [isInitialized]);
  
  // 处理配置保存
  const handleSaveConfig = useCallback((index, configData) => {
    const success = userConfigManager.updateConfig(index, configData);
    if (success) {
      // 更新本地状态
      setConfigs(prev => {
        const newConfigs = [...prev];
        newConfigs[index] = configData;
        return newConfigs;
      });
      
      // 强制重新加载所有组件，确保数据同步
      setTimeout(() => {
        userConfigManager.forceReloadAll();
      }, 100);
    } else {
      alert('保存配置失败，请重试');
    }
  }, []);
  
  // 处理添加新配置
  const handleAddConfig = useCallback(() => {
    const newConfig = {
      nickname: `用户${configs.length + 1}`,
      birthDate: '1991-01-01',
      zodiac: '摩羯座',
      zodiacAnimal: '羊'
    };
    
    const success = userConfigManager.addConfig(newConfig);
    if (success) {
      // 更新本地状态
      setConfigs(prev => [...prev, newConfig]);
      // 展开新添加的配置
      setExpandedIndex(configs.length);
    } else {
      alert('添加配置失败，请重试');
    }
  }, [configs.length]);
  
  // 处理删除配置
  const handleDeleteConfig = useCallback((index) => {
    if (configs.length <= 1) {
      alert('至少需要保留一个配置');
      return;
    }
    
    if (window.confirm('确定要删除这个配置吗？')) {
      const success = userConfigManager.removeConfig(index);
      if (success) {
        // 更新本地状态
        setConfigs(prev => prev.filter((_, i) => i !== index));
        // 调整展开索引
        setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
      } else {
        alert('删除配置失败，请重试');
      }
    }
  }, [configs.length]);
  
  // 优化处理设置活跃配置 - 异步切换避免卡顿
  const handleSetActiveConfig = useCallback(async (index) => {
    if (isSwitching) return;
    
    try {
      setIsSwitching(true);
      setError(null);
      
      // 显示切换状态
      setActiveConfigIndex(index);
      
      // 异步设置活跃配置
      await new Promise(resolve => setTimeout(resolve, 50));
      const success = userConfigManager.setActiveConfig(index);
      
      if (success) {
        // 异步强制重新加载所有组件，确保新配置生效
        setTimeout(() => {
          userConfigManager.forceReloadAll();
        }, 200);
        
        // 延迟更新状态，确保UI流畅
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      } else {
        throw new Error('设置当前配置失败');
      }
    } catch (error) {
      console.error('切换配置失败:', error);
      setError('切换配置失败: ' + error.message);
      setIsSwitching(false);
      
      // 恢复之前的状态
      const activeIndex = userConfigManager.getActiveConfigIndex();
      setActiveConfigIndex(activeIndex);
    }
  }, [isSwitching]);
  
  // 处理展开/折叠
  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? -1 : index);
  }, []);
  
  // 处理导入配置
  const handleImportConfigs = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = e.target.result;
            const success = userConfigManager.importConfigs(jsonData);
            if (success) {
              alert('导入配置成功');
            } else {
              alert('导入配置失败，请检查文件格式');
            }
          } catch (error) {
            alert('读取文件失败: ' + error.message);
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      alert('导入失败: ' + error.message);
    }
  }, []);
  
  // 处理导出配置
  const handleExportConfigs = useCallback(() => {
    try {
      const jsonData = userConfigManager.exportConfigs();
      if (!jsonData) {
        alert('导出配置失败');
        return;
      }
      
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `nice-today-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出配置失败: ' + error.message);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载配置...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{error}</p>
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
  
  return (
    <div className="space-y-4">
      <Card title="用户配置管理" className="mb-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            在这里管理您的个人信息配置，包括昵称、出生日期、星座和生肖。
            您可以创建多个配置，并随时切换使用哪个配置。
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleAddConfig}>
              添加新配置
            </Button>
            <Button variant="outline" onClick={handleImportConfigs}>
              导入配置
            </Button>
            <Button variant="outline" onClick={handleExportConfigs}>
              导出配置
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 配置列表 */}
      <div className="space-y-3">
        {configs.map((config, index) => (
          <ConfigForm
            key={index}
            config={config}
            index={index}
            isActive={index === activeConfigIndex}
            isExpanded={index === expandedIndex}
            onSave={handleSaveConfig}
            onDelete={handleDeleteConfig}
            onSetActive={handleSetActiveConfig}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
      
      {/* 当前配置信息 */}
      <Card title="当前配置信息" className="mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
          {configs[activeConfigIndex] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">昵称：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].nickname}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生日期：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].birthDate}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">星座：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiac}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">生肖：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiacAnimal}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">当前没有可用配置</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserConfigManagerComponent;