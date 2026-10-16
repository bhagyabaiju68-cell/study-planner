import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Show console output and its stack traces
    // Useful when debugging infinite loops!
    disableConsoleIntercept: true,
    printConsoleTrace: true,
    silent: false,

    // Disable file parallelism
    // In 1531, different test files reference shared data!
    fileParallelism: false,

    // Timeout asynchronous tests/hooks that don't complete
    // Note: this won't stop synchronous infinite loops.
    testTimeout: 10_000,
    hookTimeout: 10_000,

    // Run tests in a predictable order
    sequence: {
      concurrent: false,
    },
  },
});
