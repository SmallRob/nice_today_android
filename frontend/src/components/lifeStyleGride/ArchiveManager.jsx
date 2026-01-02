import { useState } from 'react';

const ArchiveManager = ({ archives, onCreateArchive, onLoadArchive, onDeleteArchive, theme = 'light' }) => {
  const [showNewArchiveForm, setShowNewArchiveForm] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState('');
  const [selectedSize, setSelectedSize] = useState(3);
  
  const handleCreateArchive = (e) => {
    e.preventDefault();
    if (newArchiveName.trim()) {
      onCreateArchive(newArchiveName.trim(), selectedSize);
      setNewArchiveName('');
      setShowNewArchiveForm(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h2 className="text-2xl font-bold mb-2">生命矩阵存档</h2>
      <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>选择一个存档继续，或创建新的矩阵</p>
      
      <button 
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg mb-6 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
        } transition-all transform hover:scale-105`}
        onClick={() => setShowNewArchiveForm(true)}
        aria-label="创建新的生命矩阵存档"
      >
        + 创建新矩阵
      </button>
      
      {showNewArchiveForm && (
        <div className={`mb-6 p-6 rounded-xl border ${
          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-4">创建新矩阵</h3>
          <form onSubmit={handleCreateArchive} className="space-y-4">
            <div>
              <label htmlFor="archiveName" className={`block mb-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>矩阵名称</label>
              <input
                type="text"
                id="archiveName"
                value={newArchiveName}
                onChange={(e) => setNewArchiveName(e.target.value)}
                placeholder="例如：我的2024意义探索"
                required
                autoFocus
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block mb-3 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>矩阵大小</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 rounded-lg border cursor-pointer ${
                  selectedSize === 3 
                    ? `${theme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-100'}`
                    : `${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                }`}>
                  <input
                    type="radio"
                    name="matrixSize"
                    value="3"
                    checked={selectedSize === 3}
                    onChange={() => setSelectedSize(3)}
                    className="h-4 w-4 mr-3"
                  />
                  <div>
                    <h4 className="font-bold">3×3 基础矩阵</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>9个核心生命维度</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>适合初次探索</p>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 rounded-lg border cursor-pointer ${
                  selectedSize === 7 
                    ? `${theme === 'dark' ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-100'}`
                    : `${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`
                }`}>
                  <input
                    type="radio"
                    name="matrixSize"
                    value="7"
                    checked={selectedSize === 7}
                    onChange={() => setSelectedSize(7)}
                    className="h-4 w-4 mr-3"
                  />
                  <div>
                    <h4 className="font-bold">7×7 完整矩阵</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>49个生命维度</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>深度意义探索</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                className={`px-6 py-3 rounded-lg font-medium flex-1 ${
                  theme === 'dark' 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => setShowNewArchiveForm(false)}
              >
                取消
              </button>
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-lg font-medium text-white flex-1 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                }`}
              >
                创建矩阵
              </button>
            </div>
          </form>
        </div>
      )}
      
      {archives.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">现有存档 ({archives.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archives.map(archive => (
              <div key={archive.id} className={`p-5 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-gray-200'
              } shadow`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg truncate">{archive.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {archive.matrixSize}×{archive.matrixSize}
                  </span>
                </div>
                
                <div className={`text-sm space-y-1 mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>创建时间: {formatDate(archive.created)}</p>
                  {archive.lastModified && (
                    <p>最后修改: {formatDate(archive.lastModified)}</p>
                  )}
                  <p>能量总分: <strong className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{archive.totalScore || 0}</strong></p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium flex-1 ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    onClick={() => onLoadArchive(archive.id)}
                    aria-label={`继续存档 ${archive.name}`}
                  >
                    继续
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    onClick={() => onDeleteArchive(archive.id)}
                    aria-label={`删除存档 ${archive.name}`}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div className="text-5xl mb-4">✧</div>
          <h3 className="text-xl font-bold mb-2">还没有创建任何矩阵</h3>
          <p>创建你的第一个生命矩阵，开始意义探索之旅</p>
        </div>
      )}
      
      <div className={`p-4 rounded-lg text-sm ${
        theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'
      }`}>
        <h4 className="font-bold mb-2">关于存档</h4>
        <p className="mb-2">所有数据都保存在您的浏览器本地存储中，不会上传到任何服务器。</p>
        <p className="mb-2">您可以在同一设备上创建多个矩阵，分别探索不同的生命阶段或主题。</p>
        <p className="text-yellow-600 dark:text-yellow-400">⚠️ 清除浏览器数据会删除所有存档，请定期备份重要数据。</p>
      </div>
    </div>
  );
};

export default ArchiveManager;