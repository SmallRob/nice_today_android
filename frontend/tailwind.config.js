/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 添加这行来启用基于class的暗黑模式
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark': '#0F111E',      // 极深背景
        'card-dark': '#1E2235',     // 卡片底色
        'accent-purple': '#6366F1', // 顶部渐变主色
        'accent-pink': '#EC4899',   // 能量条粉色
        'accent-yellow': '#EAB308', // 能量条黄色
        'accent-cyan': '#06B6D4',   // 能量条青色
        'accent-green': '#22C55E',  // 能量条绿色
        'physical': '#3b82f6', // 蓝色
        'emotional': '#ef4444', // 红色
        'intellectual': '#10b981', // 绿色
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '26px',
      }
    },
  },
  plugins: [],
}