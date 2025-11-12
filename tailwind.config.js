/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./success.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#145214',
          dark: '#0d3d0d',
          light: '#1a6b1a',
        },
        expired: '#f59e0b',
        error: '#dc3545',
      },
      screens: {
        'xs': '360px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
      },
    },
  },
  plugins: [],
}
