/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
      },
      colors: {
        neon: {
          cyan: '#00E5FF',
          green: '#00FF87',
          amber: '#FFB300',
          red: '#FF3D71',
          purple: '#9B59B6',
        },
        surface: {
          dark: '#0A0F1E',
          card: '#0F1629',
          border: '#1E2D4D',
          hover: '#162038',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E2D4D' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'counter': 'counter 1s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.3)' }, '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.7)' } },
      }
    },
  },
  plugins: [],
}
