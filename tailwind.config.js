/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "red-vivid": {
          50: "#FFE3E3",
          100: "#FFBDBD",
          200: "#FF9B9B",
          300: "#F86A6A",
          400: "#EF4E4E",
          500: "#E12D39",
          600: "#CF1124",
          700: "#AB091E",
          800: "#8A041A",
          900: "#610316",
        },
        yellow: {
          50: "#FFFAEB",
          100: "#FCEFC7",
          200: "#F8E3A3",
          300: "#F9DA8B",
          400: "#F7D070",
          500: "#E9B949",
          600: "#C99A2E",
          700: "#A27C1A",
          800: "#7C5E10",
          900: "#513C06",
        },
        "cool-grey": {
          50: "#F5F7FA",
          100: "#E4E7EB",
          200: "#CBD2D9",
          300: "#9AA5B1",
          400: "#7B8794",
          500: "#616E7C",
          600: "#52606D",
          700: "#3E4C59",
          800: "#323F4B",
          900: "#1F2933",
        },
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        7: "48px",
        8: "64px",
        9: "96px",
        10: "128px",
        11: "180px",
        12: "240px",
        13: "320px",
        14: "480px",
        15: "640px",
        16: "920px",
        17: "1080px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        Courier: ["courier-std", "monospace"],
        inter: ["var(--font-inter)"],
        Poppins: ["var(--font-poppins)"],
        RobotoMono: ["var(--font-roboto-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
