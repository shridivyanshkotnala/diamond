/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A332E',
          dark: '#1B2E26',
          button: '#1A332E',
          nav: '#1E332E',
        },
        accent: {
          DEFAULT: '#D4C19C',
          gold: '#D4C19C',
          link: '#D4C19C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9F9F9',
          card: '#F3F3F3',
        },
        border: {
          DEFAULT: '#E0E0E0',
          light: '#E5E5EA',
        },
        text: {
          primary: '#000000',
          secondary: '#757575',
          muted: '#8E8E8E',
          placeholder: '#C4C4C4',
          label: '#717171',
        },
        success: {
          bg: '#E6F4EA',
          text: '#34A853',
        },
        danger: {
          bg: '#FCE8E6',
          text: '#EA4335',
        },
        tabInactive: '#F0F0F0',
      },
      borderRadius: {
        card: '24px',
        input: '10px',
        button: '10px',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
