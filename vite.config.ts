import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    // Bundle optimization settings
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'state-vendor': ['zustand'],
          
          // Feature chunks
          'auth-features': [
            './src/ui/pages/LoginPage',
            './src/ui/pages/RegisterPage',
            './src/ui/layouts/AuthLayout',
            './src/repositories/authRepository',
            './src/stores/authStore',
          ],
          'service-features': [
            './src/ui/pages/ServicesPage',
            './src/repositories/serviceRepository',
            './src/stores/serviceStore',
          ],
          'booking-features': [
            './src/ui/pages/BookingsPage',
            './src/ui/pages/TransactionHistoryPage',
            './src/repositories/bookingRepository',
            './src/stores/bookingStore',
          ],
          'profile-features': [
            './src/ui/pages/ProfilePage',
            './src/repositories/userRepository',
            './src/stores/userStore',
          ],
        },
        // Optimize chunk file names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Source maps for debugging
    sourcemap: false, // Disable in production for smaller bundles
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4KB
  },
  // Development optimizations
  server: {
    // Enable HTTP/2 for better performance
    https: false,
    // Optimize HMR
    hmr: {
      overlay: true,
    },
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'zustand',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Performance hints
  define: {
    // Enable production optimizations
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})