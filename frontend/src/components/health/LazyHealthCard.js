import React, { useState, useEffect, useRef } from 'react';

// 懒加载健康卡片组件
const LazyHealthCard = ({
  component: Component,
  fallback: Fallback,
  loadingComponent: LoadingComponent,
  cacheKey,
  priority = 3, // 默认优先级
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const cardRef = useRef(null);

  // 从本地存储获取用户设置的缓存超时时间
  const getUserCacheTimeout = () => {
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    return savedCacheTimeout ? parseInt(savedCacheTimeout) : 10800000; // 默认3小时
  };

  // 检查缓存
  const getCachedData = () => {
    if (!cacheKey) return null;
    try {
      const cached = localStorage.getItem(`health-card-cache-${cacheKey}`);
      if (cached) {
        const { data, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();
        const currentDate = new Date().toDateString();

        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(`health-card-cache-${cacheKey}`);
          return null;
        }

        // 根据优先级设置不同的缓存有效期
        let cacheExpiry = getUserCacheTimeout(); // 使用用户设置的缓存时间
        if (priority === 1) cacheExpiry = Math.min(cacheExpiry, 15 * 60 * 1000); // 高优先级最多15分钟
        else if (priority === 2) cacheExpiry = Math.min(cacheExpiry, 30 * 60 * 1000); // 中优先级最多30分钟

        // 缓存有效期检查
        if (now - timestamp < cacheExpiry) {
          return data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(`health-card-cache-${cacheKey}`);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 设置缓存
  const setCachedData = (data) => {
    if (!cacheKey) return;
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        date: new Date().toDateString()  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(`health-card-cache-${cacheKey}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('设置缓存失败:', e);
    }
  };

  useEffect(() => {
    // 检查是否有缓存数据
    const cachedData = getCachedData();
    if (cachedData) {
      // 如果有缓存数据，直接使用
      setLoaded(true);
      setShouldRender(true);
    } else {
      // 没有缓存，根据优先级设置延迟时间
      let delay = 10; // 默认极低延迟
      if (priority === 1) delay = 0; // 高优先级瞬间启动
      else if (priority === 2) delay = 50; // 中优先级极快加载
      else delay = 100; // 低优先级较快加载

      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [cacheKey, priority]);

  // 当组件渲染后，触发加载
  useEffect(() => {
    if (shouldRender && !loaded) {
      const loadComponent = async () => {
        // 模拟加载时间，根据优先级调整
        if (priority === 1) {
          // 高优先级组件秒开
          await new Promise(resolve => setTimeout(resolve, 0));
        } else if (priority === 2) {
          // 中优先级组件极快加载
          await new Promise(resolve => setTimeout(resolve, 30));
        } else {
          // 低优先级组件快速加载
          await new Promise(resolve => setTimeout(resolve, 60));
        }
        setLoaded(true);
      };
      loadComponent();
    }
  }, [shouldRender, loaded, priority]);

  if (!shouldRender) {
    return <div className="health-card-placeholder" style={{ height: '200px' }} />;
  }

  if (loaded) {
    return <Component {...props} />;
  }

  return LoadingComponent || Fallback || (
    <div className="health-card">
      <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl text-white/50 border border-white/10 shadow-lg h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex space-x-2 justify-center mb-2">
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="w-2 h-2 bg-white/20 rounded-full"></div>
          </div>
          <p className="text-xs font-medium tracking-wider">LOADING</p>
        </div>
      </div>
    </div>
  );
};

export default LazyHealthCard;