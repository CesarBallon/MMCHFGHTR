/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/core/index.ts',
      formats: ['es'],
      fileName: 'mamacha-core',
    },
    outDir: 'build/core',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
