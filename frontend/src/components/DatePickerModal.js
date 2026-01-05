import { useState, useEffect, useRef } from 'react';
import LunarCalendar from '../utils/lunarCalendar';
import { calculateDetailedBazi } from '../utils/baziHelper';
import { Solar } from 'lunar-javascript';

// 缓存计算结果
const previewCache = new Map();

const getCacheKey = (year, month, date, hour, longitude) => {
  return `${year}-${month}-${date}-${hour}-${longitude}`;
};

// 根据小时数找到对应的时辰起始值
const getShichenValue = (hour) => {
  if (hour >= 23 || hour < 1) return 23; // 子时
  return Math.floor((hour + 1) / 2) * 2 - 1; // 将实际小时映射到时辰起始值
};

const DatePickerModal = ({ isOpen, onClose, selectedYear, selectedMonth, selectedDate, selectedHour, latitude, longitude, onConfirm, onTempCalc, theme }) => {
  const [tempYear, setTempYear] = useState(selectedYear);
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempDate, setTempDate] = useState(selectedDate);
  // 初始化时辰值：将实际小时映射到时辰起始值
  const [tempHour, setTempHour] = useState(() => getShichenValue(selectedHour));
  const [tempLatitude, setTempLatitude] = useState(latitude || 30);
  const [tempLongitude, setTempLongitude] = useState(longitude || 110);
  const [lunarData, setLunarData] = useState(null);
  const [previewBazi, setPreviewBazi] = useState(null);
  const previewTimeoutRef = useRef(null);

  const yearOptions = Array.from({ length: 100 }, (_, i) => 1950 + i);

  // 计算农历日期和八字预览（使用防抖和缓存优化）
  useEffect(() => {
    // 清除之前的定时器
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // 使用防抖，避免频繁计算
    previewTimeoutRef.current = setTimeout(() => {
      try {
        // 检查缓存
        const cacheKey = getCacheKey(tempYear, tempMonth, tempDate, tempHour, tempLongitude);
        const cachedData = previewCache.get(cacheKey);

        if (cachedData) {
          // 使用缓存数据
          setLunarData(cachedData.lunar);
          setPreviewBazi(cachedData.bazi);
          return;
        }

        // 计算新数据
        const lunar = LunarCalendar.solarToLunar(tempYear, tempMonth, tempDate);

        // 使用新的 calculateDetailedBazi API
        const birthDateStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}-${String(tempDate).padStart(2, '0')}`;
        const birthTimeStr = `${String(tempHour).padStart(2, '0')}:00`;

        const baziResult = calculateDetailedBazi(birthDateStr, birthTimeStr, tempLongitude);

        // 转换为预览显示格式
        const bazi = {
          year: baziResult.bazi?.year || '未知',
          month: baziResult.bazi?.month || '未知',
          day: baziResult.bazi?.day || '未知',
          hour: baziResult.bazi?.hour || '未知',
          shichen: baziResult.shichen?.ganzhi || baziResult.shichen?.name || '未知'
        };

        // 更新状态
        setLunarData(lunar);
        setPreviewBazi(bazi);

        // 缓存计算结果
        previewCache.set(cacheKey, { lunar, bazi });

        // 限制缓存大小
        if (previewCache.size > 50) {
          const firstKey = previewCache.keys().next().value;
          previewCache.delete(firstKey);
        }
      } catch (error) {
        console.warn('预览计算失败:', error);
        // 设置空对象避免显示错误
        setPreviewBazi(null);
      }
    }, 300); // 300ms 防抖

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [tempYear, tempMonth, tempDate, tempHour, tempLongitude]);

  // 时辰选项 - value 映射到实际起始小时
  const shichenOptions = [
    { name: '子时', value: 23, range: '23:00-01:00' },
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

  // 取消操作，重置临时状态
  const handleCancel = () => {
    // 直接关闭弹窗，不重置临时状态
    onClose();
  };

  // 处理遮罩层点击 - 只有点击背景时才关闭
  const handleBackdropClick = (e) => {
    // 如果点击的是弹窗内容本身，不要关闭
    if (e.target !== e.currentTarget) {
      return;
    }
    onClose();
  };

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
      onClick={handleBackdropClick}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col rounded-xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        {/* 头部 */}
        <div
          className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
          }`}
        >
          <h3 className={`text-lg font-bold flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="mr-2">📅</span> 选择日期与时辰
          </h3>
          <button
            onClick={handleCancel}
            onTouchStart={(e) => e.stopPropagation()}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} touch-manipulation`
            aria-label="关闭弹窗"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 主体内容 */}
        <div className="p-4 flex-1 space-y-4">
          {/* 公历日期选择器 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>年份</label>
              <select
                value={tempYear}
                onChange={(e) => setTempYear(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
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

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>月份</label>
              <select
                value={tempMonth}
                onChange={(e) => setTempMonth(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
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

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>日期</label>
              <select
                value={tempDate}
                onChange={(e) => setTempDate(parseInt(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
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
            <div className={`p-3 rounded-lg text-center border ${
              theme === 'dark'
                ? 'bg-yellow-900/20 border-yellow-800'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-yellow-200/70' : 'text-yellow-700'
              }`}>对应农历</span>
              <div className={`text-base font-semibold mt-1 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {lunarData.lunarMonthStr}{lunarData.lunarDayStr}
              </div>
            </div>
          )}

          {/* 时辰选择器 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>时辰</label>
            <select
              value={tempHour}
              onChange={(e) => setTempHour(parseInt(e.target.value))}
              className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
              }`}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>纬度</label>
              <input
                type="number"
                step="0.01"
                min="-90"
                max="90"
                value={tempLatitude}
                onChange={(e) => setTempLatitude(parseFloat(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
                placeholder="30"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>经度</label>
              <input
                type="number"
                step="0.01"
                min="-180"
                max="180"
                value={tempLongitude}
                onChange={(e) => setTempLongitude(parseFloat(e.target.value))}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                }`}
                placeholder="110"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* 八字预览 */}
          {previewBazi && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-3 text-center ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>八字预览</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '年柱', value: previewBazi.year },
                  { label: '月柱', value: previewBazi.month },
                  { label: '日柱', value: previewBazi.day },
                  { label: '时柱', value: previewBazi.hour },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{item.label}</div>
                    <div className={`text-base font-semibold mt-1 py-1.5 rounded-lg ${
                      theme === 'dark' ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-50'
                    }`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className={`p-4 border-t sticky bottom-0 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              onTouchStart={(e) => e.stopPropagation()}
              className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} touch-manipulation`
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleTempCalc}
              onTouchStart={(e) => e.stopPropagation()}
              className={`flex-1 py-3.5 rounded-xl font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'} touch-manipulation`
            >
              🔮 临时计算
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex-1 py-3.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 touch-manipulation"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
