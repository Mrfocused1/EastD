import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        lora: ['var(--font-lora)', 'serif'],
        roboto: ['var(--font-roboto)', 'sans-serif'],
        signature: ['var(--font-signatura)', 'cursive'],
      },
      colors: {
        background: "#fdfbf8",
        text: "#121316",
      },
    },
  },
  plugins: [],
};
export default config;
