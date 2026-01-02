import React, { useState, useEffect } from 'react';

const OnboardingModal = ({ isOpen, onClose, onComplete, theme = 'light' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "欢迎来到生命矩阵",
      content: "这是一个帮助您探索生命意义的工具。每个单元格代表生命的一个维度。",
      icon: "🌟"
    },
    {
      title: "添加能量印记",
      content: "通过添加印记来增强生命维度的能量。右键点击单元格可添加印记。",
      icon: "⚡"
    },
    {
      title: "探索维度",
      content: "点击单元格查看详细信息，了解每个生命维度的含义。",
      icon: "🔍"
    },
    {
      title: "追踪进展",
      content: "通过总分和统计信息追踪您在各个生命维度上的发展。",
      icon: "📊"
    },
    {
      title: "开始探索",
      content: "现在您已经了解基本操作，开始构建您的生命矩阵吧！",
      icon: "🚀"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{steps[currentStep].icon}</div>
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {steps[currentStep].content}
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg ${
              currentStep === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            上一步
          </button>
          
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-blue-500 dark:bg-blue-400' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></div>
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            {currentStep === steps.length - 1 ? '开始探索' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;