/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Material Design 3 颜色系统 - 使用CSS变量
      colors: {
        // 主色调
        primary: {
          DEFAULT: 'var(--color-primary-main)',
          on: 'var(--color-primary-on)',
          container: 'var(--color-primary-container)',
          'on-container': 'var(--color-primary-onContainer)',
        },
        // 次要色
        secondary: {
          DEFAULT: 'var(--color-secondary-main)',
          on: 'var(--color-secondary-on)',
          container: 'var(--color-secondary-container)',
          'on-container': 'var(--color-secondary-onContainer)',
        },
        // 强调色
        tertiary: {
          DEFAULT: 'var(--color-tertiary-main)',
          on: 'var(--color-tertiary-on)',
          container: 'var(--color-tertiary-container)',
          'on-container': 'var(--color-tertiary-onContainer)',
        },
        // 错误色
        error: {
          DEFAULT: 'var(--color-error-main)',
          on: 'var(--color-error-on)',
          container: 'var(--color-error-container)',
          'on-container': 'var(--color-error-onContainer)',
        },
        // 成功色
        success: {
          DEFAULT: 'var(--color-success-main)',
          on: 'var(--color-success-on)',
          container: 'var(--color-success-container)',
          'on-container': 'var(--color-success-onContainer)',
        },
        // 警告色
        warning: {
          DEFAULT: 'var(--color-warning-main)',
          on: 'var(--color-warning-on)',
          container: 'var(--color-warning-container)',
          'on-container': 'var(--color-warning-onContainer)',
        },
        // 信息色
        info: {
          DEFAULT: 'var(--color-info-main)',
          on: 'var(--color-info-on)',
          container: 'var(--color-info-container)',
          'on-container': 'var(--color-info-onContainer)',
        },
        // 表面色
        surface: {
          DEFAULT: 'var(--color-surface-main)',
          dim: 'var(--color-surface-dim)',
          bright: 'var(--color-surface-bright)',
          container: 'var(--color-surface-container)',
          'container-low': 'var(--color-surface-containerLow)',
          'container-high': 'var(--color-surface-containerHigh)',
          'container-highest': 'var(--color-surface-containerHighest)',
        },
        // 背景色
        background: 'var(--color-background)',
        'on-background': 'var(--color-onBackground)',
        // 轮廓色
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outlineVariant)',
        },
        // 文本色
        'on-surface': 'var(--color-text-primary)',
        'on-surface-variant': 'var(--color-text-secondary)',
        // 反色
        'inverse-surface': 'var(--color-surface-containerHighest)',
        'inverse-on-surface': 'var(--color-surface-containerLow)',

        // 保留旧的自定义颜色（向后兼容）
        'app-dark': '#0F111E',
        'card-dark': '#1E2235',
        'accent-purple': '#6366F1',
        'accent-pink': '#EC4899',
        'accent-yellow': '#EAB308',
        'accent-cyan': '#06B6D4',
        'accent-green': '#22C55E',
        'physical': '#3b82f6',
        'emotional': '#ef4444',
        'intellectual': '#10b981',
        'cosmic-dark': '#0a0b1e',
        'cosmic-navy': '#111432',
        'cosmic-purple': '#2d1b4d',
        'neon-yellow': '#fde047',
        'neon-blue': '#38bdf8',
        'neon-green': '#4ade80',
        'neon-pink': '#f472b6',
      },
      // Material Design 3 字体
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      // Material Design 3 圆角
      borderRadius: {
        'none': 'var(--border-radius-none)',
        'xs': 'var(--border-radius-xs)',
        'sm': 'var(--border-radius-sm)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'xl': 'var(--border-radius-xl)',
        'full': 'var(--border-radius-full)',
        '2xl': '18px',
        '3xl': '26px',
      },
      // Material Design 3 阴影
      boxShadow: {
        'elevation-0': 'var(--elevation-level0)',
        'elevation-1': 'var(--elevation-level1)',
        'elevation-2': 'var(--elevation-level2)',
        'elevation-3': 'var(--elevation-level3)',
        'elevation-4': 'var(--elevation-level4)',
        'elevation-5': 'var(--elevation-level5)',
      },
      // 动画
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'linear-progress': 'linearProgress 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        linearProgress: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
