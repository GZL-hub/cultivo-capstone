/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        figtree: ['var(--font-figtree)', 'sans-serif'],
        'noto-sans': ['var(--font-noto-sans)', 'sans-serif'],
      },
      colors: {
        text: 'var(--text)',
        background: 'var(--background)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: '#f4f9f0',
          100: '#e6f3dc',
          200: '#cfe7bc',
          300: '#afd692',
          400: '#8fc468',
          500: '#37621e', // Main primary color
          600: '#2e5119',
          700: '#254014',
          800: '#1c300f',
          900: '#13200a',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          50: '#f7fef4',
          100: '#ecfce5',
          200: '#d9f8cb',
          300: '#b8f29d',
          400: '#a1dc7f', // Main secondary color
          500: '#7bc955',
          600: '#5da73c',
          700: '#488230',
          800: '#3c6729',
          900: '#335625',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          50: '#f2fde9',
          100: '#e1fbc9',
          200: '#c8f89a',
          300: '#a8f160',
          400: '#67c431', // Main accent color
          500: '#5cb02a',
          600: '#479220',
          700: '#38711c',
          800: '#2f5a1b',
          900: '#294c1a',
        },
      },
    },
  },
  plugins: [],
};