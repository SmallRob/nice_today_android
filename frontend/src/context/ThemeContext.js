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
      theme: 'light',
      lastUpdated: Date.now(),
      version: '1.0'
    };
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
  const [theme, setTheme] = useState('light');
  const [configManager] = useState(themeConfigManager);

  useEffect(() => {
    let isMounted = true;
    
    const initializeTheme = () => {
      if (!isMounted) return;
      
      // 从配置文件加载主题
      const themeConfig = configManager.getThemeConfig();
      
      // 检查系统偏好作为后备方案
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      
      // 优先使用配置文件中的主题，其次是系统偏好
      const initialTheme = themeConfig.theme || systemTheme;
      setTheme(initialTheme);
    };
    
    initializeTheme();
    
    // 监听主题配置变化
    const handleThemeConfigChange = (event) => {
      if (isMounted && event.detail && event.detail.timestamp) {
        // 重新加载主题配置
        const updatedConfig = configManager.getThemeConfig();
        setTheme(updatedConfig.theme);
        
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

  useEffect(() => {
    // 应用主题到文档
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 保存主题到配置文件
    configManager.saveThemeConfig({ theme });
    
    // 更新localStorage以保持向后兼容性
    localStorage.setItem('theme', theme);
  }, [theme, configManager]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      
      // 立即保存到配置文件
      configManager.saveThemeConfig({ theme: newTheme });
      
      return newTheme;
    });
  };

  const setThemeDirectly = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      configManager.saveThemeConfig({ theme: newTheme });
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme: setThemeDirectly,
      configManager 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};