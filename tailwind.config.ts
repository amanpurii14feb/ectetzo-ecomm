import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#17191c", volt: "#f6b800", paper: "#f7f7f5" },
      boxShadow: { soft: "0 10px 35px rgba(23,25,28,.08)" },
    },
  },
  plugins: [],
} satisfies Config;
