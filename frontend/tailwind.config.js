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
          950: '#040814', // Deepest midnight void
          900: '#081026', // Command Navy primary background
          850: '#0C1736', // Tactical panel background
          800: '#0F1E3D', // Elevated card background
          750: '#14274E',
          700: '#183060', // Crisp fine border
          600: '#224282',
          500: '#2E58A8',
        },
        charcoal: {
          950: '#050810',
          900: '#090E1A',
          800: '#111A2C',
          700: '#1A2740',
        },
        signal: {
          blue: '#00E5FF', // Electric cyan for live telemetry and active controls
          'blue-hover': '#00B8D4',
          'blue-light': 'rgba(0, 229, 255, 0.12)',
          'blue-border': 'rgba(0, 229, 255, 0.35)',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          electric: '#00E5FF',
          glow: 'rgba(0, 229, 255, 0.4)',
          dim: '#0097A7',
        },
        mist: '#050B18', // Deep midnight page background
        card: '#0A1530', // Command center translucent glass card
        ink: {
          DEFAULT: '#F1F5F9', // Soft white primary text
          secondary: '#8FA2BE', // Muted slate secondary text
          muted: '#62748E',
        },
        slate: {
          DEFAULT: '#8FA2BE',
          50: '#0B1736',
          100: '#0F204A',
          200: '#183060', // Dark subtle borders
          300: '#274785',
          400: '#62748E',
          500: '#8FA2BE',
          600: '#B0C2DC',
          700: '#CBD5E1',
          800: '#E2E8F0',
          900: '#F1F5F9',
        },
        risk: {
          red: '#FF3B53', // Coral red exclusively for severe flood-risk indicators
          'red-light': 'rgba(255, 59, 83, 0.16)',
          orange: '#F59E0B', // Controlled amber for warnings
          'orange-light': 'rgba(245, 158, 11, 0.16)',
          yellow: '#EAB308',
          'yellow-light': 'rgba(234, 179, 8, 0.16)',
          green: '#10B981',
          'green-light': 'rgba(16, 185, 129, 0.16)',
        },
        flood: {
          teal: '#00E5FF', // Rerouted and safe paths, electric cyan
          'teal-light': 'rgba(0, 229, 255, 0.12)',
          'teal-dark': '#0097A7',
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
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        'card': '16px',
        'badge': '6px',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(56, 189, 248, 0.1)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 229, 255, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'dropdown': '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(0, 229, 255, 0.2)',
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.35)',
        'coral-glow': '0 0 20px rgba(255, 59, 83, 0.4)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
}
