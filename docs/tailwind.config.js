/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*.{html,js}"],
  theme: {
    extend: {},
    screens: {
      //   xxs: { max: "389px", min: "0px" },
      xs: { max: "639px", min: "0px" },
      sm: { min: "640px", max: "767px" },
      md: { min: "768px", max: "1023px" },
      lg: { min: "1024px", max: "1279px" },
      xl: { min: "1280px", max: "1535px" },
      "2xl": { max: "1536px" },
    },
  },
  plugins: [],
};
