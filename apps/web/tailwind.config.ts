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
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        "success-muted": "hsl(var(--success-muted))",
        "success-foreground": "hsl(var(--success-foreground))",
        "warning-muted": "hsl(var(--warning-muted))",
        "warning-foreground": "hsl(var(--warning-foreground))",
        "danger-muted": "hsl(var(--danger-muted))",
        "danger-foreground": "hsl(var(--danger-foreground))",

        "primary-scale": {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "calc(var(--radius) + 2px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
      },
      boxShadow: {
        "elev-1": "0 1px 2px hsl(220 40% 2% / 0.06), 0 8px 20px hsl(220 40% 2% / 0.06)",
        "elev-2": "0 2px 6px hsl(220 40% 2% / 0.10), 0 16px 40px hsl(220 40% 2% / 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
