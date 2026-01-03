import React from 'react';
import { evaluateMetric, metricAlertLevels } from '../../config/bodyMetricsConfig';

/**
 * 健康指标预警组件 - 指示条样式
 * 根据指标值显示相应的预警信息，使用颜色渐变指示条
 */
const HealthMetricAlert = ({ metricId, value, gender = 'male', onAlertChange }) => {
  const evaluation = value !== undefined ? evaluateMetric(metricId, parseFloat(value), gender) : null;
  const alertConfig = evaluation ? metricAlertLevels[evaluation.level] : null;

  // 当评估结果变化时，触发回调
  React.useEffect(() => {
    if (onAlertChange && alertConfig) {
      onAlertChange({
        metricId,
        level: alertConfig.level,
        message: evaluation?.message || '未知',
        priority: alertConfig.priority,
        color: alertConfig.color
      });
    }
  }, [evaluation, onAlertChange, metricId, alertConfig]);

  if (!alertConfig) {
    return null;
  }

  // 获取指示条颜色类名（渐变效果）
  const getIndicatorColor = (level) => {
    switch (level) {
      case 'normal':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'caution':
        return 'bg-gradient-to-r from-yellow-300 to-amber-400';
      case 'warning':
        return 'bg-gradient-to-r from-orange-400 to-red-500';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-700';
      default:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
    }
  };

  // 获取文本颜色类名
  const getTextColor = (level) => {
    switch (level) {
      case 'normal':
        return 'text-green-700 dark:text-green-300';
      case 'caution':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'warning':
        return 'text-orange-700 dark:text-orange-300';
      case 'danger':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  // 获取状态标签文本
  const getStatusLabel = (level) => {
    switch (level) {
      case 'normal':
        return '正常';
      case 'caution':
        return '轻度';
      case 'warning':
        return '中度';
      case 'danger':
        return '严重';
      default:
        return '未知';
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {/* 指示条 */}
      <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`absolute top-0 left-0 h-full w-full ${getIndicatorColor(evaluation.level)} transition-all duration-300`} />
        {/* 分段标记（可选） */}
        <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/50" />
        <div className="absolute top-0 left-2/4 h-full w-0.5 bg-white/50" />
        <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/50" />
      </div>
      
      {/* 状态信息 */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-sm font-semibold ${getTextColor(evaluation.level)}`}>
            {getStatusLabel(evaluation.level)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
            {evaluation.message}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          健康提醒
        </div>
      </div>
    </div>
  );
};

export default HealthMetricAlert;