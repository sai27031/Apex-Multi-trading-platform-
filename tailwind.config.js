/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          primary: '#3b82f6',
          'primary-hover': '#2563eb',
          cyan: '#0ea5e9'
        },
        slate: {
          950: '#070a11',
          900: '#0b0f19',
          850: '#111827',
          800: '#1e293b',
          750: '#283347',
          700: '#334155',
          600: '#475569',
          400: '#94a3b8',
          300: '#cbd5e1',
          100: '#f1f5f9',
          50: '#f8fafc'
        },
        gain: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.28)'
        },
        loss: {
          DEFAULT: '#f43f5e',
          hover: '#e11d48',
          light: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.28)'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
