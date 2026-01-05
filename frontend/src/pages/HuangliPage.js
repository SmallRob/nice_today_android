import { useTheme } from '../context/ThemeContext';
import HuangliComponent from '../components/HuangliComponent';

const HuangliPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen pb-safe-bottom ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    }`}>
      {/* 导航栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%'
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: theme === 'dark' ? '#ffffff' : '#1f2937'
          }}>
            黄历择吉
          </h1>
          <div style={{
            fontSize: '14px',
            opacity: 0.7,
            color: theme === 'dark' ? '#d1d5db' : '#6b7280'
          }}>
            传统历法智慧
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-1 py-6 max-w-4xl pb-safe-bottom">
        {/* <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            传统黄历
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            查看每日黄历信息，选择吉日进行重要活动
          </p>
        </div> */}

        {/* 黄历组件 */}
        <HuangliComponent />
      </div>
    </div>
  );
};

export default HuangliPage;