/**
 * Chart.js 统一配置文件
 * 避免重复注册 Chart.js 组件，防止初始化错误
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// 全局注册标志
let isChartRegistered = false;

// 安全的注册函数
export const registerChartComponents = () => {
  if (isChartRegistered) {
    return true;
  }

  try {
    // 注册基础组件
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      Filler,
      annotationPlugin
    );

    isChartRegistered = true;
    console.log('Chart.js 组件注册成功');
    return true;
  } catch (error) {
    console.error('Chart.js 组件注册失败:', error);
    return false;
  }
};

// 延迟注册，在首次使用时注册
export const ensureChartRegistered = () => {
  if (!isChartRegistered) {
    registerChartComponents();
  }
  return isChartRegistered;
};

// 导出 Chart.js
export { ChartJS };
export default ChartJS;
