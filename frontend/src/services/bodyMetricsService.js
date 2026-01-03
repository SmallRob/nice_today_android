// 身体指标服务

// 获取身体指标状态
export const getBodyMetricsStatus = async () => {
  // 模拟获取身体指标状态
  // 在实际应用中，这里会从存储或API获取真实数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟返回一些指标状态
      const status = {
        bmi: 'normal', // normal, caution, warning
        bloodPressure: 'caution',
        heartRate: 'normal',
        oxygenSaturation: 'normal',
        waistCircumference: 'warning'
      };
      resolve(status);
    }, 300); // 模拟网络延迟
  });
};

// 获取身体指标数据
export const getBodyMetricsData = () => {
  // 从本地存储获取身体指标数据
  try {
    const stored = localStorage.getItem('bodyMetricsData');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('获取身体指标数据失败:', e);
    return {};
  }
};

// 保存身体指标数据
export const saveBodyMetricsData = (data) => {
  try {
    localStorage.setItem('bodyMetricsData', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('保存身体指标数据失败:', e);
    return false;
  }
};

// 计算BMI
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100; // 转换为米
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// 评估BMI状态
export const evaluateBMIStatus = (bmi) => {
  if (!bmi) return 'unknown';
  const bmiNum = parseFloat(bmi);
  if (bmiNum < 18.5) return 'underweight';
  if (bmiNum < 24) return 'normal';
  if (bmiNum < 28) return 'overweight';
  return 'obese';
};