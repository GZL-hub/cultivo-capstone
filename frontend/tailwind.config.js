/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        figtree: ['var(--font-figtree)', 'sans-serif'],
        'noto-sans': ['var(--font-noto-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};