import React, { useState, useEffect } from 'react';
import { healthService } from '../services/healthService';
import type { BodyMetrics, HealthGoal } from '../types';

interface BodyMetricsPageProps {
  onBack?: () => void;
}

const BodyMetricsPage: React.FC<BodyMetricsPageProps> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<BodyMetrics>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    const data = healthService.getBodyMetrics(today);
    if (data) {
      setMetrics(data);
      setEditData(data);
    } else {
      const defaultData: BodyMetrics = { date: today };
      setEditData(defaultData);
    }
  };

  const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-500' };
    if (bmi < 24) return { label: '正常', color: 'text-green-500' };
    if (bmi < 28) return { label: '偏胖', color: 'text-yellow-500' };
    return { label: '肥胖', color: 'text-red-500' };
  };

  const handleSave = () => {
    const bmi = calculateBMI(editData.weight || 0, editData.height || 0);
    const data: BodyMetrics = {
      ...editData,
      date: today,
      bmi,
    } as BodyMetrics;
    
    healthService.saveBodyMetrics(data);
    setMetrics(data);
    setEditing(false);
    setSuccess('身体指标已保存');
    setTimeout(() => setSuccess(null), 2000);
  };

  const MetricCard = ({ label, value, unit, icon, color }: { label: string; value: number | undefined; unit: string; icon: string; color: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={editData[label === '体重' ? 'weight' : label === '身高' ? 'height' : label === '体脂率' ? 'bodyFat' : 'heartRate'] || ''}
            onChange={(e) => {
              const key = label === '体重' ? 'weight' : label === '身高' ? 'height' : label === '体脂率' ? 'bodyFat' : 'heartRate';
              setEditData(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));
            }}
            className="flex-1 text-lg font-bold bg-transparent outline-none text-gray-900 dark:text-white"
            placeholder="0"
          />
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value || '--'}</span>
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
      )}
    </div>
  );

  const bmi = metrics?.bmi || calculateBMI(editData.weight || 0, editData.height || 0);
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">身体指标</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="text-blue-500 text-sm font-medium"
          >
            {editing ? '保存' : '编辑'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Success message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* BMI card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <div className="text-sm opacity-80">BMI 指数</div>
            <div className="text-5xl font-black mt-2">{bmi || '--'}</div>
            <div className={`text-lg font-medium mt-2 ${bmiCategory.color === 'text-green-500' ? 'text-green-200' : 'text-white'}`}>
              {bmiCategory.label}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <span>&lt;18.5 偏瘦</span>
            <span>18.5-24 正常</span>
            <span>24-28 偏胖</span>
            <span>&gt;28 肥胖</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="体重" value={metrics?.weight} unit="kg" icon="⚖️" color="text-blue-500" />
          <MetricCard label="身高" value={metrics?.height} unit="cm" icon="📏" color="text-green-500" />
          <MetricCard label="体脂率" value={metrics?.bodyFat} unit="%" icon="📊" color="text-purple-500" />
          <MetricCard label="心率" value={metrics?.heartRate?.current || metrics?.heartRate} unit="bpm" icon="❤️" color="text-red-500" />
        </div>

        {/* Blood pressure */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🩸</span>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">血压</h3>
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editData.bloodPressure?.systolic || ''}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  bloodPressure: { systolic: parseInt(e.target.value) || 0, diastolic: prev.bloodPressure?.diastolic || 0 }
                }))}
                className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                placeholder="收缩压"
              />
              <span className="text-gray-400">/</span>
              <input
                type="number"
                value={editData.bloodPressure?.diastolic || ''}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  bloodPressure: { systolic: prev.bloodPressure?.systolic || 0, diastolic: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                placeholder="舒张压"
              />
              <span className="text-sm text-gray-400">mmHg</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-red-500">{metrics?.bloodPressure?.systolic || '--'}</span>
              <span className="text-xl text-gray-400">/</span>
              <span className="text-3xl font-bold text-blue-500">{metrics?.bloodPressure?.diastolic || '--'}</span>
              <span className="text-sm text-gray-400">mmHg</span>
            </div>
          )}
        </div>

        {/* History placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">历史趋势</h3>
          <div className="text-center text-gray-400 py-8">
            <span className="text-3xl">📈</span>
            <p className="text-sm mt-2">记录更多数据后可查看趋势</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">💡 健康提示</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• 建议每天同一时间测量体重</li>
            <li>• 正常血压范围：收缩压 90-140 mmHg，舒张压 60-90 mmHg</li>
            <li>• 成人正常心率：60-100 次/分钟</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BodyMetricsPage;