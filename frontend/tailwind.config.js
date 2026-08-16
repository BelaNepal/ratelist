/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0b132b',
          800: '#1c2541',
          700: '#2a3b5c',
          600: '#3a506b',
          500: '#486581',
          50: '#f0f4f8'
        },
        bela: {
          navy: '#0f172a',
          primary: '#1e293b',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          bg: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
