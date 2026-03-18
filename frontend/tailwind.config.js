/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        naboplan: {
          blue: '#1d4ed8',
          teal: '#0d9488',
          yellow: '#f59e0b',
          green: '#16a34a',
        }
      }
    },
  },
  plugins: [],
}

