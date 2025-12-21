import React, { useState, useEffect } from 'react';

const UpdateNotification = ({ updateInfo, onUpdateNow, onLater, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (updateInfo) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [updateInfo]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose && onClose();
    }, 300);
  };

  const handleLater = () => {
    onLater && onLater();
    handleClose();
  };

  const handleUpdateNow = () => {
    onUpdateNow && onUpdateNow();
    handleClose();
  };

  const downloadUpdate = () => {
    if (updateInfo?.updateUrl) {
      window.open(updateInfo.updateUrl, '_blank');
    }
  };

  if (!isVisible || !updateInfo) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* 背景遮罩 */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* 通知内容 */}
      <div 
        className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-all duration-300 transform ${
          isClosing ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">发现新版本</h3>
                <p className="text-blue-100 text-sm">
                  当前版本：{updateInfo.currentVersion} → 新版本：{updateInfo.serverVersion}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 更新说明按钮 */}
              {updateInfo.updateInfo?.description && (
                <button
                  onClick={() => {
                    // 显示详细更新说明
                    alert(`更新说明：\n\n${updateInfo.updateInfo.description}`);
                  }}
                  className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
                >
                  查看详情
                </button>
              )}
              
              {/* 稍后更新按钮 */}
              <button
                onClick={handleLater}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
              >
                稍后提醒
              </button>
              
              {/* 立即更新按钮 */}
              <button
                onClick={handleUpdateNow}
                className="px-4 py-2 bg-white text-blue-600 hover:bg-opacity-90 rounded text-sm font-semibold transition-colors"
              >
                立即更新
              </button>
              
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 更新特性说明 */}
          {updateInfo.updateInfo?.features && (
            <div className="mt-3 pt-3 border-t border-blue-500 border-opacity-30">
              <p className="text-blue-100 text-xs mb-1">新特性：</p>
              <ul className="text-blue-200 text-xs space-y-1">
                {updateInfo.updateInfo.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
                {updateInfo.updateInfo.features.length > 3 && (
                  <li className="text-blue-300">... 更多特性请查看详情</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;