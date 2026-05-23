/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F6EF7',
          600: '#3B55E6',
          700: '#2B3FC0',
          800: '#1E3A8A',
          900: '#1E2A6E',
        },
        accent: '#0FA37F',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Sora"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
