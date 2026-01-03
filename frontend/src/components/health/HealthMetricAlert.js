import React from 'react';
import { evaluateMetric, metricAlertLevels } from '../../config/bodyMetricsConfig';

/**
 * 健康指标预警组件
 * 根据指标值显示相应的预警信息
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

  const getAlertColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200';
      case 'orange':
        return 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-200';
      case 'red':
        return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'normal':
        return '✅';
      case 'caution':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getAlertColor(alertConfig.color)} flex items-start`}>
      <span className="text-lg mr-2">{getAlertIcon(evaluation.level)}</span>
      <div className="flex-1">
        <div className="font-medium text-sm">{alertConfig.message}</div>
        <div className="text-xs opacity-75 mt-1">{evaluation.message}</div>
      </div>
    </div>
  );
};

export default HealthMetricAlert;