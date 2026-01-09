import React, { useState, useEffect, useRef } from 'react';
import mobileScreenOptimization from '../../utils/mobileScreenOptimization.js';
import './SimpleEmoHealthCard.css';

// 情绪与健康建议数据
const emoHealthTips = [
  {
    id: 1,
    category: '自我觉察',
    title: '情绪觉察练习',
    content: '睡前花1-2分钟回答三个问题：今天我最强烈的情绪是什么？是什么事触发了它？我做了什么来应对？效果如何？坚持两周，你会发现自己对情绪的"识别率"和"分辨力"明显提升。',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 2,
    category: '情绪调节',
    title: '情绪调节工具箱',
    content: '给自己设计一个"小工具箱"，提前想好几件"成本很低、随时能用"的调节方式：深呼吸10次、喝一杯温水、出门快走5-10分钟、做20-30个开合跳或拉伸。',
    color: 'from-blue-500 to-teal-600'
  },
  {
    id: 3,
    category: '心理调节',
    title: '心理调节策略',
    content: '当情绪上头时，优先从工具箱里选一件来做，而不是马上点外卖/开酒/刷短视频。听一首让你平静或开心的歌，写3行"情绪日记"，对自己说一句安慰的话（像对待好朋友那样）。',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 4,
    category: '社交支持',
    title: '寻求社交支持',
    content: '发信息给一个"说话有用"的人，简单吐槽一句，不求对方解决，只求"被听到"。良好的人际关系是健康的"保护伞"，压力恢复更快、免疫更好、寿命更长。',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 5,
    category: '微习惯',
    title: '情绪与健康微习惯',
    content: '不要一次性追求"养生大招"，而是把健康行为"挂"在日常流程上：刷完牙→做5个拉伸或深蹲；换下睡衣前，先把第二天的运动服摆好；工作每隔1小时，起身走2分钟。',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 6,
    category: '情绪命名',
    title: '精准情绪命名',
    content: '尝试更细致地命名情绪："我不是只是生气，我是感到：被忽视/委屈/不公平/担心/无助。"当你能更准确命名情绪，大脑的前额叶会更容易介入，而不是被杏仁核（警报中心）完全接管。',
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 7,
    category: '压力管理',
    title: '压力缓冲策略',
    content: '面对压力时，把它拆解成可执行的小任务，主动寻求社会支持（找人帮忙、沟通预期），在过程中安排小休息和调节（呼吸、散步、听歌）。这样睡眠更稳，长期看慢性病风险也更低。',
    color: 'from-cyan-500 to-sky-600'
  },
  {
    id: 8,
    category: '健康行为',
    title: '避免情绪化行为',
    content: '情商高的人，"不开心时不一定要吃火锅喝大酒"，而是能用更健康的方式去调节情绪，比如去运动、找人倾诉、做点让自己有成就感的事。',
    color: 'from-fuchsia-500 to-rose-600'
  }
];

const SimpleEmoHealthCard = () => {
  const [currentTip, setCurrentTip] = useState(emoHealthTips[0]);
  const [fade, setFade] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);

  // 随机获取一个新的情绪健康建议
  const getRandomTip = () => {
    setFade(true);
    setTimeout(() => {
      let newTip;
      do {
        newTip = emoHealthTips[Math.floor(Math.random() * emoHealthTips.length)];
      } while (newTip.id === currentTip.id); // 确保不重复显示当前建议
      
      setCurrentTip(newTip);
      setFade(false);
    }, 150);
  };

  // 组件加载时随机选择一个建议
  useEffect(() => {
    const initialTip = emoHealthTips[Math.floor(Math.random() * emoHealthTips.length)];
    setCurrentTip(initialTip);
    
    // 检测是否为移动设备
    const checkMobile = () => {
      const mobile = mobileScreenOptimization.getScreenType() === 'mobile';
      setIsMobile(mobile);
      return mobile;
    };
    
    const isMobileDevice = checkMobile();
    
    // 添加移动优化监听器
    mobileScreenOptimization.addMobileOptimizationListener();
    
    // 优化触摸目标
    if (isMobileDevice && buttonRef.current) {
      mobileScreenOptimization.optimizeTouchTarget(buttonRef.current, true);
    }
    
    // 优化卡片布局
    if (isMobileDevice && cardRef.current) {
      cardRef.current.classList.add('mobile-optimized', 'touch-target');
      mobileScreenOptimization.optimizeLayoutForMobile(cardRef.current);
    }
    
    // 清理函数
    return () => {
      mobileScreenOptimization.removeMobileOptimizationListener();
    };
  }, []);

  return (
    <div className="health-card simple-emo-health-card mobile-container touch-feedback" ref={cardRef}>
      <div className={`bg-gradient-to-br ${currentTip.color} p-4 rounded-2xl shadow-lg h-full flex flex-col ${isMobile ? 'mobile-card' : ''}`}>
        <div className="flex justify-between items-start mb-4 mobile-container">
          <div className="flex items-center flex-no-shrink-mobile min-w-0">
            <div className="bg-white/20 rounded-full p-2 mr-3 mobile-icon-button flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mobile-small-image" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'mobile-medium-text' : 'text-lg'} font-bold text-white no-wrap-mobile flex-shrink min-w-0`}>{currentTip.category}</h3>
          </div>
          <button 
            ref={buttonRef}
            onClick={getRandomTip}
            className="bg-white/40 hover:bg-white/50 rounded-full p-2 transition-all duration-300 mobile-icon-button touch-target flex-shrink-0 border border-white/50 shadow-xl backdrop-blur-md hover:shadow-2xl hover:scale-110"
            aria-label="换一换"
            style={{ 
              position: 'relative',
              zIndex: 10,
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mobile-small-image text-white drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <h4 className={`${isMobile ? 'mobile-large-text' : 'text-xl'} font-bold text-white mb-4 leading-tight`}>{currentTip.title}</h4>
        
        <div className={`flex-1 transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}>
          <p className={`${isMobile ? 'mobile-optimized' : 'text-sm'} text-white/95 leading-relaxed bg-white/10 rounded-xl p-3 backdrop-blur-sm`}>{currentTip.content}</p>
        </div>
        
        <div className="pt-3 flex items-center text-xs text-white/80 mobile-small-text mt-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 mobile-small-image flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="no-wrap-mobile">情绪与健康每日建议</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmoHealthCard;