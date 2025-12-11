import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// __dirname yaratish ESM uchun
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
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
      sourcemap: false, // Production da sourcemap o'chiriladi
      minify: 'esbuild', // Esbuild minifier (default, terser kerak emas)
      target: 'esnext', // Modern browsers uchun
      cssMinify: 'esbuild', // CSS minification
      // Ensure proper module format and preloading
      modulePreload: {
        polyfill: true,
        resolveDependencies: (filename, deps) => {
          // Ensure React dependencies are preloaded first
          return deps;
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunklar - optimal code splitting
            if (id.includes('node_modules')) {
              // React core - DON'T split React, keep it in main bundle for reliability
              // This ensures React is always available when code executes
              if (id.includes('react') || id.includes('react-dom')) {
                return undefined; // Keep React in main bundle
              }
              // Router (depends on React) - can be split
              if (id.includes('wouter')) {
                return 'router-vendor';
              }
              // UI libraries (depend on React)
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // Animation library (heavy)
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              // Charts library (heavy)
              if (id.includes('recharts')) {
                return 'charts-vendor';
              }
              // Utils
              if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'utils-vendor';
              }
              // Supabase
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              // React Query (depends on React)
              if (id.includes('@tanstack')) {
                return 'query-vendor';
              }
              // i18n (depends on React)
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n-vendor';
              }
              // Boshqa vendor'lar
              return 'vendor';
            }
          },
          // Chunk naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = 'name' in assetInfo && assetInfo.name ? assetInfo.name : '';
            if (!name) {
              return `assets/[name]-[hash][extname]`;
            }
            const info = name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[ext]/[name]-[hash][extname]`;
          },
          // Compact output for smaller bundles (production only)
          ...(isProduction && {
            compact: true,
            generatedCode: {
              preset: 'es2015',
              constBindings: true,
            },
          }),
        },
      },
      // Chunk size warning limit (KB)
      chunkSizeWarningLimit: 500,
      // CSS code splitting
      cssCodeSplit: true,
      // Compression
      reportCompressedSize: true,
      // Build optimizations
      assetsInlineLimit: 4096, // 4KB dan kichik fayllarni inline qilish
      // Tree shaking is handled by esbuild automatically
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
        'react/jsx-runtime',
        'wouter',
        '@supabase/supabase-js',
        'date-fns',
        'zod',
        'clsx',
        'tailwind-merge',
      ],
      exclude: ['@tanstack/react-query'],
      // Force optimization for better performance
      force: false,
      // Ensure React is properly optimized
      esbuildOptions: {
        target: 'esnext',
      },
    },
    // Performance optimizations
    esbuild: {
      legalComments: 'none',
      treeShaking: true,
      // Minify identifiers
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
      // Drop console and debugger in production
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  };
});
