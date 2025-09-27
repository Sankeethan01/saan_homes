/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-rubik)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1b4965',
          50: '#f0f7fc',
          100: '#dbeaf6',
          200: '#bdd8ee',
          300: '#90bde1',
          400: '#5fa8d3',
          500: '#3b8ec5',
          600: '#1b4965',
          700: '#1a5a7a',
          800: '#194b63',
          900: '#193f54',
          950: '#0d2938',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)',
      },
      animation: {
        'loading-bar': 'loading 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-fast': 'pulse-opacity 1.5s ease-in-out infinite',
      },
      keyframes: {
        loading: {
          '0%': { width: '30%', transform: 'translateX(-80%)' },
          '50%': { width: '70%', transform: 'translateX(0%)' },
          '100%': { width: '100%', transform: 'translateX(0%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-opacity': {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        }
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.animation-delay-600': {
          'animation-delay': '600ms',
        },
      }
      addUtilities(newUtilities)
    },
  ],
} 