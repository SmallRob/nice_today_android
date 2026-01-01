/**
 * 移动端文件系统访问工具
 * 支持Capacitor原生环境和Web环境
 * 确保在Android/iOS WebView中能够正常保存和导入数据
 */

import { Capacitor } from '@capacitor/core';
import JSZip from 'jszip';

// Capacitor Filesystem插件引用（延迟导入）
let Filesystem = null;
let FilesystemInitialized = false;

// 环境检测缓存
let cachedEnvironment = null;

/**
 * 初始化Filesystem插件（优化版，确保只初始化一次）
 */
const initFilesystem = async () => {
  if (FilesystemInitialized) return Filesystem;

  try {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Filesystem')) {
      const module = await import('@capacitor/filesystem');
      Filesystem = module.Filesystem;
      FilesystemInitialized = true;
      console.log('Capacitor Filesystem plugin initialized');
    } else {
      console.log('Filesystem plugin not available, using web APIs');
      FilesystemInitialized = true;
    }
  } catch (error) {
    console.warn('Failed to load Filesystem plugin:', error);
    Filesystem = null;
    FilesystemInitialized = true;
  }

  return Filesystem;
};

/**
 * 检测设备环境（优化版，使用缓存）
 */
export const detectEnvironment = () => {
  // 使用缓存结果
  if (cachedEnvironment) {
    return cachedEnvironment;
  }

  const isNative = Capacitor.isNativePlatform();
  const isAndroid = Capacitor.getPlatform() === 'android';
  const isIOS = Capacitor.getPlatform() === 'ios';
  const isWeb = Capacitor.getPlatform() === 'web';
  const isSecureContext = window.isSecureContext;
  
  // 检测WebView环境（更准确）
  const isWebView = (() => {
    if (isWeb) return false;
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /wv|WebView|; wv\)/i.test(ua);
  })();
  
  // 检测File System Access API支持
  const hasFileSystemAccessAPI = 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
  
  // 检测传统下载支持
  const hasTraditionalDownload = typeof document.createElement('a').download !== 'undefined';
  
  cachedEnvironment = {
    isNative,
    isAndroid,
    isIOS,
    isWeb,
    isWebView,
    isSecureContext,
    hasFileSystemAccessAPI,
    hasTraditionalDownload,
    platform: Capacitor.getPlatform()
  };

  return cachedEnvironment;
};

/**
 * 获取可用的文件保存方法
 */
export const getAvailableSaveMethods = () => {
  const env = detectEnvironment();
  const methods = [];

  if (env.isNative) {
    methods.push('capacitor-filesystem');
  }

  if (env.hasFileSystemAccessAPI && env.isSecureContext) {
    methods.push('filesystem-access-api');
  }

  if (env.hasTraditionalDownload) {
    methods.push('traditional-download');
  }

  return methods;
};

/**
 * 保存文件内容
 * @param {string} filename - 文件名
 * @param {string} content - 文件内容
 * @param {string} mimeType - MIME类型（可选）
 * @param {string} directory - 目录（仅Capacitor，可选）
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
export const saveFile = async (filename, content, mimeType = 'application/json', directory = null) => {
  try {
    const env = detectEnvironment();
    const methods = getAvailableSaveMethods();

    console.log('Available save methods:', methods);
    console.log('Environment:', env);

    // 方法1: 使用Capacitor Filesystem (原生环境优先)
    if (methods.includes('capacitor-filesystem')) {
      try {
        await initFilesystem();
        if (Filesystem) {
          const result = await saveFileWithCapacitor(filename, content, directory);
          return result;
        }
      } catch (error) {
        console.warn('Capacitor Filesystem failed, trying next method:', error);
      }
    }

    // 方法2: 使用File System Access API (Web环境，支持选择保存位置)
    if (methods.includes('filesystem-access-api')) {
      try {
        const result = await saveFileWithFileSystemAccess(filename, content, mimeType);
        return result;
      } catch (error) {
        console.warn('File System Access API failed, trying next method:', error);
        if (error.name === 'NotAllowedError') {
          return {
            success: false,
            error: '存储权限不足，请在浏览器设置中允许文件访问'
          };
        }
      }
    }

    // 方法3: 使用传统下载方式 (最后的降级方案)
    if (methods.includes('traditional-download')) {
      const result = await saveFileWithTraditionalDownload(filename, content, mimeType);
      return result;
    }

    return {
      success: false,
      error: '当前环境不支持文件保存功能'
    };

  } catch (error) {
    console.error('Save file error:', error);
    return {
      success: false,
      error: error.message || '保存文件失败'
    };
  }
};

/**
 * 使用Capacitor Filesystem保存文件
 */
const saveFileWithCapacitor = async (filename, content, directory = null) => {
  try {
    // 默认保存到Documents目录
    const saveDirectory = directory || 'Documents';
    
    // 写入文件
    await Filesystem.writeFile({
      path: `${saveDirectory}/${filename}`,
      data: content,
      directory: saveDirectory,
      encoding: 'utf8',
      recursive: true
    });

    // 获取文件URI用于显示给用户
    const fileUri = await Filesystem.getUri({
      path: `${saveDirectory}/${filename}`,
      directory: saveDirectory
    });

    console.log('File saved successfully:', fileUri.uri);
    
    return {
      success: true,
      path: fileUri.uri,
      method: 'capacitor-filesystem'
    };
  } catch (error) {
    console.error('Capacitor Filesystem save error:', error);
    
    // 处理权限错误
    if (error.message?.includes('Permission') || error.message?.includes('permission')) {
      throw new Error('存储权限不足');
    }
    
    throw error;
  }
};

/**
 * 使用File System Access API保存文件
 */
const saveFileWithFileSystemAccess = async (filename, content, mimeType) => {
  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: '文件',
        accept: { [mimeType]: [filename.endsWith('.json') ? '.json' : '.txt'] }
      }]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    console.log('File saved with File System Access API');
    
    return {
      success: true,
      path: fileHandle.name,
      method: 'filesystem-access-api'
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('已取消保存');
    }
    throw error;
  }
};

/**
 * 使用传统下载方式保存文件（优化版，改进清理和兼容性）
 */
const saveFileWithTraditionalDownload = async (filename, content, mimeType) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // 确保跨浏览器兼容性
    const clickPromise = new Promise((resolve, reject) => {
      try {
        a.click();
        // iOS Safari需要延迟
        setTimeout(() => {
          resolve();
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
    
    await clickPromise;
    
    // 改进清理逻辑
    try {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
    } catch (e) {
      console.warn('Failed to remove download link:', e);
    }
    
    // 延迟释放URL，确保下载完成
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Failed to revoke object URL:', e);
      }
    }, 1000);

    console.log('File saved with traditional download');
    
    return {
      success: true,
      method: 'traditional-download'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * 读取文件内容
 * @param {string} accept - 接受的文件类型（可选）
 * @returns {Promise<{success: boolean, content?: string, filename?: string, error?: string}>}
 */
export const readFile = async (accept = '.json') => {
  try {
    const env = detectEnvironment();
    const methods = getAvailableSaveMethods();

    console.log('Available read methods:', methods);

    // 方法1: 使用Capacitor Filesystem (原生环境)
    if (methods.includes('capacitor-filesystem')) {
      try {
        await initFilesystem();
        if (Filesystem) {
          const result = await readFileWithCapacitor();
          return result;
        }
      } catch (error) {
        console.warn('Capacitor Filesystem read failed, trying next method:', error);
      }
    }

    // 方法2: 使用File System Access API
    if (methods.includes('filesystem-access-api')) {
      try {
        const result = await readFileWithFileSystemAccess(accept);
        return result;
      } catch (error) {
        console.warn('File System Access API read failed, trying next method:', error);
        if (error.name === 'NotAllowedError') {
          return {
            success: false,
            error: '存储权限不足，请在浏览器设置中允许文件访问'
          };
        }
      }
    }

    // 方法3: 使用传统input方式
    return await readFileWithTraditionalInput(accept);

  } catch (error) {
    console.error('Read file error:', error);
    return {
      success: false,
      error: error.message || '读取文件失败'
    };
  }
};

/**
 * 使用Capacitor Filesystem读取文件（优化版）
 */
const readFileWithCapacitor = async () => {
  try {
    await initFilesystem();
    
    if (!Filesystem) {
      throw new Error('Filesystem插件未初始化');
    }

    // 对于原生环境，我们需要创建一个临时的文件选择UI
    // 或者使用其他方法让用户选择文件
    // 这里我们使用一个通用的方法：
    
    // 1. 尝试读取之前保存的文件（如果有记录）
    const savedFiles = await Filesystem.readdir({
      path: '',
      directory: 'Documents'
    }).catch(() => ({ files: [] }));
    
    console.log('Available files in Documents:', savedFiles.files);
    
    // 2. 如果没有找到文件，使用Web API降级方案
    if (savedFiles.files.length === 0 || !savedFiles.files.some(f => f.name.includes('nice-today'))) {
      throw new Error('未找到备份文件，请使用文件选择器');
    }
    
    // 3. 如果找到备份文件，尝试读取最新的
    const backupFiles = savedFiles.files
      .filter(f => f.name.includes('nice-today') && f.name.endsWith('.json'))
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    
    if (backupFiles.length > 0) {
      const latestFile = backupFiles[0];
      const result = await Filesystem.readFile({
        path: latestFile.name,
        directory: 'Documents',
        encoding: 'utf8'
      });
      
      console.log('Read file from storage:', latestFile.name);
      
      return {
        success: true,
        content: result.data,
        filename: latestFile.name,
        method: 'capacitor-filesystem'
      };
    }
    
    throw new Error('未找到有效的备份文件');
  } catch (error) {
    // 如果Capacitor Filesystem无法满足需求，降级到Web API
    console.warn('Capacitor Filesystem read failed, falling back to Web API:', error);
    throw error;
  }
};

/**
 * 使用File System Access API读取文件
 */
const readFileWithFileSystemAccess = async (accept) => {
  try {
    const acceptTypes = accept === '.json' 
      ? 'application/json'
      : accept.replace('.', '') + '/*';

    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: '文件',
        accept: { [acceptTypes]: [accept] }
      }],
      multiple: false
    });

    const file = await fileHandle.getFile();
    const content = await file.text();

    console.log('File read with File System Access API:', file.name);
    
    return {
      success: true,
      content,
      filename: file.name,
      method: 'filesystem-access-api'
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('已取消选择');
    }
    throw error;
  }
};

/**
 * 使用传统input方式读取文件（优化版，改进清理和错误处理）
 */
const readFileWithTraditionalInput = async (accept) => {
  return new Promise((resolve, reject) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.style.display = 'none'; // 防止影响布局

      // 添加到DOM
      document.body.appendChild(input);

      // 设置超时清理
      let isResolved = false;
      const cleanup = () => {
        if (input.parentNode) {
          try {
            document.body.removeChild(input);
          } catch (e) {
            console.warn('Failed to remove input element:', e);
          }
        }
      };

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({
            success: false,
            error: '操作超时'
          });
        }
      }, 60000); // 60秒超时

      input.onchange = (event) => {
        clearTimeout(timeoutId);
        
        if (isResolved) {
          cleanup();
          return;
        }
        
        isResolved = true;
        
        const file = event.target.files[0];
        if (!file) {
          cleanup();
          resolve({
            success: false,
            error: '未选择文件'
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          cleanup();
          resolve({
            success: true,
            content: e.target.result,
            filename: file.name,
            method: 'traditional-input'
          });
        };
        reader.onerror = (error) => {
          cleanup();
          reject(new Error('读取文件失败: ' + error));
        };
        reader.onabort = () => {
          cleanup();
          resolve({
            success: false,
            error: '已取消读取'
          });
        };

        reader.readAsText(file);
      };

      input.onerror = (error) => {
        clearTimeout(timeoutId);
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(new Error('文件选择失败: ' + error));
        }
      };

      // 延迟触发点击，确保元素已添加到DOM
      requestAnimationFrame(() => {
        input.click();
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 检查并请求存储权限（仅原生环境，优化版）
 */
export const checkAndRequestStoragePermission = async () => {
  try {
    const env = detectEnvironment();
    
    // Web环境不需要权限请求
    if (!env.isNative) {
      return { granted: true, message: 'Web环境无需权限' };
    }

    // Android环境
    if (env.isAndroid) {
      try {
        await initFilesystem();
        
        if (!Filesystem) {
          // 如果Filesystem插件不可用，尝试使用传统方式
          console.warn('Filesystem plugin not available for Android');
          return { 
            granted: false, 
            message: 'Filesystem插件不可用，请检查应用配置' 
          };
        }

        // 检查权限
        const permissions = await Filesystem.checkPermissions().catch((error) => {
          console.warn('Failed to check permissions:', error);
          return { publicStorage: 'prompt' }; // 默认值
        });
        
        console.log('Storage permissions:', permissions);

        // 如果权限未授予，尝试请求
        if (permissions.publicStorage !== 'granted') {
          const result = await Filesystem.requestPermissions().catch((error) => {
            console.warn('Failed to request permissions:', error);
            return { publicStorage: 'denied' }; // 默认值
          });
          
          console.log('Permission request result:', result);

          if (result.publicStorage === 'granted') {
            return { granted: true, message: '存储权限已授予' };
          } else if (result.publicStorage === 'denied') {
            return { granted: false, message: '存储权限已被拒绝，请在应用设置中手动授权' };
          } else {
            return { granted: false, message: '存储权限不足，请稍后重试' };
          }
        }

        return { granted: true, message: '存储权限已授予' };
      } catch (error) {
        console.error('Android permission check error:', error);
        return { 
          granted: false, 
          message: '权限检查失败: ' + (error.message || '未知错误') 
        };
      }
    }

    // iOS环境
    if (env.isIOS) {
      try {
        await initFilesystem();
        
        // iOS使用沙盒机制，但仍然尝试初始化Filesystem
        // 对于iOS，我们不需要显式权限请求
        console.log('iOS environment detected, sandbox mode enabled');
        return { granted: true, message: 'iOS沙盒模式，无需显式存储权限' };
      } catch (error) {
        console.error('iOS permission check error:', error);
        // iOS即使Filesystem插件有问题，也假设权限已授予（沙盒机制）
        return { granted: true, message: 'iOS沙盒模式' };
      }
    }

    // 未知平台
    return { granted: false, message: '未知平台类型' };
  } catch (error) {
    console.error('Permission check error:', error);
    return { 
      granted: false, 
      message: '权限检查失败: ' + (error.message || '未知错误') 
    };
  }
};

/**
 * 创建ZIP压缩包（如果需要支持备份多个文件）
 */
export const createBackupZip = async (files, filename) => {
  try {
    console.log('Creating backup ZIP for', files.length, 'files');
    
    // 创建新的ZIP实例
    const zip = new JSZip();
    
    // 添加每个文件到ZIP
    files.forEach(file => {
      if (file.name && file.content !== undefined) {
        zip.file(file.name, file.content);
      } else {
        console.warn('跳过无效文件:', file);
      }
    });
    
    // 生成ZIP Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // 保存ZIP文件
    const saveResult = await saveFile(filename, zipBlob, 'application/zip');
    
    return {
      success: true,
      ...saveResult,
      fileCount: files.length,
      zipSize: zipBlob.size
    };
  } catch (error) {
    console.error('创建ZIP备份失败:', error);
    return {
      success: false,
      error: error.message || 'ZIP压缩失败'
    };
  }
};

/**
 * 解压ZIP备份包
 */
export const extractBackupZip = async (zipFile) => {
  try {
    console.log('Extracting backup ZIP');
    
    // 根据输入类型获取ZIP数据
    let zipData;
    if (zipFile instanceof Blob || zipFile instanceof File) {
      // 如果是Blob或File对象，直接使用
      zipData = await zipFile.arrayBuffer();
    } else if (typeof zipFile === 'string') {
      // 如果是文件路径，尝试读取文件
      // 注意：这里假设是Web环境，需要根据实际情况调整
      const response = await fetch(zipFile);
      if (!response.ok) {
        throw new Error(`无法读取ZIP文件: ${response.statusText}`);
      }
      zipData = await response.arrayBuffer();
    } else if (zipFile instanceof ArrayBuffer) {
      zipData = zipFile;
    } else {
      throw new Error('不支持的ZIP文件格式');
    }
    
    // 加载ZIP文件
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipData);
    
    // 提取所有文件
    const extractedFiles = [];
    const filePromises = [];
    
    loadedZip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        // 对于每个文件，异步提取内容
        const filePromise = zipEntry.async('text').then(content => {
          extractedFiles.push({
            name: zipEntry.name,
            path: relativePath,
            content: content,
            size: zipEntry._data.uncompressedSize
          });
        }).catch(async (error) => {
          // 如果文本提取失败，尝试作为二进制数据
          try {
            const binaryContent = await zipEntry.async('uint8array');
            extractedFiles.push({
              name: zipEntry.name,
              path: relativePath,
              content: binaryContent,
              size: zipEntry._data.uncompressedSize,
              binary: true
            });
          } catch (binaryError) {
            console.warn(`无法提取文件 ${zipEntry.name}:`, binaryError);
          }
        });
        filePromises.push(filePromise);
      }
    });
    
    // 等待所有文件提取完成
    await Promise.all(filePromises);
    
    return {
      success: true,
      files: extractedFiles,
      fileCount: extractedFiles.length,
      message: `成功解压 ${extractedFiles.length} 个文件`
    };
  } catch (error) {
    console.error('解压ZIP备份失败:', error);
    return {
      success: false,
      error: error.message || 'ZIP解压失败'
    };
  }
};

// 导出工具类对象
export default {
  detectEnvironment,
  getAvailableSaveMethods,
  saveFile,
  readFile,
  checkAndRequestStoragePermission,
  createBackupZip,
  extractBackupZip
};
