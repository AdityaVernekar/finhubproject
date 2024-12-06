/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryPurple: '#742dd2',
        secondaryBlue: '#36c5f0',
        lightGray: '#f6f7f8',
        darkGray: '#2d2d2d',
        accentPink: '#ff4081',
        white: '#ffffff',
      },
    },
  },
  plugins: [],
}

