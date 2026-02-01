/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          accent: '#8b5cf6',
          accent2: '#f59e0b',
          win: '#22c55e',
          lose: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
