import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true, // Enable video recording
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000, // Increased for slower operations
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    // Retry failed tests
    retries: {
      runMode: 2, // Retry failed tests 2 times in CI
      openMode: 0, // Don't retry in interactive mode
    },
  },
  env: {
    apiUrl: 'http://localhost:5000/api',
  },
});

