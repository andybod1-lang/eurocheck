# EuroCheck E2E Tests

This directory contains end-to-end tests for the EuroCheck browser extension using Playwright.

## Test Files

- `e2e.test.js` - Main end-to-end test suite
- Playwright configuration in `../playwright.config.js`

## Test Structure

The tests are organized into the following test suites:

### 1. Extension Loading Tests
- Verifies extension loads in Chrome
- Checks extension is enabled
- Confirms extension appears in chrome://extensions

### 2. Country Detection Tests
- Tests 5 domains with known country origins
- Verifies popup shows correct company information
- Checks country status (EU/Non-EU/Unknown)

### 3. Scam Warning Tests
- Tests warning display for suspicious domains
- Checks for scam warning elements

### 4. Settings Tests
- Tests options page functionality
- Verifies theme toggle
- Tests notification preferences
- Checks settings persistence

### 5. Popup State Tests
- Tests loading state transitions
- Verifies only one state is visible at a time

## Running Tests

See the main [TESTING.md](../TESTING.md) file for complete setup and running instructions.

## Test Data

Test domains are defined in the `TEST_DOMAINS` array in `e2e.test.js`:

```javascript
const TEST_DOMAINS = [
  { url: 'https://amazon.com', expectedCountry: 'US', companyName: 'Amazon' },
  { url: 'https://spotify.com', expectedCountry: 'SE', companyName: 'Spotify' },
  { url: 'https://zalando.de', expectedCountry: 'DE', companyName: 'Zalando' },
  { url: 'https://aliexpress.com', expectedCountry: 'CN', companyName: 'AliExpress' },
  { url: 'https://github.com', expectedCountry: 'US', companyName: 'GitHub' }
];
```

## Adding New Tests

1. Add new test cases to `e2e.test.js`
2. Follow existing test structure
3. Include appropriate assertions
4. Add screenshots for debugging
5. Update documentation if needed

## Debugging

Test screenshots are saved to `../test-results/` directory. Use Playwright's UI mode or inspector for debugging:

```bash
npm run test:e2e:ui
# or
npm run test:e2e:debug
```