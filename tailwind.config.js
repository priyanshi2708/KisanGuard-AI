/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-forest': '#173F2A',
        'forest-green': '#286B3F',
        'leaf-green': '#65B741',
        'light-leaf': '#DDF2C8',
        'warm-cream': '#FFF9E9',
        'earth-brown': '#65452C',
        'soil-dark': '#3B2417',
        'golden-wheat': '#E7B84B',
        'sky-light': '#DDEFF4',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'organic': '0 10px 30px -5px rgba(23, 63, 42, 0.15)',
        'glow-green': '0 0 25px rgba(101, 183, 65, 0.4)',
        'glow-wheat': '0 0 20px rgba(231, 184, 75, 0.3)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'kenburns': 'kenburns 20s ease-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        kenburns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
