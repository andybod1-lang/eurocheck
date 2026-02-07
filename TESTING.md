# EuroCheck End-to-End Testing with Playwright

This document provides instructions for setting up and running automated end-to-end tests for the EuroCheck browser extension.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Playwright** installed globally or locally
3. **Chrome/Chromium browser** installed
4. **Built extension** in `dist/chrome/` directory

## Installation

### 1. Install Playwright and dependencies

```bash
# Navigate to project directory
cd /Users/antti/clawd/projects/004-eurocheck

# Install Playwright and browsers
npm init playwright@latest -- --yes --quiet
# or if already initialized
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install chromium
```

### 2. Verify extension build

Make sure the extension is built in the `dist/chrome/` directory:

```bash
# Build the extension if not already built
npm run build:chrome
```

### 3. Create test results directory

```bash
mkdir -p test-results
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run specific test file

```bash
npx playwright test tests/e2e.test.js
```

### Run with UI mode (debugging)

```bash
npx playwright test --ui
```

### Run with headed browser (visible)

```bash
npx playwright test --headed
```

### Generate test report

```bash
npx playwright test --reporter=html
# Open report
npx playwright show-report
```

## Test Coverage

The E2E tests cover the following critical user flows:

### 1. Extension Loading
- Verifies extension loads correctly in Chrome
- Checks extension is enabled
- Confirms extension appears in chrome://extensions

### 2. Country Detection
- Tests 5 different domains with known country origins:
  - `amazon.com` (US - Non-EU)
  - `spotify.com` (SE - EU)
  - `zalando.de` (DE - EU)
  - `aliexpress.com` (CN - Non-EU)
  - `github.com` (US - Non-EU)
- Verifies popup shows correct company information
- Checks country status (EU/Non-EU/Unknown)

### 3. Scam Warning Display
- Tests warning display for suspicious domains
- Checks for scam warning elements and text
- Verifies warning visibility

### 4. Settings Management
- Tests options page accessibility
- Verifies theme toggle functionality
- Tests notification preferences
- Checks language selection (if available)
- Verifies settings persistence

### 5. Popup State Transitions
- Tests loading state visibility
- Verifies state transitions (loading → final state)
- Checks only one state is visible at a time

## Test Configuration

### Playwright Configuration

Create `playwright.config.js` in the project root:

```javascript
const { defineConfig, devices } = require('@playwright/test');

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
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### Environment Variables

Create `.env.test` file for test configuration:

```bash
# Test configuration
TEST_MODE=e2e
EXTENSION_PATH=./dist/chrome
HEADLESS=false  # Set to true for CI
SLOW_MO=1000    # Slow down for debugging
```

## Debugging Tests

### 1. View Screenshots

Test screenshots are saved to `test-results/` directory:
- `amazon_com.png` - Amazon test result
- `spotify_com.png` - Spotify test result
- `scam-warning-test.png` - Scam warning test
- `settings-test.png` - Settings test
- `popup-state-test.png` - Popup state test

### 2. Debug with Playwright Inspector

```bash
# Run with inspector
PWDEBUG=1 npx playwright test

# Or use the UI mode
npx playwright test --ui
```

### 3. View Console Logs

Test output includes console logs from:
- Page navigation events
- Popup state information
- Detected company names and countries
- Test step completion

### 4. Common Issues

#### Extension not loading
- Ensure extension is built: `npm run build:chrome`
- Check `dist/chrome/` directory exists
- Verify manifest.json is present

#### Popup not accessible
- Extension ID might have changed
- Check chrome://extensions for current ID
- Update test with correct extension ID

#### Tests timing out
- Increase timeouts in test steps
- Add `await page.waitForTimeout()` for debugging
- Check network connectivity to test domains

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Build extension
      run: npm run build:chrome
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Test Maintenance

### Adding New Tests

1. Add new test cases to `tests/e2e.test.js`
2. Follow existing test structure
3. Include appropriate assertions
4. Add screenshots for debugging
5. Update TESTING.md if needed

### Updating Test Data

To update test domains or expected results:
1. Modify `TEST_DOMAINS` array in `e2e.test.js`
2. Update assertions accordingly
3. Re-run tests to verify

### Test Data Management

Test data is stored in:
- `TEST_DOMAINS` array - Domain test cases
- `test-results/` - Screenshots and artifacts
- Playwright trace files - Debug information

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean State**: Reset browser context between tests
3. **Meaningful Assertions**: Test behavior, not implementation
4. **Debug Information**: Include screenshots and logs
5. **CI Ready**: Tests should run in headless mode
6. **Fast Execution**: Minimize wait times where possible
7. **Reliable Selectors**: Use stable element selectors

## Troubleshooting

### Playwright cannot find browser
```bash
# Reinstall browsers
npx playwright install
```

### Extension not loading in tests
```bash
# Check extension path
ls -la dist/chrome/

# Verify manifest exists
cat dist/chrome/manifest.json
```

### Tests fail intermittently
- Increase timeouts
- Add retry logic
- Check network stability
- Verify test domains are accessible

### Popup shows wrong information
- Check extension background service worker
- Verify data files are included in build
- Test with known domains first

## Support

For test-related issues:
1. Check test output and screenshots
2. Review Playwright documentation
3. Examine browser console logs
4. Run tests in headed mode for visual debugging

For extension functionality issues:
1. Test manually in browser first
2. Check extension background logs
3. Verify data source accuracy
4. Review extension console output