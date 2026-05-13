import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for PDF Upload System verification.
 * Tests target Flask backend at http://localhost:5000
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests serially for deterministic behavior
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Timeout settings
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000, // 5s for assertions
  },
});
