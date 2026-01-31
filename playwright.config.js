const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Extension path
const EXTENSION_PATH = path.join(__dirname, 'dist/chrome');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Load extension for Chrome tests
        contextOptions: {
          permissions: ['notifications'],
          ...(EXTENSION_PATH && {
            args: [
              `--disable-extensions-except=${EXTENSION_PATH}`,
              `--load-extension=${EXTENSION_PATH}`
            ]
          })
        }
      },
    },
  ],

  webServer: {
    command: 'npm run build:chrome',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});