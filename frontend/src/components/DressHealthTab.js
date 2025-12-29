import React from 'react';
import WuxingHealth from '../pages/WuxingHealthPage';

// 穿衣养生多标签页组件 - 统一滚动流逻辑，解决移动端遮挡问题
// 现已独立为五行养生页面
const DressHealthTab = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  return (
    <WuxingHealth />
  );
};

export default DressHealthTab;