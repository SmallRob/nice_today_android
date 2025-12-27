import React from 'react';
import { CYCLE_PHASES } from '../types/health.types';

const HealthRecordDisplay = ({ record, date }) => {
  if (!record) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">暂无健康记录</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          点击上方"添加健康记录"按钮添加今日记录
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: CYCLE_PHASES[record.cyclePhase]?.color || '#6b7280' }}
          ></div>
          <span className="font-medium text-gray-900 dark:text-white">
            {CYCLE_PHASES[record.cyclePhase]?.name || '未知阶段'}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(record.date).toLocaleDateString('zh-CN')}
        </span>
      </div>

      {/* 情绪状态 */}
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">情绪状态</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <svg 
                key={star} 
                className={`w-5 h-5 ${star <= record.mood ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* 症状记录 */}
      {record.symptoms.length > 0 && (
        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
          <span className="font-medium text-gray-900 dark:text-white block mb-2">症状记录</span>
          <div className="flex flex-wrap gap-2">
            {record.symptoms.map((symptom, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 用药记录 */}
      {record.medication.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="font-medium text-gray-900 dark:text-white block mb-2">用药记录</span>
          <div className="flex flex-wrap gap-2">
            {record.medication.map((med, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {med}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 生理指标 */}
      <div className="grid grid-cols-2 gap-3">
        {record.temperature && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">🌡️</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">体温</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {record.temperature}°C
            </p>
          </div>
        )}
        
        {record.weight && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">⚖️</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">体重</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {record.weight}kg
            </p>
          </div>
        )}
      </div>

      {/* 备注 */}
      {record.notes && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="font-medium text-gray-900 dark:text-white block mb-2">备注</span>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {record.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthRecordDisplay;