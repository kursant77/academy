import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// __dirname yaratish ESM uchun
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
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false, // Production da sourcemap o'chiriladi
    minify: 'esbuild', // Esbuild minifier (default, terser kerak emas)
    target: 'esnext', // Modern browsers uchun
    cssMinify: 'esbuild', // CSS minification
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunklar
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('wouter')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Boshqa vendor'lar
            return 'vendor';
          }
        },
        // Chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // CSS code splitting
    cssCodeSplit: true,
    // Compression
    reportCompressedSize: true,
    // Tree shaking
    terserOptions: {
      compress: {
        drop_console: import.meta.env.PROD, // Console.log'larni production'da o'chirish
        drop_debugger: true,
        pure_funcs: import.meta.env.PROD ? ['console.log', 'console.info'] : [],
      },
    },
  },
  server: {
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Preview server (production preview)
  preview: {
    port: 4173,
    strictPort: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@supabase/supabase-js',
      'date-fns',
      'zod',
    ],
    exclude: ['@tanstack/react-query'],
  },
  // Performance optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
});
