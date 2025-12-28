// 本地存储工具函数
export const initializeStorage = () => {
  if (!localStorage.getItem('life_matrix_archives')) {
    localStorage.setItem('life_matrix_archives', JSON.stringify([]));
  }
};

export const getArchives = () => {
  try {
    return JSON.parse(localStorage.getItem('life_matrix_archives')) || [];
  } catch (error) {
    console.error('读取存档列表失败:', error);
    return [];
  }
};

export const getCurrentArchive = () => {
  return localStorage.getItem('life_matrix_current_archive');
};

export const saveArchive = (archiveId, data) => {
  try {
    localStorage.setItem(`life_matrix_archive_${archiveId}`, JSON.stringify(data));
    
    // 更新存档列表
    const archives = getArchives();
    const existingIndex = archives.findIndex(a => a.id === archiveId);
    
    const archiveInfo = {
      id: archiveId,
      name: data.name,
      created: data.created,
      lastModified: new Date().toISOString(),
      matrixSize: data.matrixSize,
      totalScore: data.totalScore || 0
    };
    
    if (existingIndex >= 0) {
      archives[existingIndex] = archiveInfo;
    } else {
      archives.push(archiveInfo);
    }
    
    localStorage.setItem('life_matrix_archives', JSON.stringify(archives));
    return true;
  } catch (error) {
    console.error('保存存档失败:', error);
    return false;
  }
};

export const deleteArchive = (archiveId) => {
  try {
    localStorage.removeItem(`life_matrix_archive_${archiveId}`);
    
    const archives = getArchives();
    const updatedArchives = archives.filter(a => a.id !== archiveId);
    localStorage.setItem('life_matrix_archives', JSON.stringify(updatedArchives));
    
    // 如果删除的是当前存档，清除当前存档标记
    if (getCurrentArchive() === archiveId) {
      localStorage.removeItem('life_matrix_current_archive');
    }
    
    return true;
  } catch (error) {
    console.error('删除存档失败:', error);
    return false;
  }
};

// 导出数据功能
export const exportArchive = (archiveId) => {
  try {
    const data = localStorage.getItem(`life_matrix_archive_${archiveId}`);
    if (!data) return null;
    
    const archiveData = JSON.parse(data);
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      archive: archiveData
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('导出存档失败:', error);
    return null;
  }
};

// 导入数据功能
export const importArchive = (importData) => {
  try {
    const data = JSON.parse(importData);
    
    if (data.version !== '1.0') {
      throw new Error('不支持的存档版本');
    }
    
    const archive = data.archive;
    const archiveId = archive.id || `imported_${Date.now()}`;
    
    // 保存存档
    saveArchive(archiveId, {
      ...archive,
      id: archiveId,
      lastModified: new Date().toISOString()
    });
    
    return archiveId;
  } catch (error) {
    console.error('导入存档失败:', error);
    return null;
  }
};