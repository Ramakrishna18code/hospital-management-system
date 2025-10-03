const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        patients: resolve(__dirname, 'patients.html'),
        doctors: resolve(__dirname, 'doctors.html'),
        inventory: resolve(__dirname, 'inventory.html'),
        reports: resolve(__dirname, 'reports.html')
      },
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});