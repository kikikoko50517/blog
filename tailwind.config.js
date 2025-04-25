/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./docs/**/*.{md,vue,ts,js}",
    "./docs/.vitepress/theme/**/*.{md,vue}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#1B1B1F",
      },
    },
  },
  plugins: [],
};
