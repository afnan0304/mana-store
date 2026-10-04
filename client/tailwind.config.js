/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        status: {
          available: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
          issued: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
          overdue: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
          maintenance: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
          damaged: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
          retired: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
