/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enables toggling dark mode manually via a 'dark' class on the parent div
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
