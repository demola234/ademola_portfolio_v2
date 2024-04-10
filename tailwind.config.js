/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neutralWhite: "ffffff",
        neutralLight: "#B7B8BA",
        neutralMid: "#292A2B",
        neutralDefault: "#1C1D1E",
        neutralDarker: "#161718",
        neutralDarkest: "#000000",

        primaryDefault: "#8CC5E7", // rgb(94, 160, 159)

        redLight: "#fce9e8", //rgb(252, 233, 232)
        redSublte: "#f6bcb9", //rgb(246, 188, 185)
        redMid: "#eb6e67", //rgb(235, 110, 103)
        redDefault: "#e1261c", //rgb(225, 38, 28)
        redDark: "#a01b14", //rgb(160, 27, 20)
        redDarker: "#5f100c", //rgb(95, 16, 12)
        orangeLight: "#fcf2e6", //rgb(252, 242, 230)
        orangeSublte: "#f6d6b0", //rgb(246, 214, 176)
        orangeMid: "#eca754", //rgb(236, 167, 84)
        orangeDefault: "#e27c00", //rgb(226, 124, 0)
        orangeDark: "#a05800", //rgb(160, 88, 0)
        orangeDarker: "#5f3400", //rgb(95, 52, 0)
        purpleLight: "#ebebfc", //rgb(235, 235, 252)
        purpleSublte: "#c2c1f4", //rgb(194, 193, 244)
        purpleMid: "#7c7ae8", //rgb(124, 122, 232)
        purpleDefault: "#3b38dd", //rgb(59, 56, 221)
        purpleDark: "#2a289d", //rgb(42, 40, 157)
        purpleDarker: "#19185d", //rgb(25, 24, 93)
        greenLight: "#e9f6e9", //rgb(233, 246, 233)
        greenSublte: "#bae3bb", //rgb(186, 227, 187)
        greenMid: "#6ac36c", //rgb(106, 195, 108)
        greenDefault: "#21a624", //rgb(33, 166, 36)
        greenDark: "#17761a", //rgb(23, 118, 26)
        greenDarker: "#0e460f", //rgb(14, 70, 15)
        blueLight: "#e9f4ff", //rgb(233, 244, 255)
        blueSublte: "#b9ddff", //rgb(185, 221, 255)
        blueMid: "#68b5ff", //rgb(104, 181, 255)
        blueDefault: "#1e90ff", //rgb(30, 144, 255)
        blueDark: "#1566b5", //rgb(21, 102, 181)
        blueDarker: "#0d3c6b", //rgb(13, 60, 107)
      },
    },
  },
  plugins: [],
};
