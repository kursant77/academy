import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,

    // 🔥 MUHIM: React hech qachon split qilinmaydi
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // ❗React hech qachon split qilinmasin
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react/jsx-runtime")
          ) {
            return "react"; // bitta chunk
          }

          // 🔥 Qolgan vendorlar xohlasang split qilinadi
          if (id.includes("wouter")) return "router";
          if (id.includes("@radix-ui")) return "ui";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("recharts")) return "charts";
          if (
            id.includes("date-fns") ||
            id.includes("zod") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "utils";
          }
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("i18next")) return "i18n";

          return "vendor";
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "wouter",
      "@supabase/supabase-js",
      "date-fns",
      "zod",
      "clsx",
      "tailwind-merge",
    ],
    exclude: ["@tanstack/react-query"],
  },
});
