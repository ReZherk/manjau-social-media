import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutrals (prototype palette)
        background: '#FCF8F6',
        surface: '#FFFFFF',
        sidebar: '#FFF7FA',
        'input-bg': '#F8F0F7',
        border: '#F0E3E8',
        overlay: 'rgba(63, 49, 57, 0.32)',
        text: {
          DEFAULT: '#3F333A',
          muted: '#998B95',
        },
        // Accent scale
        lavender: {
          DEFAULT: '#9D79D0',
          soft: '#F1E7FB',
        },
        pink: {
          DEFAULT: '#D45A88',
          soft: '#FDE7EF',
        },
        mint: {
          DEFAULT: '#3F9E86',
          soft: '#DBF1EB',
        },
        peach: {
          DEFAULT: '#EFA467',
          soft: '#FFF0E4',
        },
        blue: {
          DEFAULT: '#5D8CE5',
          soft: '#EAF1FF',
        },
        // Semantic aliases (keep existing class names working, restyled)
        primary: {
          DEFAULT: '#A477CF',
          hover: '#9569C4',
        },
        purple: {
          DEFAULT: '#9D79D0',
          soft: '#F1E7FB',
        },
        success: {
          DEFAULT: '#2F9E86',
          soft: '#DBF1EB',
        },
        'soft-pink': '#F3ECF8',
        wine: {
          DEFAULT: '#6D5570',
          dark: '#5A4560',
        },
        danger: '#EA5B65',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Great Vibes', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(81, 57, 73, 0.06)',
        card: '0 10px 30px rgba(81, 57, 73, 0.08)',
        dialog: '0 22px 55px rgba(59, 39, 54, 0.25)',
      },
      spacing: {
        sidebar: '250px',
        topbar: '56px',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, #A477CF, #CF5D87)',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(calc(100% + 1rem))' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        slideIn: 'slideIn 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
