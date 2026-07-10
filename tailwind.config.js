/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary burgundy family, the "header" is just a darker step of the same hue,
        burgundy: {
          DEFAULT: "#5C1120", // primary
          deep: "#3C0A15",    // hero / panels
          dark: "#240609",    // header = darker step of the same burgundy
        },
        gold: {
          DEFAULT: "#B8912F",
          light: "#D9B65C",
          pale: "#EAD9A8",
        },
        cream: "#F4E9D6",
        ivory: "#FBF5E9",
        ink: "#241014",
      },
      fontFamily: {
        display: ["Amiri", "Georgia", "serif"],
        script: ["Tangerine", "cursive"],
        body: ["Jost", "sans-serif"],
      },
    },
  },
  plugins: [],
};
