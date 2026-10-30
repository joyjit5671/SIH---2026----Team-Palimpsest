/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B192C',
          800: '#1E3E62',
          700: '#2E5077',
        },
        aicte: {
          blue: '#1E40AF',
          gold: '#D97706',
          emerald: '#059669',
          danger: '#DC2626'
        }
      }
    },
  },
  plugins: [],
}
