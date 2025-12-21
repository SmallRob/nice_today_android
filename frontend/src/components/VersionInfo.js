import React from 'react';
import versionData from '../version.json';

/**
 * 统一的版本信息组件
 * 提供应用版本信息的统一管理
 */
const VersionInfo = ({
  className = "",
  showVersion = true,
  showLocalIndicator = true,
  customVersion = null
}) => {
  // 从 version.json 动态获取版本号
  const defaultVersion = `v${versionData.versionName}`;
  const version = customVersion || defaultVersion;

  return (
    <div className={`flex space-x-4 ${className}`}>
      {showVersion && (
        <span className="text-gray-500 dark:text-gray-500 text-sm">
          版本: {version}
        </span>
      )}
      {showLocalIndicator && (
        <span className="text-gray-500 dark:text-gray-500 text-sm">
          本地化计算
        </span>
      )}
    </div>
  );
};

export default VersionInfo;