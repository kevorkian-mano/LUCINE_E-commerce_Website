import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // Run tests in sequence for integration tests to avoid database conflicts
    sequence: {
      shuffle: false,
      concurrent: false,
      // Run test files sequentially to ensure proper isolation
      hooks: 'sequential'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/**/*.config.js',
        'src/server.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },
    setupFiles: ['./tests/helpers/setup.js'],
    testTimeout: 10000
  }
});

