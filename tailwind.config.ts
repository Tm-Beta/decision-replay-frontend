import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // 60-30-10 Brand Identity Tokens
        cream: {
          50: "#FDFCF9",
          100: "#FAF6ED",
          200: "#F4EBD9",
          300: "#EADEC7",
          400: "#DECDB0",
        },
        plum: {
          50: "#F9F3F8",
          100: "#F3E6F2",
          200: "#E6CFE4",
          300: "#D2A8CE",
          500: "#8B3A86",
          700: "#5D225A",
          800: "#4B1A49",
          900: "#311430",
          950: "#1A0919",
        },
        spring: {
          300: "#4EFAAF",
          400: "#10E594",
          500: "#00D27F",
          600: "#00B36B",
          700: "#008F55",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(49, 20, 48, 0.08)",
        plum: "0 10px 30px -10px rgba(75, 26, 73, 0.15)",
        spring: "0 0 25px -4px rgba(0, 210, 127, 0.35)",
        dock: "0 12px 40px -10px rgba(49, 20, 48, 0.18)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-spring": "glowSpring 3s ease-in-out infinite alternate",
        "float": "float 5s ease-in-out infinite",
      },
      keyframes: {
        glowSpring: {
          "0%": { boxShadow: "0 0 10px rgba(0, 210, 127, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 210, 127, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
