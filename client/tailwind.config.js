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
    },
  },
  plugins: [],
} 