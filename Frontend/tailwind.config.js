/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fanora v2 — warm gold on near-black
        primary: {
          50: '#FBF6E8',
          100: '#F5EBCE',
          200: '#EDD9A0',
          300: '#E9C46A', // accent
          400: '#D4AE52', // accent-press
          500: '#E9C46A',
          600: '#D4AE52',
          700: '#B8943F',
          800: '#9A7A32',
          900: '#7C6128',
        },
        secondary: {
          50: '#F5F6F8',
          100: '#E8EAEE',
          200: '#C5C9D2',
          300: '#8A8F9C', // text-muted
          400: '#6B7080',
          500: '#4A4F5C',
          600: '#353945',
          700: '#252830',
          800: '#1C202B', // bg-elevated
          900: '#15181F', // bg-surface
        },
        navy: {
          50: '#F5F6F8',
          100: '#E8EAEE',
          200: '#C5C9D2',
          300: '#8A8F9C',
          400: '#6B7080',
          500: '#4A4F5C',
          600: '#353945',
          700: '#252830',
          800: '#1C202B',
          900: '#0B0D12', // bg-primary
        },
        charcoal: {
          50: '#F5F6F8',
          100: '#E8EAEE',
          200: '#C5C9D2',
          300: '#8A8F9C',
          400: '#6B7080',
          500: '#4A4F5C',
          600: '#353945',
          700: '#252830',
          800: '#1C202B',
          900: '#0B0D12',
        },
        success: {
          50: '#f0fdf4',
          500: '#4ADE80',
          600: '#22c55e',
        },
        warning: {
          50: '#fffbeb',
          500: '#E9C46A',
          600: '#D4AE52',
        },
        error: {
          50: '#fef2f2',
          500: '#E85C5C',
          600: '#dc2626',
        },
        ethiopian: {
          green: '#009639',
          yellow: '#FEDD00',
          red: '#CE1126',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
        sheet: '24px',
        pill: '999px',
      },
      transitionDuration: {
        DEFAULT: '220ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ethiopian-flag': 'linear-gradient(to bottom, #009639 33.33%, #FEDD00 33.33% 66.66%, #CE1126 66.66%)',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [forms],
}
