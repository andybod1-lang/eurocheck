#!/usr/bin/env node
/**
 * Test script for EuroCheck extension
 * Connects to Chrome on port 9333 and tests the popup for various domains
 */

import puppeteer from 'puppeteer-core';

const CDP_PORT = 9333;
const EXTENSION_ID = 'njoampcgeccjegcgjlcagpfoaomphdmj';
const POPUP_URL = `chrome-extension://${EXTENSION_ID}/popup/popup.html`;

// Test cases
const testCases = {
  // EU Companies
  eu: [
    'spotify.com',
    'zalando.de',
    'klarna.com',
    'booking.com',
    'nokia.com',
    'ericsson.com',
    'sap.com',
    'philips.com'
  ],
  // Non-EU Companies
  nonEu: [
    'amazon.com',
    'google.com',
    'facebook.com',
    'apple.com',
    'microsoft.com',
    'netflix.com',
    'twitter.com',
    'tiktok.com'
  ],
  // Edge cases - subdomains
  subdomains: [
    'aws.amazon.com',
    'drive.google.com',
    'mail.google.com'
  ],
  // Edge cases - country domains
  countryDomains: [
    'amazon.de',
    'google.fr',
    'google.fi'
  ],
  // Unknown domains
  unknown: [
    'example.com',
    'randomsite123.org',
    'unknown-company.fi'
  ],
  // Mixed ownership
  mixed: [
    'booking.com',  // EU brand, US parent
    'trivago.com',  // German brand, Expedia-owned
    'zooplus.com'   // German brand, US PE-owned
  ]
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDomain(browser, domain) {
  const page = await browser.newPage();
  
  try {
    await page.goto(`${POPUP_URL}?domain=${domain}`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // Wait for loading to finish
    await sleep(1000);
    
    // Check for different states
    const result = await page.evaluate(() => {
      const loading = document.getElementById('loading');
      const companyInfo = document.getElementById('company-info');
      const unknownState = document.getElementById('unknown-state');
      const errorState = document.getElementById('error-state');
      
      if (companyInfo && !companyInfo.classList.contains('hidden')) {
        return {
          state: 'company',
          status: document.getElementById('status-badge')?.textContent,
          statusText: document.getElementById('status-text')?.textContent,
          name: document.getElementById('company-name')?.textContent,
          location: document.getElementById('company-location')?.textContent,
          flag: document.getElementById('country-flag')?.textContent,
          hasOwnership: !document.getElementById('ownership-section')?.classList.contains('hidden'),
          founded: document.getElementById('founded-year')?.textContent,
          confidence: document.getElementById('confidence')?.textContent
        };
      } else if (unknownState && !unknownState.classList.contains('hidden')) {
        return {
          state: 'unknown',
          message: document.getElementById('unknown-domain')?.textContent
        };
      } else if (errorState && !errorState.classList.contains('hidden')) {
        return {
          state: 'error',
          message: document.getElementById('error-message')?.textContent
        };
      } else if (loading && !loading.classList.contains('hidden')) {
        return { state: 'loading' };
      }
      
      return { state: 'unknown', message: 'Could not determine state' };
    });
    
    await page.close();
    return result;
  } catch (error) {
    await page.close();
    return { state: 'error', message: error.message };
  }
}

async function testDetailsSection(browser, domain) {
  const page = await browser.newPage();
  
  try {
    await page.goto(`${POPUP_URL}?domain=${domain}`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    await sleep(1000);
    
    // Try to expand the Details section
    const detailsResult = await page.evaluate(() => {
      const detailsSection = document.querySelector('details.details-section');
      if (!detailsSection) return { error: 'Details section not found' };
      
      // Click to open
      const summary = detailsSection.querySelector('summary');
      summary.click();
      
      return {
        exists: true,
        isOpen: detailsSection.open,
        founded: document.getElementById('founded-year')?.textContent,
        confidence: document.getElementById('confidence')?.textContent,
        lastVerified: document.getElementById('last-verified')?.textContent
      };
    });
    
    // Try ownership section
    const ownershipResult = await page.evaluate(() => {
      const ownershipSection = document.getElementById('ownership-section');
      if (!ownershipSection || ownershipSection.classList.contains('hidden')) {
        return { exists: false };
      }
      
      const summary = ownershipSection.querySelector('summary');
      if (summary) summary.click();
      
      return {
        exists: true,
        isOpen: ownershipSection.open,
        content: document.getElementById('ownership-chain')?.innerHTML
      };
    });
    
    await page.close();
    return { details: detailsResult, ownership: ownershipResult };
  } catch (error) {
    await page.close();
    return { error: error.message };
  }
}

async function main() {
  console.log('EuroCheck Extension Test Suite\n');
  console.log('='.repeat(60));
  
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${CDP_PORT}`,
    defaultViewport: { width: 350, height: 500 }
  });
  
  const bugs = [];
  const results = {};
  
  // Test all categories
  for (const [category, domains] of Object.entries(testCases)) {
    console.log(`\n## Testing ${category.toUpperCase()}`);
    console.log('-'.repeat(40));
    results[category] = [];
    
    for (const domain of domains) {
      const result = await testDomain(browser, domain);
      results[category].push({ domain, ...result });
      
      const icon = result.state === 'company' ? 
        (result.status === 'EU' ? '🟢' : result.status === '!EU' ? '🔴' : '🟡') : 
        (result.state === 'unknown' ? '❓' : '⚠️');
      
      console.log(`${icon} ${domain}: ${result.state}`);
      if (result.name) console.log(`   → ${result.name} (${result.status}) - ${result.location}`);
      
      // Check for bugs
      if (category === 'eu') {
        // booking.com is actually mixed ownership (Dutch brand, US parent)
        if (domain === 'booking.com' && result.status !== 'MIX') {
          // This might be correct if they classify it by EU headquarters
          // Log it for review
          if (result.status === 'MIX') {
            // Correct
          } else {
            bugs.push({
              domain,
              issue: `booking.com classified as ${result.status}, but has US parent (Booking Holdings)`,
              severity: 'medium',
              expected: 'MIX (mixed ownership)',
              actual: result.status
            });
          }
        }
      }
      
      if (category === 'nonEu' && result.status === 'EU') {
        bugs.push({
          domain,
          issue: `${domain} incorrectly classified as EU`,
          severity: 'high',
          expected: '!EU',
          actual: result.status
        });
      }
      
      if (category === 'eu' && result.status === '!EU') {
        bugs.push({
          domain,
          issue: `${domain} incorrectly classified as non-EU`,
          severity: 'high',
          expected: 'EU',
          actual: result.status
        });
      }
      
      // Check for loading stuck
      if (result.state === 'loading') {
        bugs.push({
          domain,
          issue: `Popup stuck in loading state`,
          severity: 'high'
        });
      }
    }
  }
  
  // Test Details section
  console.log('\n## Testing Details Section');
  console.log('-'.repeat(40));
  
  const detailsTest = await testDetailsSection(browser, 'spotify.com');
  console.log('Details section:', detailsTest.details);
  console.log('Ownership section:', detailsTest.ownership);
  
  if (detailsTest.error) {
    bugs.push({
      domain: 'spotify.com',
      issue: `Details section test error: ${detailsTest.error}`,
      severity: 'medium'
    });
  }
  
  // Output summary
  console.log('\n' + '='.repeat(60));
  console.log('## SUMMARY');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let passed = 0;
  
  for (const [category, categoryResults] of Object.entries(results)) {
    const categoryPassed = categoryResults.filter(r => r.state === 'company' || r.state === 'unknown').length;
    totalTests += categoryResults.length;
    passed += categoryPassed;
    console.log(`${category}: ${categoryPassed}/${categoryResults.length} passed`);
  }
  
  console.log(`\nTotal: ${passed}/${totalTests} tests passed`);
  console.log(`Bugs found: ${bugs.length}`);
  
  // Output bugs in JSON format
  console.log('\n## BUGS FOUND');
  console.log(JSON.stringify(bugs, null, 2));
  
  // Write to file
  const fs = await import('fs');
  fs.writeFileSync('/Users/antti/clawd/projects/004-eurocheck/test-results.json', 
    JSON.stringify({ results, bugs }, null, 2));
  
  await browser.disconnect();
}

main().catch(console.error);
