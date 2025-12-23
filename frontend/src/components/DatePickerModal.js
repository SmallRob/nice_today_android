const DatePickerModal = ({ isOpen, onClose, selectedYear, selectedMonth, selectedDate, onChange, theme }) => {
  if (!isOpen) return null;

  const yearOptions = Array.from({ length: 100 }, (_, i) => 1950 + i);

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
            选择日期
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

        {/* 日期选择器 */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1">
            <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>年份</label>
            <select
              value={selectedYear}
              onChange={(e) => onChange(parseInt(e.target.value), selectedMonth, selectedDate)}
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
              value={selectedMonth}
              onChange={(e) => onChange(selectedYear, parseInt(e.target.value), selectedDate)}
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
              value={selectedDate}
              onChange={(e) => onChange(selectedYear, selectedMonth, parseInt(e.target.value))}
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
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
