// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/tackle-tbr/',  // 👈 This is the important part
  plugins: [react()],
});

