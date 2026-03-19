
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'figma:asset/0b591b96a0d95274aec2c79ce5f7c8b0c0dbae09.png': path.resolve(__dirname, './src/assets/0b591b96a0d95274aec2c79ce5f7c8b0c0dbae09.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['motion'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});