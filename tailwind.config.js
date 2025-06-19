/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 메종 마르지엘라 실험실 컬러 팔레트
        lab: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            100: '#F8F8F8',
            200: '#E8E8E8',
            300: '#D8D8D8',
            400: '#B8B8B8',
            500: '#888888',
            600: '#666666',
            700: '#444444',
            800: '#222222',
            900: '#111111',
          },
          beige: '#F5F3F0',
          cream: '#FDF8F3',
          paper: '#FFFEF7',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        serif: ['Times New Roman', 'serif'],
        sans: ['Arial', 'sans-serif'],
      },
      backgroundImage: {
        'grid-paper': `
          linear-gradient(to right, #e5e5e5 1px, transparent 1px),
          linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
        `,
        'lab-texture': `
          url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")
        `,
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 