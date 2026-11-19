/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#0d3b2c',
          900: '#08231a',
          950: '#04130e',
        },
        gold: {
          200: '#fef08a',
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        card: {
          bg: '#0a2e23',
          border: 'rgba(34, 197, 94, 0.2)',
          hover: '#0e3a2d',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-green': '0 0 25px rgba(34, 197, 94, 0.35)',
      }
    },
  },
  plugins: [],
}
