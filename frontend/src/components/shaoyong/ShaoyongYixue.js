import { useState, useEffect } from 'react';
import styles from './ShaoyongYixue.module.css';

const ShaoyongYixue = () => {
  // 使用系统主题设置
  const [theme, setTheme] = useState(() => {
    // 初始化时检测系统主题偏好
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'dark'; // 默认值
  });

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // 初始化主题
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark');
    }

    // 监听主题变化
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 简单易学链接数据
  const easyLearnLinks = [
    {
      id: 'meihua',
      title: '梅花易数',
      description: '以数观象，简易直观的占卜方法',
      icon: '🌸',
      colorClass: styles.fromPinkToPurple,
      link: '/plum-blossom',
      isImplemented: true
    },
    {
      id: 'tieban',
      title: '铁板神数',
      description: '精微数术，条文详解',
      icon: '🧮',
      colorClass: styles.fromBlueToIndigo,
      link: '/tiebanshenshu',
      isImplemented: true
    },
    {
      id: 'liuyao',
      title: '六爻预测',
      description: '传统占卜，灵活多变',
      icon: '筮',
      colorClass: styles.fromGreenToTeal,
      link: '/liuyao',
      isImplemented: true
    },
    {
      id: 'qimen',
      title: '奇门遁甲',
      description: '帝王之学，时空预测',
      icon: '☰',
      colorClass: styles.fromYellowToOrange,
      link: '/qimen',
      isImplemented: true
    },
    {
      id: 'liuren',
      title: '六壬神课',
      description: '最高预测术之一',
      icon: '☯',
      colorClass: styles.fromRedToPink,
      link: '/liuren',
      isImplemented: false
    },
    {
      id: 'ziwei',
      title: '紫微斗数',
      description: '帝王之星，命理精要',
      icon: '⭐',
      colorClass: styles.fromIndigoToPurple,
      link: '/ziwei',
      isImplemented: false
    }
  ];

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.containerDark : styles.containerLight}`}>
      {/* 头部导航 */}
      <header className={`${styles.header} ${theme === 'dark' ? styles.headerDark : styles.headerLight}`}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>简单易学</h1>
            <p className={`${styles.subtitle} ${theme === 'dark' ? styles.subtitleDark : styles.subtitleLight}`}>
              传统易学 • 简单入门 • 深入实践
            </p>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className={styles.mainContent}>
        <div className={styles.gridLayout}>
          {easyLearnLinks.map((item) => (
            <div 
              key={item.id}
              className={`${styles.card} ${theme === 'dark' ? styles.cardDark : styles.cardLight} ${item.colorClass}`}
              onMouseEnter={(e) => {
                e.currentTarget.classList.add(styles.cardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove(styles.cardHover);
              }}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardIcon}>{item.icon}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
              <p className={`${styles.cardDescription} ${theme === 'dark' ? styles.cardTextDark : styles.cardTextLight}`}>
                {item.description}
              </p>
              <button 
                className={`${styles.button} ${theme === 'dark' ? styles.buttonDark : styles.buttonLight}`}
                onClick={() => {
                  if (item.isImplemented) {
                    window.location.href = item.link;
                  } else {
                    // 对于暂未实现的功能，跳转到功能开发中页面
                    window.location.href = `/feature-development?feature=${encodeURIComponent(item.title)}&link=${encodeURIComponent(item.link)}`;
                  }
                }}
              >
                立即学习
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className={`${styles.footer} ${theme === 'dark' ? styles.footerDark : styles.footerLight}`}>
        <div className={styles.footerContent}>
          <p className={styles.footerTitle}>易学入门 - 从零开始学习传统智慧</p>
          <p className={`${styles.footerDescription} ${theme === 'dark' ? styles.footerDescriptionDark : styles.footerDescriptionLight}`}>
            选择您感兴趣的易学分支，开始您的学习之旅
          </p>
          <div className={styles.footerIcons}>
            <span className={styles.footerIcon}>🌸 以数观象</span>
            <span className={styles.footerIcon}>🧮 以象明理</span>
            <span className={styles.footerIcon}>📜 以理知命</span>
            <span className={styles.footerIcon}>🔮 以变应变</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShaoyongYixue;