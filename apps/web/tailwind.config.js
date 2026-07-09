/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        brand: {
          50: "#eef7f4",
          100: "#d8ede6",
          200: "#b3dbcd",
          300: "#8bc4b2",
          400: "#5ea894",
          500: "#2f8f78",
          600: "#267763",
          700: "#235f52",
          800: "#1c4e42",
          900: "#143c33"
        },
        saffron: "#c68a2d",
        danger: "#b84040"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};
