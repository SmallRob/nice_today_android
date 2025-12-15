import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import DressInfo from './DressInfo';
import MayaCalendar from './MayaCalendar';
import ZodiacEnergyTab from './ZodiacEnergyTab';
import { unifiedService, checkSystemHealth } from '../services/desktopService';
import { BiorhythmIcon, MayaIcon, DressIcon, IconLibrary } from './IconLibrary';
import VersionInfo from './VersionInfo';

// 生肖能量图标组件
const ZodiacIcon = (props) => <IconLibrary.Icon name="zodiac" {...props} />;

const BiorhythmDashboard = ({ appInfo = {} }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [serviceStatus, setServiceStatus] = useState({
    biorhythm: false,
    maya: false,
    dress: false,
    // zodiacEnergy状态已临时移除，但保留以便将来可能需要恢复
    // zodiacEnergy: false
  });

  // 检测服务状态
  const checkServiceStatus = async () => {
    setLoading(true);

    if (appInfo.isDesktop) {
      try {
        const healthResult = await checkSystemHealth();
        if (healthResult.success && healthResult.data) {
          setServiceStatus({
            biorhythm: healthResult.data.services?.biorhythm || false,
            maya: healthResult.data.services?.maya || false,
            dress: healthResult.data.services?.dress || false,
            // zodiacEnergy状态已临时移除，但保留以便将来可能需要恢复
            // zodiacEnergy: healthResult.data.services?.zodiacEnergy || false
          });
        }
      } catch (error) {
        console.error('服务状态检测失败:', error);
      }
    } else {
      // Web环境下的默认状态
      setServiceStatus({
        biorhythm: true,
        maya: true,
        dress: true,
        // zodiacEnergy状态已临时移除，但保留以便将来可能需要恢复
        // zodiacEnergy: true
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    checkServiceStatus();
  }, [appInfo]);

  // 标签配置 - 使用新的图标系统
  const tabs = [
    { 
      id: 'biorhythm', 
      label: '生物节律分析', 
      icon: BiorhythmIcon,
      description: '基于23天体力、28天情绪、33天智力周期，科学计算您的生物节律状态',
      color: 'blue'
    },
    { 
      id: 'maya', 
      label: '玛雅日历', 
      icon: MayaIcon,
      description: '探索玛雅历法智慧，了解每日能量变化和人生启示',
      color: 'orange'
    },
    { 
      id: 'dress', 
      label: '穿衣饮食指南', 
      icon: DressIcon,
      description: '根据五行能量推荐生活饮食与穿衣指南',
      color: 'green'
    },
    // 生肖能量指南标签已临时移除，但代码保留以便将来可能需要恢复
    // { 
    //   id: 'zodiac', 
    //   label: '生肖能量指南', 
    //   icon: ZodiacIcon,
    //   description: '结合五行与生肖的对应关系，提供全面的生活健康建议',
    //   color: 'purple'
    // }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IconLibrary.Icon name="refresh" size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">正在初始化应用服务...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mr-3">
                <IconLibrary.Icon name="star" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">生物节律生活助手</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {appInfo.isDesktop ? '桌面版 - 本地化计算服务' : 'Web版 - 功能受限'}
                </p>
              </div>
            </div>
            
            {/* 服务状态指示器 */}
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              appInfo.isDesktop && serviceStatus.biorhythm && serviceStatus.maya && serviceStatus.dress
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : appInfo.isDesktop
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {appInfo.isDesktop ? (
                serviceStatus.biorhythm && serviceStatus.maya && serviceStatus.dress ? 
                  '✅ 所有服务就绪' : '⚠️ 部分服务异常'
              ) : (
                '🌐 Web版本'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 服务状态提示 */}
      {appInfo.isDesktop && !(serviceStatus.biorhythm && serviceStatus.maya && serviceStatus.dress) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <IconLibrary.Icon name="warning" size={20} className="text-yellow-400 dark:text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">服务状态异常</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>部分计算服务可能无法正常工作：</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {!serviceStatus.biorhythm && <li>生物节律计算服务异常</li>}
                    {!serviceStatus.maya && <li>玛雅历法计算服务异常</li>}
                    {!serviceStatus.dress && <li>穿搭建议服务异常</li>}
                    {/* 生肖能量服务状态检查已临时移除，但代码保留以便将来可能需要恢复 */}
                    {/* {!serviceStatus.zodiacEnergy && <li>生肖能量计算服务异常</li>} */}
                  </ul>
                  <p className="mt-1">请尝试重启应用或检查系统环境。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <div className="flex border-b dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-50 dark:bg-${tab.color}-900 dark:bg-opacity-30 text-${tab.color}-600 dark:text-${tab.color}-400 border-b-2 border-${tab.color}-500 dark:border-${tab.color}-400`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 标签内容 */}
          <div className="p-6">
            {activeTab === 'biorhythm' && (
              <BiorhythmTab 
                serviceStatus={serviceStatus.biorhythm}
                isDesktop={appInfo.isDesktop}
                // #region agent log
                // Logging props passed to BiorhythmTab
                // #endregion
              />
            )}
            
            {activeTab === 'maya' && (
              <MayaCalendar 
                serviceStatus={serviceStatus.maya}
                isDesktop={appInfo.isDesktop}
              />
            )}
            
            {activeTab === 'dress' && (
              <DressInfo 
                serviceStatus={serviceStatus.dress}
                isDesktop={appInfo.isDesktop}
              />
            )}
            
            {/* 生肖能量标签内容已临时移除，但代码保留以便将来可能需要恢复 */}
            {/* {activeTab === 'zodiac' && (
              <ZodiacEnergyTab 
                serviceStatus={serviceStatus.zodiacEnergy}
                isDesktop={appInfo.isDesktop}
              />
            )} */}
          </div>
        </div>

        {/* 功能说明卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tabs.filter(tab => tab.id !== 'zodiac').map((tab) => (
            <div key={tab.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className={`w-12 h-12 bg-${tab.color}-100 dark:bg-${tab.color}-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-${tab.color}-600 dark:text-${tab.color}-400 mb-4`}>
                <tab.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tab.label}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {tab.description}
              </p>
            </div>
          ))}
          {/* 生肖能量说明卡片已临时移除，但代码保留以便将来可能需要恢复 */}
          {/* {tabs.filter(tab => tab.id === 'zodiac').map((tab) => (
            <div key={tab.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className={`w-12 h-12 bg-${tab.color}-100 dark:bg-${tab.color}-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-${tab.color}-600 dark:text-${tab.color}-400 mb-4`}>
                <tab.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tab.label}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {tab.description}
              </p>
            </div>
          ))} */}
        </div>

        {/* 应用优势说明 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <IconLibrary.Icon name="star" size={20} />
            </div>
            <h2 className="text-xl font-bold">应用优势</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <IconLibrary.Icon name="check-circle" size={20} className="text-green-300 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">本地化计算</h4>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  所有计算在本地完成，保护您的隐私数据，无需网络连接
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <IconLibrary.Icon name="check-circle" size={20} className="text-green-300 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">科学算法</h4>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  基于已验证的生物节律理论和玛雅历法研究
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <IconLibrary.Icon name="check-circle" size={20} className="text-green-300 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">个性化建议</h4>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  根据您的出生日期提供定制化的生活建议
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <IconLibrary.Icon name="check-circle" size={20} className="text-green-300 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">现代化界面</h4>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  采用现代化设计，支持深色模式，用户体验优秀
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400 dark:border-blue-500">
            <p className="text-blue-100 dark:text-blue-200 text-sm italic">
              注意：生物节律和玛雅历法理论仅供参考，个人体验可能因多种因素而异。
              建议结合自身实际情况合理参考，保持积极健康的生活方式。
            </p>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 生物节律生活助手. {appInfo.isDesktop ? '桌面版' : 'Web版'}
            </div>
            <div className="mt-4 md:mt-0">
              <VersionInfo customVersion={appInfo.version} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BiorhythmDashboard;