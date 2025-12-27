import React from 'react';

const MenstrualKnowledgeCard = () => {
  // 经期知识数据
  const knowledgeData = [
    {
      title: "经期 basics",
      content: "月经是女性生殖系统正常的生理现象，通常每21-35天循环一次，持续3-7天。",
      icon: "🌸",
      color: "pink",
      borderColor: "border-pink-200",
      darkBorderColor: "dark:border-pink-700",
      bgColor: "bg-pink-50",
      darkBgColor: "dark:bg-pink-900/20"
    },
    {
      title: "周期阶段",
      content: "月经周期分为四个阶段：月经期、卵泡期、排卵期和黄体期，每个阶段有不同的生理特点。",
      icon: "🔄",
      color: "purple",
      borderColor: "border-purple-200",
      darkBorderColor: "dark:border-purple-700",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-900/20"
    },
    {
      title: "健康饮食",
      content: "经期应多摄入富含铁质的食物，如红肉、菠菜等，避免生冷食物。",
      icon: "🍎",
      color: "red",
      borderColor: "border-red-200",
      darkBorderColor: "dark:border-red-700",
      bgColor: "bg-red-50",
      darkBgColor: "dark:bg-red-900/20"
    },
    {
      title: "适度运动",
      content: "经期适度运动有助于缓解不适，推荐瑜伽、散步等轻柔运动。",
      icon: "🏃‍♀️",
      color: "green",
      borderColor: "border-green-200",
      darkBorderColor: "dark:border-green-700",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-900/20"
    },
    {
      title: "情绪管理",
      content: "经前期可能出现情绪波动，保持充足睡眠和放松心情很重要。",
      icon: "😌",
      color: "blue",
      borderColor: "border-blue-200",
      darkBorderColor: "dark:border-blue-700",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900/20"
    },
    {
      title: "异常信号",
      content: "如果出现严重痛经、周期紊乱等症状，应及时就医咨询专业医生。",
      icon: "⚠️",
      color: "yellow",
      borderColor: "border-yellow-200",
      darkBorderColor: "dark:border-yellow-700",
      bgColor: "bg-yellow-50",
      darkBgColor: "dark:bg-yellow-900/20"
    }
  ];

  // 科学生活指南数据
  const guideData = [
    {
      title: "营养补充",
      tips: [
        "每天摄入足够的铁质，预防贫血",
        "增加维生素B6和钙质摄入",
        "适量补充镁元素，有助缓解痉挛"
      ],
      icon: "💊"
    },
    {
      title: "生活习惯",
      tips: [
        "保持规律作息，避免熬夜",
        "注意保暖，特别是腰腹部",
        "养成记录月经周期的习惯"
      ],
      icon: "🛌"
    },
    {
      title: "心理调节",
      tips: [
        "学会释放压力，保持心情愉悦",
        "培养兴趣爱好，转移注意力",
        "与亲友分享感受，获得情感支持"
      ],
      icon: "🧠"
    }
  ];

  return (
    <div className="space-y-6">
      {/* 经期知识卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
          经期健康知识
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {knowledgeData.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-xl border ${item.borderColor} ${item.darkBorderColor} ${item.bgColor} ${item.darkBgColor} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{item.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 科学生活指南 */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-pink-200 dark:border-pink-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          科学生活指南
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guideData.map((guide, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 bg-opacity-70 rounded-xl p-4 shadow-sm border border-pink-100 dark:border-pink-800"
            >
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">{guide.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{guide.title}</span>
              </div>
              <ul className="space-y-2">
                {guide.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 专家建议 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          妇科专家建议
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-gray-700 dark:text-gray-300 italic">
              "规律的月经是女性生殖健康的晴雨表。建议女性朋友们养成记录月经周期的习惯，
              一旦发现异常应及时就医。经期保持良好的生活习惯，不仅能缓解不适，
              更有助于维护长远的生殖健康。"
            </p>
            <p className="text-right text-sm mt-2 text-blue-600 dark:text-blue-400">—— 李医生 妇科主任医师</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-600 p-4 rounded-r-lg">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>温馨提示：</strong>
              本应用提供的健康建议仅供参考，不能替代专业医疗诊断。
              如有严重不适或疑问，请及时咨询医生。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenstrualKnowledgeCard;