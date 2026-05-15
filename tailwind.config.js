/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#eef6ff',
          100: '#d9ebff',
          700: '#0f3d67',
          800: '#0b3156',
          900: '#08243f',
          950: '#061a2e',
        },
        tosca: {
          50: '#ebfffb',
          100: '#cdfaf1',
          500: '#16b6a2',
          600: '#0c9284',
          700: '#0b746c',
        },
      },
      boxShadow: {
        panel: '0 16px 40px rgba(8, 36, 63, 0.08)',
      },
    },
  },
  plugins: [],
}
