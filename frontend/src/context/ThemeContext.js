import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 主题配置文件管理
class ThemeConfigManager {
  constructor() {
    this.THEME_CONFIG_KEY = 'app_theme_config';
    this.CACHE_REFRESH_KEY = 'theme_cache_refresh';
  }

  // 获取主题配置
  getThemeConfig() {
    try {
      const config = localStorage.getItem(this.THEME_CONFIG_KEY);
      if (config) {
        return JSON.parse(config);
      }
    } catch (error) {
      console.error('读取主题配置失败:', error);
    }
    
    // 返回默认配置
    return {
      themeMode: 'system', // 改为 themeMode，支持 'light', 'dark', 'system'
      effectiveTheme: this.getEffectiveTheme('system'), // 添加有效主题字段
      lastUpdated: Date.now(),
      version: '2.0'
    };
  }
  
  // 获取有效主题（考虑系统主题）
  getEffectiveTheme(themeMode) {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode || 'light';
  }

  // 保存主题配置
  saveThemeConfig(config) {
    try {
      const fullConfig = {
        ...config,
        lastUpdated: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.THEME_CONFIG_KEY, JSON.stringify(fullConfig));
      
      // 设置缓存刷新标记
      this.setCacheRefreshFlag();
      
      return true;
    } catch (error) {
      console.error('保存主题配置失败:', error);
      return false;
    }
  }

  // 设置缓存刷新标记
  setCacheRefreshFlag() {
    try {
      localStorage.setItem(this.CACHE_REFRESH_KEY, Date.now().toString());
      
      // 触发缓存刷新事件
      window.dispatchEvent(new CustomEvent('theme-config-changed', {
        detail: { timestamp: Date.now() }
      }));
      
      return true;
    } catch (error) {
      console.error('设置缓存刷新标记失败:', error);
      return false;
    }
  }

  // 检查是否需要刷新缓存
  checkCacheRefresh() {
    try {
      const lastRefresh = localStorage.getItem(this.CACHE_REFRESH_KEY);
      if (!lastRefresh) return false;
      
      const refreshTime = parseInt(lastRefresh, 10);
      const currentTime = Date.now();
      
      // 如果最近5秒内有刷新，则返回true
      return (currentTime - refreshTime) < 5000;
    } catch (error) {
      console.error('检查缓存刷新失败:', error);
      return false;
    }
  }

  // 清除缓存刷新标记
  clearCacheRefreshFlag() {
    try {
      localStorage.removeItem(this.CACHE_REFRESH_KEY);
      return true;
    } catch (error) {
      console.error('清除缓存刷新标记失败:', error);
      return false;
    }
  }
}

// 创建主题配置管理器实例
const themeConfigManager = new ThemeConfigManager();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system'); // 改为 themeMode
  const [effectiveTheme, setEffectiveTheme] = useState('light'); // 新增有效主题状态
  const [configManager] = useState(themeConfigManager);
  const [systemThemeListener, setSystemThemeListener] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeTheme = () => {
      if (!isMounted) return;
      
      // 从配置文件加载主题
      const themeConfig = configManager.getThemeConfig();
      const savedThemeMode = themeConfig.themeMode || 'system';
      const savedEffectiveTheme = themeConfig.effectiveTheme || configManager.getEffectiveTheme(savedThemeMode);
      
      setThemeMode(savedThemeMode);
      setEffectiveTheme(savedEffectiveTheme);
    };
    
    initializeTheme();
    
    // 监听主题配置变化
    const handleThemeConfigChange = (event) => {
      if (isMounted && event.detail && event.detail.timestamp) {
        // 重新加载主题配置
        const updatedConfig = configManager.getThemeConfig();
        const newThemeMode = updatedConfig.themeMode || 'system';
        const newEffectiveTheme = updatedConfig.effectiveTheme || configManager.getEffectiveTheme(newThemeMode);
        
        setThemeMode(newThemeMode);
        setEffectiveTheme(newEffectiveTheme);
        
        // 清除缓存刷新标记
        setTimeout(() => {
          if (isMounted) {
            configManager.clearCacheRefreshFlag();
          }
        }, 1000);
      }
    };
    
    window.addEventListener('theme-config-changed', handleThemeConfigChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener('theme-config-changed', handleThemeConfigChange);
    };
  }, [configManager]);
  
  // 监听系统主题变化
  useEffect(() => {
    if (themeMode !== 'system') return;
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newSystemTheme);
      // 保存更新后的有效主题
      configManager.saveThemeConfig({ 
        themeMode, 
        effectiveTheme: newSystemTheme 
      });
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 添加监听器（兼容不同浏览器）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      setSystemThemeListener({ 
        mediaQuery, 
        removeMethod: 'addEventListener' 
      });
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleSystemThemeChange);
      setSystemThemeListener({ 
        mediaQuery, 
        removeMethod: 'addListener' 
      });
    }
    
    // 初始化时获取当前系统主题
    handleSystemThemeChange(mediaQuery);
    
    return () => {
      if (systemThemeListener) {
        const { mediaQuery, removeMethod } = systemThemeListener;
        if (removeMethod === 'addEventListener' && mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else if (removeMethod === 'addListener' && mediaQuery.removeListener) {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      }
    };
  }, [themeMode, configManager]);

  useEffect(() => {
    // 应用主题到文档
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 更新localStorage以保持向后兼容性
    localStorage.setItem('theme', effectiveTheme);
  }, [effectiveTheme]);

  const toggleTheme = () => {
    // 简单切换，保留为向后兼容
    setThemeMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      const newEffectiveTheme = newMode; // 直接使用新模式作为有效主题
      
      setEffectiveTheme(newEffectiveTheme);
      
      // 立即保存到配置文件
      configManager.saveThemeConfig({ 
        themeMode: newMode, 
        effectiveTheme: newEffectiveTheme 
      });
      
      return newMode;
    });
  };

  const setThemeModeDirectly = (newMode) => {
    if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
      const newEffectiveTheme = configManager.getEffectiveTheme(newMode);
      
      setThemeMode(newMode);
      setEffectiveTheme(newEffectiveTheme);
      
      // 保存到配置文件
      configManager.saveThemeConfig({ 
        themeMode: newMode, 
        effectiveTheme: newEffectiveTheme 
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: effectiveTheme, // 保持向后兼容，返回有效主题
      themeMode, // 新增，返回用户选择的主题模式
      effectiveTheme, // 新增，返回实际应用的主题
      toggleTheme, 
      setTheme: setThemeModeDirectly, // 修改为设置主题模式
      configManager 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};