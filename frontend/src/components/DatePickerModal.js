import { useState, useEffect } from 'react';
import LunarCalendar from '../utils/lunarCalendar';
import BaziCalculator from '../utils/baziCalculator';

const DatePickerModal = ({ onClose, selectedYear, selectedMonth, selectedDate, selectedHour, latitude, longitude, onConfirm, onTempCalc, theme }) => {
  const [tempYear, setTempYear] = useState(selectedYear);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempDate, setTempDate] = useState(selectedDate);
  const [tempHour, setTempHour] = useState(selectedHour);
  const [tempLatitude, setTempLatitude] = useState(latitude || 30);
  const [tempLongitude, setTempLongitude] = useState(longitude || 110);
  const [lunarData, setLunarData] = useState(null);
  const [previewBazi, setPreviewBazi] = useState(null);

  const yearOptions = Array.from({ length: 100 }, (_, i) => 1950 + i);

  // 计算农历日期和八字预览
  useEffect(() => {
    const lunar = LunarCalendar.solarToLunar(tempYear, tempMonth, tempDate);
    setLunarData(lunar);

    const bazi = BaziCalculator.calculateBazi(tempYear, tempMonth, tempDate, tempHour, 0, tempLongitude);
    setPreviewBazi(bazi);
  }, [tempYear, tempMonth, tempDate, tempHour, tempLongitude]);
  const shichenOptions = [
    { name: '子时', value: 0, range: '23:00-01:00' },
    { name: '丑时', value: 1, range: '01:00-03:00' },
    { name: '寅时', value: 3, range: '03:00-05:00' },
    { name: '卯时', value: 5, range: '05:00-07:00' },
    { name: '辰时', value: 7, range: '07:00-09:00' },
    { name: '巳时', value: 9, range: '09:00-11:00' },
    { name: '午时', value: 11, range: '11:00-13:00' },
    { name: '未时', value: 13, range: '13:00-15:00' },
    { name: '申时', value: 15, range: '15:00-17:00' },
    { name: '酉时', value: 17, range: '17:00-19:00' },
    { name: '戌时', value: 19, range: '19:00-21:00' },
    { name: '亥时', value: 21, range: '21:00-23:00' }
  ];

  // 确认并保存到配置
  const handleConfirm = () => {
    onConfirm(tempYear, tempMonth, tempDate, tempHour, tempLongitude, tempLatitude, true);
  };

  // 临时计算
  const handleTempCalc = () => {
    onTempCalc(tempYear, tempMonth, tempDate, tempHour, tempLongitude, tempLatitude);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/70' : 'bg-black/50'} backdrop-blur-sm`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md rounded-t-3xl p-6 transform transition-transform ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            选择日期与时辰
          </h4>
          <button
            onClick={onClose}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>×</span>
          </button>
        </div>

        {/* 公历日期选择器 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>年份</label>
            <select
              value={tempYear}
              onChange={(e) => setTempYear(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>月份</label>
            <select
              value={tempMonth}
              onChange={(e) => setTempMonth(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}月</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>日期</label>
            <select
              value={tempDate}
              onChange={(e) => setTempDate(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}日</option>
              ))}
            </select>
          </div>
        </div>

        {/* 农历对照显示 */}
        {lunarData && (
          <div className={`mb-4 p-3 rounded-xl text-center ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-yellow-200/70' : 'text-yellow-700'}`}>对应农历</div>
            <div className={`text-sm font-semibold mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {lunarData.lunarMonthStr}{lunarData.lunarDayStr}
            </div>
          </div>
        )}

        {/* 时辰选择器 */}
        <div className="mb-4">
          <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>时辰</label>
          <select
            value={tempHour}
            onChange={(e) => setTempHour(parseInt(e.target.value))}
            className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
            } focus:outline-none`}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px'
            }}
          >
            {shichenOptions.map(shichen => (
              <option key={shichen.value} value={shichen.value}>
                {shichen.name} ({shichen.range})
              </option>
            ))}
          </select>
        </div>

        {/* 经纬度自定义 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>纬度</label>
            <input
              type="number"
              step="0.01"
              min="-90"
              max="90"
              value={tempLatitude}
              onChange={(e) => setTempLatitude(parseFloat(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="30"
            />
          </div>
          <div>
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>经度</label>
            <input
              type="number"
              step="0.01"
              min="-180"
              max="180"
              value={tempLongitude}
              onChange={(e) => setTempLongitude(parseFloat(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="110"
            />
          </div>
        </div>

        {/* 八字预览 */}
        {previewBazi && (
          <div className={`mb-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-xs mb-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>八字预览</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '年柱', value: previewBazi.year },
                { label: '月柱', value: previewBazi.month },
                { label: '日柱', value: previewBazi.day },
                { label: '时柱', value: previewBazi.hour },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</div>
                  <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            取消
          </button>
          <button
            onClick={handleTempCalc}
            className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-purple-700 text-white hover:bg-purple-600'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            🔮 临时计算
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
