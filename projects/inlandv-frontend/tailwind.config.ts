import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        goldLight: '#2E8C4F',
        goldDark: '#2E8C4F',
        primary: {
          50: '#ecf7f1',
          100: '#d9efe3',
          200: '#b2dfc7',
          300: '#8acfaa',
          400: '#63bf8e',
          500: '#3baf71',
          600: '#2E8C4F',
          700: '#23673b',
          800: '#184227',
          900: '#0e2415',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
      fontFamily: {
        // UI / Display Font - GMV DIN Pro (for headings, navigation, buttons, UI elements)
        sans: ['var(--font-gmv-din-pro)'],
        display: ['var(--font-gmv-din-pro)'],
        heading: ['var(--font-gmv-din-pro)'],
        ui: ['var(--font-gmv-din-pro)'],
        // Content / Reading Font - NotoSerif (for long-form content, articles, blog posts)
        serif: ['var(--font-noto-serif)'],
        content: ['var(--font-noto-serif)'],
        serifUi: ['var(--font-noto-serif)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
