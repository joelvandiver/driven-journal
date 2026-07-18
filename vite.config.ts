import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app source lives under docs/demo, so that folder is the Vite root.
// Production builds are emitted to dist/ at the repository root.
//
// For GitHub Pages the site is served from a project subpath
// (https://joelvandiver.github.io/driven-journal/), so the production base is
// set to the repo name. Local dev keeps base "/".
export default defineConfig(({ command }) => ({
  root: 'docs/demo',
  base: command === 'build' ? '/driven-journal/' : '/',
  plugins: [react()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
}));
