import { isNative, isAndroid } from './capacitor';
import { registerPlugin } from '@capacitor/core';

// 定义 UpdatePlugin
const AppUpdate = registerPlugin('AppUpdate');

/**
 * 原生下载管理器
 * 负责处理 APK 下载、进度通知和自动安装
 */
class DownloadManager {
  constructor() {
    this.downloadId = null;
    this.isDownloading = false;
    this.progressListener = null;
  }

  /**
   * 开始下载 APK
   * @param {string} url - APK 下载地址
   * @param {string} version - 版本号
   * @param {Function} onProgress - 进度回调 (percentage) => void
   * @param {Function} onComplete - 完成回调 (filePath) => void
   * @param {Function} onError - 错误回调 (error) => void
   */
  async downloadApk(url, version, onProgress, onComplete, onError) {
    if (!isNative || !isAndroid) {
      // 非 Android 原生环境，直接打开浏览器下载
      window.open(url, '_blank');
      return;
    }

    if (this.isDownloading) {
      console.warn('Download already in progress');
      return;
    }

    this.isDownloading = true;
    console.log(`Starting download from ${url}...`);

    // 移除之前的监听器（如果有）
    if (this.progressListener) {
      await this.progressListener.remove();
      this.progressListener = null;
    }

    try {
      // 添加进度监听器
      this.progressListener = await AppUpdate.addListener('downloadProgress', (info) => {
        if (info.total > 0) {
          const percentage = Math.round((info.downloaded / info.total) * 100);
          if (onProgress) onProgress(percentage);
        }
        
        // Android DownloadManager.STATUS_SUCCESSFUL = 8
        if (info.status === 8) {
           this.isDownloading = false;
           if (onComplete) onComplete('download-completed');
           // 完成后移除监听器
           if (this.progressListener) {
             this.progressListener.remove();
             this.progressListener = null;
           }
        }
      });

      // 调用原生插件下载
      const result = await AppUpdate.downloadAndInstall({ url, version });
      
      // 注意：resolve 只代表下载请求已加入队列，并不代表下载完成
      // 实际完成由 listener 处理
      console.log('Download started:', result);
      
    } catch (error) {
      console.error('Download failed:', error);
      this.isDownloading = false;
      
      if (this.progressListener) {
        await this.progressListener.remove();
        this.progressListener = null;
      }

      // 降级：如果插件调用失败，尝试打开浏览器
      window.open(url, '_blank');
      if (onError) onError(error);
    }
  }

  /**
   * 安装 APK (保留作为备用或参考)
   */
  async installApk(filePath) {
    // 触发安装 Intent
    // 这通常需要原生代码支持。在纯 Web/Capacitor 环境下，
    // 我们可以尝试使用 FileOpener 插件，或者通过 intent:// 协议
    
    // 如果没有原生插件支持，最可靠的方式是让用户手动打开
    // 但为了尽量满足需求，我们这里假设有一个能够处理安装 Intent 的机制
    
    console.log(`Attempting to install APK from ${filePath}`);
    
    // 动态申请未知来源安装权限 (Android 8.0+)
    if (isAndroid) {
        // 这里只是模拟，实际需要原生插件如 cordova-plugin-android-permissions 或 capacitor-community/permissions
        console.log('Requesting REQUEST_INSTALL_PACKAGES permission...');
    }

    // 降级方案：通知用户下载完成
    alert('下载完成！请在通知栏或文件管理器中点击安装包进行安装。');
  }
}

const downloadManager = new DownloadManager();
export default downloadManager;
