import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// 触觉反馈类型
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// 触觉反馈Hook
export const useHaptics = () => {
  const triggerHaptic = useCallback(async (type: HapticType = 'light') => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
        case 'warning':
        case 'error':
          await Haptics.notification();
          break;
      }
    } catch {
      // 静默失败，触觉反馈不是关键功能
      console.debug('Haptics not available');
    }
  }, []);

  return { triggerHaptic };
};
