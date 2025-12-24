/**
 * Web Worker 管理器
 * 用于管理八字计算的异步任务
 */

import { calculateDetailedBazi, calculateLiuNianDaYun } from './baziHelper';

let baziWorker = null;
let taskIdCounter = 0;
const pendingTasks = new Map();

// 初始化 Bazi Worker
function initBaziWorker() {
  if (baziWorker) {
    return Promise.resolve(baziWorker);
  }

  return new Promise((resolve, reject) => {
    try {
      // 创建 Web Worker
      baziWorker = new Worker(
        new URL('../workers/baziWorker.js', import.meta.url),
        { type: 'module' }
      );

      baziWorker.onmessage = (event) => {
        const { type, payload, error, taskId } = event.data;

        if (taskId && pendingTasks.has(taskId)) {
          const { resolve, reject } = pendingTasks.get(taskId);

          if (type === 'ERROR' || error) {
            reject(new Error(error || 'Worker计算失败'));
          } else {
            resolve(payload);
          }

          pendingTasks.delete(taskId);
        }
      };

      baziWorker.onerror = (error) => {
        console.error('Bazi Worker error:', error);
        reject(error);
      };

      resolve(baziWorker);
    } catch (error) {
      console.error('Failed to create Bazi Worker:', error);
      // 如果 Web Worker 不可用，降级到同步计算
      resolve(null);
    }
  });
}

/**
 * 使用 Web Worker 计算八字
 */
export async function calculateBaziWithWorker(birthDateStr, birthTimeStr, longitude, retryCount = 2) {
  const worker = await initBaziWorker();

  // 如果 Worker 不可用，降级到同步计算
  if (!worker) {
    console.warn('Web Worker 不可用，使用同步计算');
    return calculateBaziSync(birthDateStr, birthTimeStr, longitude);
  }

  return new Promise((resolve, reject) => {
    const taskId = `bazi_${taskIdCounter++}`;
    pendingTasks.set(taskId, { resolve, reject });

    try {
      worker.postMessage({
        type: 'CALCULATE_DETAILED_BAZI',
        payload: { birthDateStr, birthTimeStr, longitude },
        taskId
      });

      // 设置超时
      const timeoutId = setTimeout(() => {
        if (pendingTasks.has(taskId)) {
          pendingTasks.delete(taskId);
          reject(new Error('计算超时'));
        }
      }, 5000);

      // 任务完成时清除超时
      const originalResolve = pendingTasks.get(taskId)?.resolve;
      if (originalResolve) {
        pendingTasks.set(taskId, {
          resolve: (value) => {
            clearTimeout(timeoutId);
            originalResolve(value);
          },
          reject: (err) => {
            clearTimeout(timeoutId);
            reject(err);
          }
        });
      }
    } catch (error) {
      pendingTasks.delete(taskId);
      reject(error);
    }
  });
}

/**
 * 使用 Web Worker 计算流年大运
 */
export async function calculateLiuNianWithWorker(baziData, targetYear, retryCount = 2) {
  const worker = await initBaziWorker();

  if (!worker) {
    console.warn('Web Worker 不可用，使用同步计算');
    return calculateLiuNianSync(baziData, targetYear);
  }

  return new Promise((resolve, reject) => {
    const taskId = `liunian_${taskIdCounter++}`;
    pendingTasks.set(taskId, { resolve, reject });

    try {
      worker.postMessage({
        type: 'CALCULATE_LIU_NIAN_DA_YUN',
        payload: { baziData, targetYear },
        taskId
      });

      // 设置超时
      const timeoutId = setTimeout(() => {
        if (pendingTasks.has(taskId)) {
          pendingTasks.delete(taskId);
          reject(new Error('计算超时'));
        }
      }, 5000);

      const originalResolve = pendingTasks.get(taskId)?.resolve;
      if (originalResolve) {
        pendingTasks.set(taskId, {
          resolve: (value) => {
            clearTimeout(timeoutId);
            originalResolve(value);
          },
          reject: (err) => {
            clearTimeout(timeoutId);
            reject(err);
          }
        });
      }
    } catch (error) {
      pendingTasks.delete(taskId);
      reject(error);
    }
  });
}

/**
 * 降级到同步计算八字
 */
function calculateBaziSync(birthDateStr, birthTimeStr, longitude) {
  // 调用原有的同步计算函数
  return calculateDetailedBazi(birthDateStr, birthTimeStr, longitude);
}

/**
 * 降级到同步计算流年大运
 */
function calculateLiuNianSync(baziData, targetYear) {
  // 调用原有的同步计算函数
  return calculateLiuNianDaYun(baziData, targetYear);
}

/**
 * 清理 Worker 资源
 */
export function terminateWorker() {
  if (baziWorker) {
    baziWorker.terminate();
    baziWorker = null;
  }
  pendingTasks.clear();
}

// 页面卸载时清理
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', terminateWorker);
}
