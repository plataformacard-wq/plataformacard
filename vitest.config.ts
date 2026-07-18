import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    // Foca na execução sequencial para evitar race conditions locais com o banco de teste
    fileParallelism: false,
  },
});
