import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app source lives under docs/demo, so that folder is the Vite root.
// Production builds are emitted to dist/ at the repository root.
export default defineConfig({
  root: 'docs/demo',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
