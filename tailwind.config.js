/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          raised: '#141420',
          overlay: '#1e1e2e',
        },
        accent: {
          amber: '#f59e0b',
          teal: '#14b8a6',
          cream: '#fef3c7',
        },
      },
    },
  },
  plugins: [],
}
