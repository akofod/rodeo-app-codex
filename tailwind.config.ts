import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6e8',
          100: '#f9e9c1',
          200: '#f4d490',
          300: '#efb85b',
          400: '#e89b33',
          500: '#d97f1b',
          600: '#b66216',
          700: '#8f4b14',
          800: '#6a3713',
          900: '#4a2610',
        },
        night: {
          900: '#0b0e0a',
          800: '#11160f',
          700: '#162014',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(216, 127, 27, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
