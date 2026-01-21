import { useTheme } from '../context/ThemeContext';
import HuangliComponent from '../components/HuangliComponent';

const HuangliPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen pb-32 w-full ${theme === 'dark'
      ? 'bg-slate-900 text-white'
      : 'bg-gray-100 text-gray-900'
      }`}>
      {/* 主内容区 */}
      <div className="max-w-md mx-auto px-2 pt-2">
        <HuangliComponent />
      </div>
    </div>
  );
};

export default HuangliPage;