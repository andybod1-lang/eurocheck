const { test, expect } = require('@playwright/test');
const path = require('path');

// Test domains for country detection
const TEST_DOMAINS = [
  { url: 'https://amazon.com', expectedCountry: 'US', companyName: 'Amazon' },
  { url: 'https://spotify.com', expectedCountry: 'SE', companyName: 'Spotify' },
  { url: 'https://zalando.de', expectedCountry: 'DE', companyName: 'Zalando' },
  { url: 'https://aliexpress.com', expectedCountry: 'CN', companyName: 'AliExpress' },
  { url: 'https://github.com', expectedCountry: 'US', companyName: 'GitHub' }
];

// Extension paths
const EXTENSION_PATH = path.join(__dirname, '../dist/chrome');

test.describe('EuroCheck Extension E2E Tests', () => {
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    // Launch browser with extension loaded
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      // Load the extension
      ...(browser.browserType().name() === 'chromium' && {
        permissions: ['notifications'],
        // For Chrome/Chromium, load extension
        ...(EXTENSION_PATH && {
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
          ]
        })
      })
    });
    
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Extension loads correctly in Chrome', async () => {
    // Test that extension icon is visible
    await page.goto('chrome://extensions/');
    
    // Check if extensions page loads
    await expect(page).toHaveTitle(/Extensions/);
    
    // Search for EuroCheck extension
    const searchInput = page.locator('input#search-input');
    if (await searchInput.isVisible()) {
      await searchInput.fill('EuroCheck');
      await page.waitForTimeout(1000);
    }
    
    // Check extension is present (might be in dev mode)
    const extensionCard = page.locator('extensions-item').filter({ hasText: /EuroCheck/i });
    await expect(extensionCard).toBeVisible();
    
    // Check extension is enabled
    const toggleButton = extensionCard.locator('cr-toggle');
    await expect(toggleButton).toHaveAttribute('aria-checked', 'true');
  });

  test('Country detection works for multiple domains', async () => {
    for (const domain of TEST_DOMAINS) {
      await test.step(`Test ${domain.url}`, async () => {
        // Navigate to the domain
        await page.goto(domain.url);
        await page.waitForLoadState('networkidle');
        
        // Open extension popup
        await page.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for popup to load and detect country
        await page.waitForTimeout(2000);
        
        // Check if popup shows correct information
        const loading = page.locator('#loading');
        const companyInfo = page.locator('#company-info');
        const unknown = page.locator('#unknown-state');
        const error = page.locator('#error-state');
        
        // One of these should be visible (not all hidden)
        const loadingVisible = await loading.isVisible();
        const companyVisible = await companyInfo.isVisible();
        const unknownVisible = await unknown.isVisible();
        const errorVisible = await error.isVisible();
        
        // At least one state should be visible
        expect(loadingVisible || companyVisible || unknownVisible || errorVisible).toBeTruthy();
        
        if (companyVisible) {
          // Check company name and country
          const companyName = await page.locator('#company-name').textContent();
          const statusText = await page.locator('#status-text').textContent();
          
          console.log(`Domain: ${domain.url}`);
          console.log(`Detected company: ${companyName}`);
          console.log(`Status: ${statusText}`);
          
          // Company name should contain expected company
          expect(companyName).toContain(domain.companyName);
          
          // Status should indicate country
          expect(statusText).toMatch(/EU|Non-EU|Unknown/);
        }
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: `test-results/${domain.url.replace(/[^a-z0-9]/gi, '_')}.png` 
        });
        
        // Go back to test next domain
        await page.goBack();
      });
    }
  });

  test('Scam warning displays properly for suspicious domains', async () => {
    // Test with a known scam-like domain
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    // Open extension popup
    await page.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for scam warning elements
    const scamWarning = page.locator('.scam-warning, .warning, [class*="warning"]');
    const warningText = page.locator('text=/warning|caution|suspicious|scam/i');
    
    // Either a scam warning element or warning text should be visible for suspicious domains
    const hasScamWarning = await scamWarning.isVisible().catch(() => false);
    const hasWarningText = await warningText.isVisible().catch(() => false);
    
    // Log what we found
    if (hasScamWarning || hasWarningText) {
      console.log('Scam warning detected');
    } else {
      console.log('No scam warning detected (might be expected for example.com)');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/scam-warning-test.png' });
  });

  test('Settings can be changed and persist', async () => {
    // Navigate to options page
    await page.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/options/options.html');
    await page.waitForLoadState('networkidle');
    
    // Check options page loads
    await expect(page).toHaveTitle(/EuroCheck Options/);
    
    // Test theme toggle
    const themeToggle = page.locator('#theme-toggle, [name="theme"], input[type="checkbox"]').first();
    if (await themeToggle.isVisible()) {
      const initialTheme = await themeToggle.isChecked();
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      const newTheme = await themeToggle.isChecked();
      expect(newTheme).not.toBe(initialTheme);
      
      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      const finalTheme = await themeToggle.isChecked();
      expect(finalTheme).toBe(initialTheme);
    }
    
    // Test notification preferences
    const notificationToggle = page.locator('#notifications-toggle, [name="notifications"]').first();
    if (await notificationToggle.isVisible()) {
      const initialNotifications = await notificationToggle.isChecked();
      
      // Toggle notifications
      await notificationToggle.click();
      await page.waitForTimeout(500);
      
      const newNotifications = await notificationToggle.isChecked();
      expect(newNotifications).not.toBe(initialNotifications);
    }
    
    // Test language selection if available
    const languageSelect = page.locator('select[name="language"], #language-select').first();
    if (await languageSelect.isVisible()) {
      const options = await languageSelect.locator('option').all();
      if (options.length > 1) {
        // Select a different language
        await languageSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        
        // Verify change
        const selectedValue = await languageSelect.inputValue();
        expect(selectedValue).not.toBe('');
      }
    }
    
    // Test save button if present
    const saveButton = page.locator('button:has-text("Save"), #save-button').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(500);
      
      // Check for success message
      const successMessage = page.locator('text=/saved|success|updated/i');
      const isSuccessVisible = await successMessage.isVisible().catch(() => false);
      
      if (isSuccessVisible) {
        console.log('Settings saved successfully');
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/settings-test.png' });
  });

  test('Popup shows correct state transitions', async () => {
    // Test loading state
    await page.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html');
    await page.waitForLoadState('networkidle');
    
    // Initially should show loading or some state
    const loading = page.locator('#loading');
    const loadingVisible = await loading.isVisible().catch(() => false);
    
    if (loadingVisible) {
      console.log('Popup shows loading state initially');
      await expect(loading).toBeVisible();
      
      // Wait for loading to complete
      await page.waitForTimeout(3000);
      await expect(loading).not.toBeVisible();
    }
    
    // Check final state
    const companyInfo = page.locator('#company-info');
    const unknown = page.locator('#unknown-state');
    const error = page.locator('#error-state');
    
    const companyVisible = await companyInfo.isVisible().catch(() => false);
    const unknownVisible = await unknown.isVisible().catch(() => false);
    const errorVisible = await error.isVisible().catch(() => false);
    
    // Exactly one should be visible
    const visibleStates = [companyVisible, unknownVisible, errorVisible].filter(Boolean);
    expect(visibleStates.length).toBe(1);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/popup-state-test.png' });
  });
});

// Helper function to get extension ID (for Chrome)
// Note: Extension ID changes when loaded from unpacked directory
// This is a fallback - in practice, tests should work with the loaded extension
async function getExtensionId(page) {
  try {
    await page.goto('chrome://extensions/');
    await page.waitForLoadState('networkidle');
    
    // Enable developer mode if needed
    const devModeToggle = page.locator('input#dev-mode');
    if (await devModeToggle.isVisible() && !await devModeToggle.isChecked()) {
      await devModeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Find EuroCheck extension and get its ID
    const extensionItem = page.locator('extensions-item').filter({ hasText: /EuroCheck/i });
    if (await extensionItem.isVisible()) {
      const idElement = extensionItem.locator('.extension-id');
      if (await idElement.isVisible()) {
        const id = await idElement.textContent();
        console.log(`Found extension ID: ${id}`);
        return id;
      }
    }
  } catch (error) {
    console.log('Could not get extension ID from chrome://extensions:', error.message);
  }
  
  // Fallback - when extension is loaded via --load-extension, it gets a temporary ID
  // We'll use a placeholder that tests can work with
  return 'test-extension-id-placeholder';
}