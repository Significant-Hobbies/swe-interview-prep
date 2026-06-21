import { defineConfig } from 'vitest/config';

// Plain Vitest config (formerly @saas-maker/test-config/vitest factory).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts',
      'shared/**/*.test.mjs',
    ],
    exclude: ['node_modules', 'dist', '.next', '.wrangler'],
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/conceptState.ts',
        'src/lib/elo.ts',
        'src/lib/fsrs.ts',
        'src/lib/gates.ts',
        'src/lib/recommend.ts',
        'src/lib/userStore.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
