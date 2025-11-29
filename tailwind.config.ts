import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        md: ".9rem", // Adjust as needed (17px here)
        xmd: "1rem", // Adjust as needed (18px here)
        lg: "1.1rem", // Adjust as needed (20px here)
        xl: "1.125rem", // Adjust as needed (22px here)
      },
      colors: {
        monzo: {
          error: "#FE4B60",
          brand: "#00626F",
          brandDark: "#00626F",
          success: "#047857",
          monzoGreen: "#4BB78F",
          monzoOrange: "#F1BD76",
          background: "#001E3A",
          primary: "#14233C",
          secondary: "#FFB54D",
          innerBg: "#868E9C67",
          textPrimary: "#F6F7FB",
          textSecondary: "#8E8E93",
        },
        "custom-blue": "#226DB4",
        sidebar: "#F1F4F9",
        brand: "#007A8B",
        brandDark: "#00626F",
        success: "#047857",
        warning: "#F59E0B",
        error: "#EF4444",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textDisabled: "#9CA3AF",
        textInverse: "#FFFFFF",
        background: "#E5E7EB",
        divider: "#E5E7EB",
        border: "#D1D5DB",
        buttonPrimary: "#3B5BCC",
        buttonPrimaryHover: "#4D70F9 ",
        buttonSecondary: "#E5E7EB",
        buttonSecondaryHover: "#D1D5DB",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        wave: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "grow-up": {
          "0%": { opacity: "0", transform: "scale(0.6) translateY(20px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "loading-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ball-1": "wave 1s ease-in-out infinite",
        "ball-2": "wave 1s ease-in-out infinite 0.15s",
        "ball-3": "wave 1s ease-in-out infinite 0.3s",
        "ball-4": "wave 1s ease-in-out infinite 0.45s",
        "spin-slow": "spin 1s linear infinite",
        "grow-up": "grow-up 0.3s ease-out",
        ".animate-loading-line": "loading-line 1.5s infinite linear",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
