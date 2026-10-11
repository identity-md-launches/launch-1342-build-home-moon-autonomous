import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base "./" makes every asset URL relative, so the export works from an IPFS
// gateway subpath (https://gateway/ipfs/<cid>/) as well as an ENS name on eth.limo.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
});
