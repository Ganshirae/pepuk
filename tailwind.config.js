/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0A2518',
          forest: '#114B2C',
          emerald: '#15803D',
          hover: '#0E3B22',
          light: '#F2F8F4',
          border: '#D1E3D7'
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617'
        },
        amber: {
          warning: '#B45309',
          light: '#FFFBEB',
          border: '#FDE68A'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace']
      },
      borderRadius: {
        'gov': '4px',
        'subtle': '6px'
      }
    },
  },
  plugins: [],
}
