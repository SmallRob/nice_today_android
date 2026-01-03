/**
 * 身体指标配置文件
 * 集中管理所有身体指标的正常范围、预警规则等配置信息
 */

export const bodyMetricsConfig = {
  // 生命体征指标
  vitalSigns: [
    {
      id: 'bloodPressure',
      name: '血压',
      unit: 'mmHg',
      normalRange: { min: '90/60', max: '139/89' },
      idealRange: { min: '90/60', max: '120/80' },
      criticalRange: { min: '140/90', max: null },
      description: '理想血压<120/80mmHg；正常90-139/60-89mmHg；≥140/90mmHg为高血压',
      category: 'vitalSigns',
      icon: '🫀'
    },
    {
      id: 'heartRate',
      name: '心率/脉搏',
      unit: '次/分',
      normalRange: { min: 60, max: 100 },
      idealRange: { min: 60, max: 100 },
      criticalRange: { min: 100, max: null },
      description: '静息60-100次/分；运动员可低至50-60次/分',
      category: 'vitalSigns',
      icon: '❤️'
    },
    {
      id: 'temperature',
      name: '体温',
      unit: '℃',
      normalRange: { min: 36.0, max: 37.0 },
      idealRange: { min: 36.0, max: 37.0 },
      criticalRange: { min: 38.0, max: null },
      description: '腋测36.0-37.0℃；口测36.3-37.2℃',
      category: 'vitalSigns',
      icon: '🌡️'
    },
    {
      id: 'respiratoryRate',
      name: '呼吸频率',
      unit: '次/分',
      normalRange: { min: 16, max: 20 },
      idealRange: { min: 16, max: 20 },
      criticalRange: { min: 24, max: null },
      description: '静息16-20次/分；>24过速，<12过缓',
      category: 'vitalSigns',
      icon: '💨'
    },
    {
      id: 'oxygenSaturation',
      name: '血氧饱和度',
      unit: '%',
      normalRange: { min: 95, max: 100 },
      idealRange: { min: 95, max: 100 },
      criticalRange: { min: null, max: 90 },
      description: '正常≥95%；<90%提示缺氧',
      category: 'vitalSigns',
      icon: '🩸'
    }
  ],

  // 体格与代谢指标
  bodyMetabolism: [
    {
      id: 'bmi',
      name: 'BMI',
      unit: 'kg/m²',
      normalRange: { min: 18.5, max: 23.9 },
      idealRange: { min: 18.5, max: 23.9 },
      criticalRange: { min: 28, max: null },
      description: '18.5-23.9为正常；<18.5偏瘦，24.0-27.9超重，≥28肥胖',
      category: 'bodyMetabolism',
      icon: '⚖️'
    },
    {
      id: 'waistCircumference',
      name: '腰围',
      unit: 'cm',
      normalRange: { male: { max: 90 }, female: { max: 85 } },
      idealRange: { male: { max: 85 }, female: { max: 80 } },
      criticalRange: { male: { min: 102 }, female: { min: 88 } },
      description: '男<90cm，女<85cm（中国标准）',
      category: 'bodyMetabolism',
      icon: '📏'
    },
    {
      id: 'bodyFatPercentage',
      name: '体脂率',
      unit: '%',
      normalRange: { male: { min: 15, max: 20 }, female: { min: 20, max: 25 } },
      idealRange: { male: { min: 12, max: 18 }, female: { min: 18, max: 24 } },
      criticalRange: { male: { min: 25 }, female: { min: 30 } },
      description: '男15%-20%，女20%-25%（成年人）',
      category: 'bodyMetabolism',
      icon: '📊'
    },
    {
      id: 'fastingGlucose',
      name: '空腹血糖',
      unit: 'mmol/L',
      normalRange: { min: 3.9, max: 6.1 },
      idealRange: { min: 3.9, max: 6.1 },
      criticalRange: { min: 7.0, max: null },
      description: '3.9-6.1mmol/L；≥7.0mmol/L提示糖尿病可能',
      category: 'bodyMetabolism',
      icon: '💉'
    },
    {
      id: 'hba1c',
      name: '糖化血红蛋白',
      unit: '%',
      normalRange: { min: null, max: 5.7 },
      idealRange: { min: null, max: 5.7 },
      criticalRange: { min: 6.4, max: null },
      description: '<5.7%正常；5.7%-6.4%为糖尿病前期',
      category: 'bodyMetabolism',
      icon: '🩺'
    },
    {
      id: 'cholesterol',
      name: '总胆固醇',
      unit: 'mmol/L',
      normalRange: { min: null, max: 5.2 },
      idealRange: { min: null, max: 5.2 },
      criticalRange: { min: 6.2, max: null },
      description: '<5.2mmol/L',
      category: 'bodyMetabolism',
      icon: '🧬'
    },
    {
      id: 'triglycerides',
      name: '甘油三酯',
      unit: 'mmol/L',
      normalRange: { min: null, max: 1.7 },
      idealRange: { min: null, max: 1.7 },
      criticalRange: { min: 2.3, max: null },
      description: '<1.7mmol/L',
      category: 'bodyMetabolism',
      icon: '🧬'
    },
    {
      id: 'hdl',
      name: '高密度脂蛋白(好胆固醇)',
      unit: 'mmol/L',
      normalRange: { min: 1.0, max: null },
      idealRange: { min: 1.2, max: null },
      criticalRange: { min: null, max: 1.0 },
      description: '>1.0mmol/L',
      category: 'bodyMetabolism',
      icon: '🧬'
    },
    {
      id: 'ldl',
      name: '低密度脂蛋白(坏胆固醇)',
      unit: 'mmol/L',
      normalRange: { min: null, max: 3.4 },
      idealRange: { min: null, max: 2.6 },
      criticalRange: { min: 4.1, max: null },
      description: '<3.4mmol/L',
      category: 'bodyMetabolism',
      icon: '🧬'
    }
  ],

  // 血液与生化基础指标
  bloodChemistry: [
    {
      id: 'wbc',
      name: '白细胞',
      unit: '×10^9/L',
      normalRange: { min: 4, max: 10 },
      idealRange: { min: 4, max: 10 },
      criticalRange: { min: 12, max: null },
      description: '4-10×10^9/L',
      category: 'bloodChemistry',
      icon: '🔬'
    },
    {
      id: 'hemoglobin',
      name: '血红蛋白',
      unit: 'g/L',
      normalRange: { male: { min: 120, max: 160 }, female: { min: 110, max: 150 } },
      idealRange: { male: { min: 130, max: 150 }, female: { min: 120, max: 140 } },
      criticalRange: { male: { min: 180 }, female: { min: 170 } },
      description: '男120-160g/L、女110-150g/L',
      category: 'bloodChemistry',
      icon: '🩸'
    },
    {
      id: 'platelets',
      name: '血小板',
      unit: '×10^9/L',
      normalRange: { min: 100, max: 300 },
      idealRange: { min: 150, max: 250 },
      criticalRange: { min: 450, max: null },
      description: '100-300×10^9/L',
      category: 'bloodChemistry',
      icon: '🔬'
    },
    {
      id: 'uricAcid',
      name: '血尿酸',
      unit: 'μmol/L',
      normalRange: { male: { min: 150, max: 416 }, female: { min: 89, max: 357 } },
      idealRange: { male: { min: 200, max: 360 }, female: { min: 150, max: 300 } },
      criticalRange: { male: { min: 480 }, female: { min: 420 } },
      description: '男150-416μmol/L；女89-357μmol/L；过高易致痛风',
      category: 'bloodChemistry',
      icon: '🧬'
    }
  ],

  // 器官功能关键指标
  organFunction: [
    {
      id: 'alt',
      name: '谷丙转氨酶(ALT)',
      unit: 'U/L',
      normalRange: { min: 0, max: 40 },
      idealRange: { min: 0, max: 40 },
      criticalRange: { min: 80, max: null },
      description: '0-40U/L',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'ast',
      name: '谷草转氨酶(AST)',
      unit: 'U/L',
      normalRange: { min: 0, max: 40 },
      idealRange: { min: 0, max: 40 },
      criticalRange: { min: 80, max: null },
      description: '0-40U/L',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'totalBilirubin',
      name: '总胆红素',
      unit: 'μmol/L',
      normalRange: { min: 3.4, max: 20.5 },
      idealRange: { min: 5.1, max: 17.1 },
      criticalRange: { min: 34.2, max: null },
      description: '3.4-20.5μmol/L',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'creatinine',
      name: '血肌酐',
      unit: 'μmol/L',
      normalRange: { male: { min: 53, max: 97 }, female: { min: 44, max: 80 } },
      idealRange: { male: { min: 60, max: 85 }, female: { min: 50, max: 70 } },
      criticalRange: { male: { min: 133 }, female: { min: 124 } },
      description: '男53-97μmol/L、女44-80μmol/L',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'urea',
      name: '尿素氮',
      unit: 'mmol/L',
      normalRange: { min: 2.9, max: 7.5 },
      idealRange: { min: 3.2, max: 6.0 },
      criticalRange: { min: 10.0, max: null },
      description: '2.9-7.5mmol/L',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'egfr',
      name: '肾小球滤过率',
      unit: 'ml/min/1.73m²',
      normalRange: { min: 90, max: null },
      idealRange: { min: 90, max: null },
      criticalRange: { min: null, max: 60 },
      description: '≥90ml/min/1.73m²为正常',
      category: 'organFunction',
      icon: '🧪'
    },
    {
      id: 'fev1Fvc',
      name: '肺功能(FEV1/FVC)',
      unit: '%',
      normalRange: { min: 70, max: null },
      idealRange: { min: 80, max: null },
      criticalRange: { min: null, max: 70 },
      description: '≥70%（成人）；提示气道无显著阻塞',
      category: 'organFunction',
      icon: '🫁'
    }
  ],

  // 其他重要指标
  otherIndicators: [
    {
      id: 'urineProtein',
      name: '尿蛋白',
      unit: '阴性/阳性',
      normalRange: { value: '阴性' },
      idealRange: { value: '阴性' },
      criticalRange: { value: '阳性' },
      description: '阴性',
      category: 'otherIndicators',
      icon: '💧'
    },
    {
      id: 'urineSugar',
      name: '尿糖',
      unit: '阴性/阳性',
      normalRange: { value: '阴性' },
      idealRange: { value: '阴性' },
      criticalRange: { value: '阳性' },
      description: '阴性',
      category: 'otherIndicators',
      icon: '💧'
    },
    {
      id: 'urineRbc',
      name: '尿红细胞',
      unit: '个/高倍视野',
      normalRange: { min: 0, max: 3 },
      idealRange: { min: 0, max: 2 },
      criticalRange: { min: 5, max: null },
      description: '0-3个/高倍视野',
      category: 'otherIndicators',
      icon: '💧'
    },
    {
      id: 'urineWbc',
      name: '尿白细胞',
      unit: '个/高倍视野',
      normalRange: { min: null, max: 5 },
      idealRange: { min: null, max: 3 },
      criticalRange: { min: 10, max: null },
      description: '<5个/高倍视野',
      category: 'otherIndicators',
      icon: '💧'
    },
    {
      id: 'boneDensity',
      name: '骨密度T值',
      unit: '',
      normalRange: { min: -1.0, max: null },
      idealRange: { min: 0, max: null },
      criticalRange: { min: null, max: -2.5 },
      description: 'T值≥-1.0正常；-2.5<T值<-1.0骨量减少；≤-2.5为骨质疏松',
      category: 'otherIndicators',
      icon: '🦴'
    }
  ]
};

// 合并所有指标
export const allBodyMetrics = [
  ...bodyMetricsConfig.vitalSigns,
  ...bodyMetricsConfig.bodyMetabolism,
  ...bodyMetricsConfig.bloodChemistry,
  ...bodyMetricsConfig.organFunction,
  ...bodyMetricsConfig.otherIndicators
];

// 指标预警级别配置
export const metricAlertLevels = {
  normal: {
    level: 1,
    color: 'green',
    message: '正常',
    priority: 'low'
  },
  caution: {
    level: 2,
    color: 'yellow',
    message: '注意',
    priority: 'medium'
  },
  warning: {
    level: 3,
    color: 'orange',
    message: '警告',
    priority: 'high'
  },
  danger: {
    level: 4,
    color: 'red',
    message: '危险',
    priority: 'critical'
  }
};

// BMI计算辅助函数
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100; // 转换厘米为米
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// BMI状态分类
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'underweight', label: '偏瘦', color: 'blue' };
  if (bmi >= 18.5 && bmi < 24.0) return { category: 'normal', label: '正常', color: 'green' };
  if (bmi >= 24.0 && bmi < 28.0) return { category: 'overweight', label: '超重', color: 'yellow' };
  if (bmi >= 28.0) return { category: 'obese', label: '肥胖', color: 'red' };
  return { category: 'unknown', label: '未知', color: 'gray' };
};

// 指标评估函数 - 四级评估体系：正常、轻度、中度、严重
export const evaluateMetric = (metricId, value, gender = 'male') => {
  const metric = allBodyMetrics.find(m => m.id === metricId);
  if (!metric) return null;

  // 特殊处理BMI指标 - 使用详细的分类
  if (metricId === 'bmi') {
    const category = getBMICategory(value);
    switch (category.category) {
      case 'underweight':
        return { level: 'caution', message: '体重偏轻' };
      case 'normal':
        return { level: 'normal', message: '体重正常' };
      case 'overweight':
        return { level: 'warning', message: '体重超重' };
      case 'obese':
        return { level: 'danger', message: '体重肥胖' };
      default:
        return { level: 'normal', message: '正常' };
    }
  }

  // 特殊处理性别相关的指标
  let normalRange = metric.normalRange;
  let idealRange = metric.idealRange;
  if (typeof metric.normalRange === 'object' && metric.normalRange.male && metric.normalRange.female) {
    normalRange = metric.normalRange[gender] || metric.normalRange.male;
    if (metric.idealRange && metric.idealRange.male && metric.idealRange.female) {
      idealRange = metric.idealRange[gender] || metric.idealRange.male;
    }
  }

  // 1. 检查是否在危险范围内（严重）
  if (metric.criticalRange) {
    let isCritical = false;
    if (typeof metric.criticalRange === 'object') {
      if (metric.criticalRange.min !== null && value < metric.criticalRange.min) {
        isCritical = true;
      }
      if (metric.criticalRange.max !== null && value > metric.criticalRange.max) {
        isCritical = true;
      }
    } else if (metric.criticalRange.value && value !== metric.criticalRange.value) {
      isCritical = true;
    }
    
    if (isCritical) {
      return { level: 'danger', message: '严重超标' };
    }
  }

  // 2. 检查是否超出正常范围（中度）
  let isOutOfNormal = false;
  let outOfNormalMessage = '';
  if (typeof normalRange === 'object') {
    if (normalRange.min !== null && value < normalRange.min) {
      isOutOfNormal = true;
      outOfNormalMessage = '低于正常范围';
    }
    if (normalRange.max !== null && value > normalRange.max) {
      isOutOfNormal = true;
      outOfNormalMessage = '高于正常范围';
    }
  } else if (normalRange && value !== normalRange.value) {
    isOutOfNormal = true;
    outOfNormalMessage = '不在正常范围';
  }

  if (isOutOfNormal) {
    // 计算偏离程度（如果可能）
    let deviation = 0;
    if (typeof normalRange === 'object' && normalRange.min !== null && normalRange.max !== null) {
      const rangeWidth = normalRange.max - normalRange.min;
      if (rangeWidth > 0) {
        if (value < normalRange.min) {
          deviation = (normalRange.min - value) / rangeWidth;
        } else {
          deviation = (value - normalRange.max) / rangeWidth;
        }
      }
    }
    
    // 根据偏离程度分级：轻度偏离(<0.3)、中度偏离(0.3-0.6)、重度偏离(>0.6但未到危险)
    if (deviation < 0.3) {
      return { level: 'caution', message: '轻度异常' };
    } else if (deviation < 0.6) {
      return { level: 'warning', message: '中度异常' };
    } else {
      return { level: 'warning', message: '重度异常' };
    }
  }

  // 3. 检查是否在理想范围内（正常）
  if (idealRange) {
    let isIdeal = false;
    if (typeof idealRange === 'object') {
      if ((idealRange.min === null || value >= idealRange.min) &&
          (idealRange.max === null || value <= idealRange.max)) {
        isIdeal = true;
      }
    } else if (idealRange.value && value === idealRange.value) {
      isIdeal = true;
    }
    
    if (isIdeal) {
      return { level: 'normal', message: '理想状态' };
    }
  }

  // 4. 在正常范围内但不在理想范围内（轻度）
  return { level: 'caution', message: '正常范围内' };
};

export default bodyMetricsConfig;