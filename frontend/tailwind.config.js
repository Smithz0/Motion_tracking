/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports dark mode toggle
  theme: {
    extend: {
      colors: {
        // Deep premium space tones for dark backgrounds (preserved for backward compatibility)
        brand: {
          dark: '#030712',
          cardDark: '#0b0f19',
          light: '#f8fafc',
          cardLight: '#ffffff',
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          950: '#1e1b4b',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // NEW Chosen Life Design Tokens
        gold: {
          50: 'var(--color-gold-50)',
          100: 'var(--color-gold-100)',
          200: 'var(--color-gold-200)',
          300: 'var(--color-gold-300)',
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
          600: 'var(--color-gold-600)',
          700: 'var(--color-gold-700)',
          800: 'var(--color-gold-800)',
          900: 'var(--color-gold-900)',
        },
        charcoal: {
          50: 'var(--color-charcoal-50)',
          100: 'var(--color-charcoal-100)',
          200: 'var(--color-charcoal-200)',
          300: 'var(--color-charcoal-300)',
          400: 'var(--color-charcoal-400)',
          500: 'var(--color-charcoal-500)',
          600: 'var(--color-charcoal-600)',
          700: 'var(--color-charcoal-700)',
          800: 'var(--color-charcoal-800)',
          900: 'var(--color-charcoal-900)',
        },
        success: {
          DEFAULT: 'var(--success)',
          light: 'var(--success-light)',
          dark: 'var(--success-dark)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'var(--warning-light)',
          dark: 'var(--warning-dark)',
        },
        error: {
          DEFAULT: 'var(--error)',
          light: 'var(--error-light)',
          dark: 'var(--error-dark)',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'var(--info-light)',
          dark: 'var(--info-dark)',
        },
        chosen: {
          bg: 'var(--background)',
          surface: 'var(--surface)',
          raised: 'var(--surface-raised)',
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            muted: 'var(--text-muted)',
          },
          border: {
            DEFAULT: 'var(--border)',
            hover: 'var(--border-hover)',
          },
          focus: 'var(--focus)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'chosen-sm': 'var(--radius-sm)',
        'chosen-md': 'var(--radius-md)',
        'chosen-lg': 'var(--radius-lg)',
        'chosen-xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'premium': '0 10px 40px -10px rgba(139, 92, 246, 0.15)',
        'chosen-sm': 'var(--shadow-sm)',
        'chosen-md': 'var(--shadow-md)',
        'chosen-lg': 'var(--shadow-lg)',
        'chosen-floating': 'var(--shadow-floating)',
        'chosen-modal': 'var(--shadow-modal)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
