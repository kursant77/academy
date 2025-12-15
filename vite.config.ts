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
    sourcemap: false, // Production'da sourcemap o'chiriladi
    minify: 'terser', // Terser minification
    terserOptions: {
      compress: {
        drop_console: true, // console.log'larni o'chirish
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Ko'proq compression
        unsafe: true, // Agressiv optimizatsiya
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Comments'ni o'chirish
      },
    },
    // React-in düzgün yüklənməsi üçün
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    // Chunk size warnings - kichikroq limit
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inline limit - kichik fayllarni inline qilish
    assetsInlineLimit: 4096, // 4KB dan kichik fayllar inline
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Report compressed size
    reportCompressedSize: true,
    // 🔥 MUHIM: React hech qachon split qilinmaydi - MAIN BUNDLE'DA QOLMALIDIR
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Source code həmişə main bundle'da qalır
          if (!id.includes("node_modules")) {
            return;
          }

          // ❗CRITICAL: React va React-dom HEÇ VAXT SPLIT QILINMASIN!
          // Dəqiq path yoxlaması - yalnız react və react-dom paketləri
          // undefined qaytararaq main bundle'da qoldurur
          const isReact = 
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/jsx-runtime") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/use-sync-external-store/");
          
          if (isReact) {
            return; // undefined = main bundle'da qalır
          }
          
          // react-i18next kimi paketləri exclude et (onlar split oluna bilər)
          if (id.includes("react-i18next")) {
            return "i18n";
          }

          // 🔥 Qolgan vendorlar split qilinadi - yanada kichik chunk'lar
          if (id.includes("wouter")) return "router";
          
          // Radix UI - katta library, alohida chunk
          if (id.includes("@radix-ui")) {
            // Har bir Radix komponentini alohida chunk'ga ajratish
            if (id.includes("@radix-ui/react-dialog")) return "ui-dialog";
            if (id.includes("@radix-ui/react-select")) return "ui-select";
            if (id.includes("@radix-ui/react-dropdown")) return "ui-dropdown";
            if (id.includes("@radix-ui/react-tabs")) return "ui-tabs";
            if (id.includes("@radix-ui/react-toast")) return "ui-toast";
            return "ui-radix";
          }
          
          // Framer Motion - katta library
          if (id.includes("framer-motion")) return "motion";
          
          // Recharts - faqat admin'da ishlatiladi, lazy load
          if (id.includes("recharts")) return "charts";
          
          // Utils - kichik library'lar
          if (
            id.includes("date-fns") ||
            id.includes("zod") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge") ||
            id.includes("class-variance-authority")
          ) {
            return "utils";
          }
          
          // Supabase - alohida chunk
          if (id.includes("@supabase")) return "supabase";
          
          // React Query - alohida chunk
          if (id.includes("@tanstack")) return "query";
          
          // i18n - alohida chunk
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          
          // Lucide icons - katta library
          if (id.includes("lucide-react")) return "icons";
          
          // React icons - katta library
          if (id.includes("react-icons")) return "icons-react";
          
          // Embla carousel
          if (id.includes("embla-carousel")) return "carousel";
          
          // Form libraries
          if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
          
          // Qolgan kichik vendor'lar
          if (id.includes("node_modules")) {
            // Katta library'larni alohida chunk'ga ajratish
            if (id.includes("react-day-picker")) return "date-picker";
            if (id.includes("cmdk")) return "command";
            if (id.includes("vaul")) return "drawer";
            if (id.includes("embla-carousel")) return "carousel";
            if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
            if (id.includes("next-themes")) return "theme";
            if (id.includes("react-resizable-panels")) return "panels";
            // Kichik utility library'lar
            if (id.includes("input-otp")) return "utils";
            if (id.includes("zod-validation-error")) return "utils";
            // Qolgan vendor'lar
            return "vendor";
          }

          return undefined;
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
    exclude: [
      "@tanstack/react-query",
      "recharts", // Faqat admin'da ishlatiladi, lazy load
    ],
    // Esbuild optimizatsiyasi
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
