/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// __dirname ESM uchun
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    root: path.resolve(__dirname),

    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: false,
      minify: "esbuild",
      target: "esnext",
      cssMinify: "esbuild",

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // ⚠ React — doim bitta chunk, hech qachon bo‘linmaydi!
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react/jsx-runtime")
            ) {
              return "react-core";
            }

            if (id.includes("wouter")) return "router-vendor";
            if (id.includes("@radix-ui")) return "ui-vendor";
            if (id.includes("framer-motion")) return "animation-vendor";
            if (id.includes("recharts")) return "charts-vendor";

            if (
              id.includes("date-fns") ||
              id.includes("zod") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "utils-vendor";
            }

            if (id.includes("@supabase")) return "supabase-vendor";
            if (id.includes("@tanstack")) return "query-vendor";

            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "i18n-vendor";
            }

            return "vendor";
          },

          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",

          assetFileNames(assetInfo) {
            const name = assetInfo.name || "";
            const parts = name.split(".");
            const lastIndex = parts.length - 1;
            const extValue = lastIndex >= 0 && parts[lastIndex] ? parts[lastIndex] : "";
            
            // Type guard funksiyası
            const testExtension = (pattern: RegExp, value: string): boolean => {
              return pattern.test(value);
            };

            if (extValue) {
              const imagePattern = /png|jpe?g|svg|gif|tiff|bmp|ico/i;
              const fontPattern = /woff2?|eot|ttf|otf/i;

              if (testExtension(imagePattern, extValue)) {
                return "assets/images/[name]-[hash][extname]";
              }

              if (testExtension(fontPattern, extValue)) {
                return "assets/fonts/[name]-[hash][extname]";
              }
            }

            return "assets/[ext]/[name]-[hash][extname]";
          },

          ...(isProduction && {
            compact: true,
            generatedCode: {
              preset: "es2015",
              constBindings: true,
            },
          }),
        },
      },

      chunkSizeWarningLimit: 500,
      cssCodeSplit: true,
      reportCompressedSize: true,

      assetsInlineLimit: 4096,
    },

    server: {
      port: 5173,
      fs: { strict: true, deny: ["**/.*"] },
    },

    preview: {
      port: 4173,
      strictPort: true,
    },

    optimizeDeps: {
      include: [
        "wouter",
        "@supabase/supabase-js",
        "date-fns",
        "zod",
        "clsx",
        "tailwind-merge",
      ],
      exclude: ["@tanstack/react-query"],
      esbuildOptions: { target: "esnext" },
    },

    esbuild: {
      legalComments: "none",
      treeShaking: true,
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
      drop: isProduction ? ["console", "debugger"] : [],
    },
  };
});
