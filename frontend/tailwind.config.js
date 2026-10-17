/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060D1E',
          900: '#0A1530', // sidebar, map hero
          800: '#0F1E3D',
          700: '#14264F', // panels on dark
          600: '#1E356A',
          500: '#2A4685',
        },
        signal: {
          blue: '#1769FF', // primary actions, active nav
          'blue-hover': '#1358D6',
          'blue-light': '#EBF2FF',
          'blue-border': '#ADC8FF',
        },
        mist: '#EEF3FA', // page background
        card: '#FFFFFF',
        ink: {
          DEFAULT: '#0F1B33', // main text
          secondary: '#5B6B86', // Slate secondary text
          muted: '#8B9BB4',
        },
        slate: {
          DEFAULT: '#5B6B86',
          50: '#F7F9FC',
          100: '#EEF3FA',
          200: '#DCE4EF',
          300: '#BAC7D9',
          400: '#8B9BB4',
          500: '#5B6B86',
          600: '#435066',
          700: '#2E3847',
        },
        risk: {
          red: '#E5384D',
          'red-light': '#FDE8EA',
          orange: '#F59E0B',
          'orange-light': '#FEF3C7',
          yellow: '#F2C94C',
          'yellow-light': '#FEF9C3',
          green: '#22A06B',
          'green-light': '#DCFCE7',
        },
        flood: {
          teal: '#12A5A0', // rerouted and safe paths, recommended marker
          'teal-light': '#E6F8F7',
          'teal-dark': '#0E7E7A',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Noto Sans Kannada"',
          '"Noto Sans Devanagari"',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        'card': '16px',
        'badge': '6px',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(10, 21, 48, 0.06), 0 8px 24px -4px rgba(10, 21, 48, 0.08)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'dropdown': '0 10px 25px -5px rgba(10, 21, 48, 0.15), 0 8px 10px -6px rgba(10, 21, 48, 0.1)',
      },
    },
  },
  plugins: [],
}
