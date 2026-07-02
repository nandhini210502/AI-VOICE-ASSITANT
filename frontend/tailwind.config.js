/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
      },
      colors: {
        void: '#050508',
        surface: '#0d0d14',
        panel: '#12121c',
        border: '#1e1e2e',
        accent: {
          DEFAULT: '#7c6af7',
          soft: '#a89ef9',
          glow: '#5a4de6',
        },
        cyan: {
          voice: '#00d4ff',
          glow: '#0095b3',
        },
        emerald: {
          voice: '#00ff9d',
        },
        rose: {
          voice: '#ff4d8d',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'orb': 'orb 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        orb: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 40% 70% 60% 30%' },
          '75%': { borderRadius: '60% 40% 60% 40% / 70% 30% 50% 60%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
