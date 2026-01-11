/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Clash Display', 'sans-serif'],
        'body': ['Satoshi', 'sans-serif'],
      },
      colors: {
        'neon': {
          cyan: '#00f2ea',
          pink: '#ff006e',
          yellow: '#ffbe0b',
          green: '#00ff87',
        },
        'dark': {
          900: '#0a0a0b',
          800: '#121214',
          700: '#1a1a1f',
          600: '#252529',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 242, 234, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 242, 234, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
