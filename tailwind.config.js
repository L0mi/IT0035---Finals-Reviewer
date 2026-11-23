/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#080b14',
        panel: '#111625',
        line: '#252c40',
        violet: '#9b87f5',
        cyan: '#36d8ed',
      },
      boxShadow: { glow: '0 0 40px rgba(54,216,237,.08)' },
    },
  },
  plugins: [],
}
