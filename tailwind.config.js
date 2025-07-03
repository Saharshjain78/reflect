/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5f1',
          100: '#deeadf',
          200: '#bedbbe',
          300: '#9ac49a',
          400: '#77ab78',
          500: '#4D7C5F', // Main primary color
          600: '#3e6b4f',
          700: '#325a42',
          800: '#294836',
          900: '#213d2d',
          950: '#132519',
        },
        secondary: {
          50: '#f5f3fa',
          100: '#ece8f6',
          200: '#dad1ed',
          300: '#c2b4e1',
          400: '#A092D6', // Main secondary color
          500: '#8771c8',
          600: '#7258bb',
          700: '#6347a6',
          800: '#523c88',
          900: '#45336f',
          950: '#2b2144',
        },
        accent: {
          50: '#fef4ee',
          100: '#fde9dc',
          200: '#fbcfb7',
          300: '#f8b195', // Main accent color
          400: '#f58b64',
          500: '#f16534',
          600: '#e24d18',
          700: '#bc3e13',
          800: '#973415',
          900: '#7b3014',
          950: '#41170a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};