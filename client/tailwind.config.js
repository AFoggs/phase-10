/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#1a1f36',
        'card-red': '#e74c3c',
        'card-blue': '#3498db',
        'card-green': '#2ecc71',
        'card-yellow': '#f1c40f',
        'card-skip': '#c0392b',
        'accent-gold': '#f39c12',
      },
      animation: {
        'bounce-in': 'bounceIn 0.3s ease-out',
        'pulse-turn': 'pulseTurn 1s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'dice-roll': 'diceRoll 0.5s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseTurn: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(243, 156, 18, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(243, 156, 18, 0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        diceRoll: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
