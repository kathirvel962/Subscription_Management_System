import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).replace(/\\/g, '/');

export default defineConfig({
  root: 'client',
  plugins: [
    react(),
    {
      name: 'resolve-ts-sources',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer) return null;
        // Handle .js extension mapping to .ts / .tsx
        if (source.endsWith('.js')) {
          let targetPath = source;
          if (source.startsWith('@members')) {
            targetPath = source.replace('@members', `${__dirname}/members`);
          } else if (source.startsWith('@shared')) {
            targetPath = source.replace('@shared', `${__dirname}/shared`);
          } else if (source.startsWith('@client')) {
            targetPath = source.replace('@client', `${__dirname}/client/src`);
          } else if (source.startsWith('.')) {
            const impDir = path.dirname(importer).replace(/\\/g, '/');
            targetPath = path.posix.resolve(impDir, source);
          }

          const raw = targetPath.replace(/\.js$/, '');
          const candidates = [`${raw}.tsx`, `${raw}.ts`, `${raw}/index.tsx`, `${raw}/index.ts`];
          for (const cand of candidates) {
            const normalized = cand.replace(/\\/g, '/');
            if (fs.existsSync(normalized)) {
              return normalized;
            }
          }
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared').replace(/\\/g, '/'),
      '@members': path.resolve(__dirname, 'members').replace(/\\/g, '/'),
      '@client': path.resolve(__dirname, 'client/src').replace(/\\/g, '/'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
});
