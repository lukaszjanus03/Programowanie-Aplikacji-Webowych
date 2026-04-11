/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'sans-serif'],
        mono: ["'Space Mono'", 'monospace'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.45s ease both',
        'toast-in': 'toastIn 0.3s ease',
        'pulse-glow': 'pulseGlow 2.5s infinite',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
        },
      },
    },
  },
  plugins: [],
};
