import React, { useState, useEffect } from 'react';

const DataPolicyConsent = ({ onConsent }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 检查用户是否已经同意数据使用策略
    const consentGiven = localStorage.getItem('dataPolicyConsent');
    if (!consentGiven) {
      // 稍微延迟显示弹窗，确保UI已加载
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // 保存用户同意的状态到本地存储
    localStorage.setItem('dataPolicyConsent', 'true');
    setIsVisible(false);
    // 通知父组件用户已同意
    if (onConsent) {
      onConsent();
    }
  };

  const handleDecline = () => {
    // 用户拒绝，可以在这里添加相应的处理逻辑
    alert('您需要同意数据使用策略才能使用本应用的完整功能。');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">数据使用策略</h2>
          <div className="text-gray-700 space-y-3 mb-6">
            <p>为了提供更好的服务，我们需要使用您的设备本地存储来保存和计算数据：</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>保存您的出生日期用于生物节律计算</li>
              <li>缓存数据以提高应用响应速度</li>
              <li>存储用户偏好设置</li>
              <li>所有数据仅在您的设备上处理，不会上传到任何服务器</li>
            </ul>
            <p className="text-sm text-gray-600">
              我们承诺保护您的隐私，所有数据都在您的设备本地处理，不会被收集或传输到外部服务器。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              同意
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPolicyConsent;