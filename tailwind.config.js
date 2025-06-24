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
        // 모노크롬 화이트 & 블랙 색상 팔레트
        mono: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
          950: '#171717',
        },
        // 글래스 효과 (모노크롬)
        glass: {
          white: 'rgba(255, 255, 255, 0.9)',
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(0, 0, 0, 0.1)',
          border: 'rgba(0, 0, 0, 0.08)',
          shadow: 'rgba(0, 0, 0, 0.05)',
        },
        // 상태 색상 (모노크롬)
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#525252',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        // 모노크롬 그라데이션들
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mono': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-subtle': 'linear-gradient(45deg, #fafafa 0%, #f5f5f5 25%, #ffffff 50%, #fafafa 75%, #f8fafc 100%)',
        'gradient-clean': 'radial-gradient(ellipse at center, #ffffff 0%, #fafafa 35%, #f5f5f5 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #525252 0%, #404040 100%)',
        'gradient-accent': 'linear-gradient(135deg, #262626 0%, #404040 100%)',
        
        // 배경 이미지들
        'lab-bg': 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("/images/backgrounds/lab-bg.png")',
        'clean-bg': 'linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url("/images/backgrounds/lab-bg.png")',
        
        // 패턴들
        'grid-subtle': "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
        'dots-light': "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        'paper': "linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
        'texture': "linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.01) 25%, rgba(0,0,0,0.01) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.01) 75%)",
      },
      backgroundSize: {
        'dots': '20px 20px',
        'grid': '40px 40px',
        'texture': '20px 20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow-soft': 'glowSoft 3s ease-in-out infinite alternate',
        'shimmer-light': 'shimmerLight 2s linear infinite',
        'pulse-soft': 'pulseSoft 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 3s infinite',
        'fade-subtle': 'fadeSubtle 2s ease-in-out infinite alternate',
        'wave': 'wave 1.2s ease-in-out infinite',
        'wave-fill': 'wave-fill 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowSoft: {
          '0%': { boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)' },
        },
        shimmerLight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeSubtle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.6' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(3)' },
        },
        'wave-fill': {
          '0%': { 
            width: '0%',
            transform: 'translateX(0%)'
          },
          '100%': { 
            width: '100%',
            transform: 'translateX(0%)'
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.10)',
        'mono': '0 4px 25px rgba(0, 0, 0, 0.12)',
        'floating-light': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'accent': '0 4px 20px rgba(38, 38, 38, 0.15)',
        'dark': '0 8px 25px rgba(0, 0, 0, 0.20)',
        'elegant': '0 2px 15px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.04)',
      },
      blur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 