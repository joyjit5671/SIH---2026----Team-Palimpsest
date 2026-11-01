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
        charcoal: {
          950: '#060709',
          900: '#0A0C10',
          850: '#0F1217',
          800: '#151921',
          750: '#191E28',
          700: '#1D222D',
          600: '#2A313E',
        },
        wine: {
          950: '#1A0508',
          900: '#2A0910',
          800: '#3D0C17',
          700: '#561120',
          600: '#72172B',
          500: '#8F1E36',
          400: '#A6243E',
          300: '#C23E59',
        },
        platinum: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
        }
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wine-radial': 'radial-gradient(circle at 50% 25%, rgba(128, 0, 32, 0.28) 0%, rgba(10, 12, 16, 0.96) 65%, #060709 100%)',
        'subtle-grid': 'linear-gradient(rgba(226, 232, 240, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(226, 232, 240, 0.025) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-wine': '0 0 35px -5px rgba(128, 0, 32, 0.45)',
        'glow-platinum': '0 0 30px -5px rgba(226, 232, 240, 0.18)',
        'glass-island': '0 16px 40px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
