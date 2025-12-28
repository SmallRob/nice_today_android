/**
 * 生物节律计算工具
 * 基于出生日期计算体力、情绪、智力三大周期
 */

class BiorhythmCalculator {
  /**
   * 计算生物节律
   * @param {Date} birthDate 出生日期
   * @param {Date} targetDate 目标日期
   * @returns {Object} 节律数据
   */
  static calculateBiorhythm(birthDate, targetDate) {
    // 计算天数差
    const timeDiff = targetDate.getTime() - birthDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // 三大周期长度（天）
    const PHYSICAL_CYCLE = 23;
    const EMOTIONAL_CYCLE = 28;
    const INTELLECTUAL_CYCLE = 33;

    // 计算各周期相位（0-2π）
    const physicalPhase = (2 * Math.PI * daysDiff) / PHYSICAL_CYCLE;
    const emotionalPhase = (2 * Math.PI * daysDiff) / EMOTIONAL_CYCLE;
    const intellectualPhase = (2 * Math.PI * daysDiff) / INTELLECTUAL_CYCLE;

    // 计算节律值（正弦函数，范围-1到1）
    const physical = Math.sin(physicalPhase);
    const emotional = Math.sin(emotionalPhase);
    const intellectual = Math.sin(intellectualPhase);

    return {
      physical: parseFloat(physical.toFixed(4)),
      emotional: parseFloat(emotional.toFixed(4)),
      intellectual: parseFloat(intellectual.toFixed(4)),
      daysDiff,
      birthDate: birthDate.toISOString().split('T')[0],
      targetDate: targetDate.toISOString().split('T')[0]
    };
  }

  /**
   * 获取生物节律洞察
   * @param {Object} rhythmData 节律数据
   * @returns {string} 节律洞察文本
   */
  static getBiorhythmInsight(rhythmData) {
    const { physical, emotional, intellectual } = rhythmData;
    
    const insights = [];

    // 体力周期分析
    if (physical > 0.7) {
      insights.push("体力充沛，适合高强度运动和工作");
    } else if (physical > 0.3) {
      insights.push("体力良好，可以安排适度运动");
    } else if (physical > -0.3) {
      insights.push("体力平稳，注意劳逸结合");
    } else if (physical > -0.7) {
      insights.push("体力稍弱，建议多休息");
    } else {
      insights.push("体力低迷，需要充分休息");
    }

    // 情绪周期分析
    if (emotional > 0.7) {
      insights.push("情绪高涨，适合创意工作");
    } else if (emotional > 0.3) {
      insights.push("情绪稳定，心情愉快");
    } else if (emotional > -0.3) {
      insights.push("情绪平稳，保持乐观");
    } else if (emotional > -0.7) {
      insights.push("情绪稍低，注意调节");
    } else {
      insights.push("情绪低落，需要放松心情");
    }

    // 智力周期分析
    if (intellectual > 0.7) {
      insights.push("思维敏捷，适合学习思考");
    } else if (intellectual > 0.3) {
      insights.push("智力良好，可以处理复杂问题");
    } else if (intellectual > -0.3) {
      insights.push("智力平稳，适合常规工作");
    } else if (intellectual > -0.7) {
      insights.push("注意力分散，需要专注");
    } else {
      insights.push("思维迟缓，建议简单任务");
    }

    // 综合建议
    const positiveCount = [physical, emotional, intellectual].filter(v => v > 0).length;
    
    if (positiveCount === 3) {
      insights.push("今天三大周期都处于良好状态，是高效工作学习的好时机！");
    } else if (positiveCount === 2) {
      insights.push("大部分周期状态良好，可以合理安排重要事项。");
    } else if (positiveCount === 1) {
      insights.push("有一个周期状态良好，可以专注于相关领域的工作。");
    } else {
      insights.push("今天各周期都处于调整期，适合休息放松，为明天储备能量。");
    }

    return insights.join("。") + "。";
  }

  /**
   * 获取节律状态描述
   * @param {number} value 节律值
   * @returns {Object} 状态信息
   */
  static getRhythmStatus(value) {
    if (value > 0.7) return { status: '极佳', emoji: '🔥', color: 'excellent', desc: '状态极佳' };
    if (value > 0.3) return { status: '良好', emoji: '👍', color: 'good', desc: '状态良好' };
    if (value > -0.3) return { status: '一般', emoji: '➖', color: 'normal', desc: '状态平稳' };
    if (value > -0.7) return { status: '较差', emoji: '⚠️', color: 'poor', desc: '需要关注' };
    return { status: '低迷', emoji: '💤', color: 'low', desc: '需要休息' };
  }

  /**
   * 生成趋势数据
   * @param {Date} birthDate 出生日期
   * @param {number} pastDays 过去天数
   * @param {number} futureDays 未来天数
   * @returns {Array} 趋势数据
   */
  static generateTrendData(birthDate, pastDays = 7, futureDays = 7) {
    const trendData = [];
    const today = new Date();

    // 生成过去数据
    for (let i = pastDays; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const rhythm = this.calculateBiorhythm(birthDate, date);
      trendData.push({
        ...rhythm,
        isPast: true,
        dayOffset: -i
      });
    }

    // 生成今日数据
    const todayRhythm = this.calculateBiorhythm(birthDate, today);
    trendData.push({
      ...todayRhythm,
      isToday: true,
      dayOffset: 0
    });

    // 生成未来数据
    for (let i = 1; i <= futureDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const rhythm = this.calculateBiorhythm(birthDate, date);
      trendData.push({
        ...rhythm,
        isFuture: true,
        dayOffset: i
      });
    }

    return trendData;
  }

  /**
   * 获取每日提醒
   * @param {Object} rhythmData 今日节律数据
   * @returns {string} 提醒文本
   */
  static getDailyReminder(rhythmData) {
    const { physical, emotional, intellectual } = rhythmData;
    
    const reminders = [];

    // 体力提醒
    if (physical < -0.5) {
      reminders.push("今天体力较低，建议安排轻松的活动，避免过度劳累。");
    } else if (physical > 0.5) {
      reminders.push("体力充沛，可以安排运动或需要体力的工作。");
    }

    // 情绪提醒
    if (emotional < -0.5) {
      reminders.push("情绪可能有些低落，可以听听音乐或与朋友聊天来调节心情。");
    } else if (emotional > 0.5) {
      reminders.push("情绪状态很好，适合进行创意性的工作或社交活动。");
    }

    // 智力提醒
    if (intellectual < -0.5) {
      reminders.push("思维可能不够敏捷，建议处理简单任务，避免复杂决策。");
    } else if (intellectual > 0.5) {
      reminders.push("思维敏捷，适合学习新知识或解决复杂问题。");
    }

    // 如果没有特别提醒，给出一般建议
    if (reminders.length === 0) {
      reminders.push("今天各周期状态平稳，可以按计划进行日常工作。");
    }

    return reminders.join("\n");
  }
}

export default BiorhythmCalculator;