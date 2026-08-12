import { defineConfig } from 'vitest/config';

// Plain Vitest config (formerly @saas-maker/test-config/vitest factory).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'shared/**/*.test.mjs',
      'handlers/**/*.test.mjs',
      'workers/**/*.test.mjs',
    ],
    exclude: ['node_modules', 'dist', '.next', '.wrangler'],
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.{ts,tsx}',
        'api/**/*.{mjs,ts}',
        'handlers/**/*.mjs',
        'shared/**/*.mjs',
        'functions/**/*.js',
      ],
      exclude: ['**/*.test.*', '**/*.d.ts', 'src/vite-env.d.ts'],
      thresholds: {
        lines: 28,
        functions: 25,
        branches: 24,
        statements: 27,
      },
    },
  },
});
