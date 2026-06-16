import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#d47241',
          blue: '#3e679f',
          dark: '#2e3b4b',
          'blue-light': '#eef2f8',
        },
      },
      keyframes: {
        revealIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        revealIn: 'revealIn 220ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
