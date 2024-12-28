import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          red : "#9A362F",
          green : "#13472F",
          green2 : "#0F5032",
          yellow : "#BE8B42",
          wheat : "#DCD8C5"
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
