/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e64919",
        "bg-light": "#f8f6f6",
        "bg-dark": "#211511",
        "text-main": "#1b110e",
        "text-muted": "#975f4e",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
