// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/TBRapp/',  // 👈 This is the important part
  plugins: [react()],
});

