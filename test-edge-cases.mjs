#!/usr/bin/env node
/**
 * Test edge cases for EuroCheck extension
 */

import puppeteer from 'puppeteer-core';

const CDP_PORT = 9333;
const EXTENSION_ID = 'njoampcgeccjegcgjlcagpfoaomphdmj';
const POPUP_URL = `chrome-extension://${EXTENSION_ID}/popup/popup.html`;

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
    
    await sleep(1500);
    
    // Get full page content for debugging
    const result = await page.evaluate(() => {
      const getText = (id) => {
        const el = document.getElementById(id);
        return el ? el.textContent : null;
      };
      
      const isVisible = (id) => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
      };
      
      return {
        loading: isVisible('loading'),
        companyInfo: isVisible('company-info'),
        unknownState: isVisible('unknown-state'),
        errorState: isVisible('error-state'),
        errorMessage: getText('error-message'),
        unknownDomain: getText('unknown-domain'),
        statusBadge: getText('status-badge'),
        statusText: getText('status-text'),
        companyName: getText('company-name'),
        location: getText('company-location'),
        html: document.body.innerHTML.substring(0, 500)
      };
    });
    
    await page.close();
    return result;
  } catch (error) {
    await page.close();
    return { error: error.message };
  }
}

async function testOwnershipDisplay(browser, domain) {
  const page = await browser.newPage();
  
  try {
    await page.goto(`${POPUP_URL}?domain=${domain}`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    await sleep(1500);
    
    const result = await page.evaluate(() => {
      const ownershipSection = document.getElementById('ownership-section');
      if (!ownershipSection || ownershipSection.classList.contains('hidden')) {
        return { hasOwnership: false };
      }
      
      // Open it
      ownershipSection.open = true;
      
      const chain = document.getElementById('ownership-chain');
      const items = chain ? chain.querySelectorAll('.ownership-item, .chain-node') : [];
      
      return {
        hasOwnership: true,
        isOpen: ownershipSection.open,
        chainHTML: chain ? chain.innerHTML : '',
        itemCount: items.length,
        items: Array.from(items).map(item => item.textContent.trim())
      };
    });
    
    await page.close();
    return result;
  } catch (error) {
    await page.close();
    return { error: error.message };
  }
}

async function main() {
  console.log('EuroCheck Edge Case Tests\n');
  console.log('='.repeat(60));
  
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${CDP_PORT}`,
    defaultViewport: { width: 350, height: 500 }
  });
  
  // Test 1: Browser internal URLs
  console.log('\n## Browser Internal URLs');
  console.log('-'.repeat(40));
  
  const internalUrls = [
    'chrome://settings',
    'about:blank',
    'chrome-extension://something/page.html',
    'file:///Users/test/file.html'
  ];
  
  for (const url of internalUrls) {
    const result = await testDomain(browser, url);
    console.log(`${url}:`);
    console.log(`  State: ${result.companyInfo ? 'company' : result.unknownState ? 'unknown' : result.errorState ? 'error' : 'loading'}`);
    if (result.errorMessage) console.log(`  Error: ${result.errorMessage}`);
    if (result.unknownDomain) console.log(`  Unknown: ${result.unknownDomain}`);
  }
  
  // Test 2: Ownership chain display
  console.log('\n## Ownership Chain Display');
  console.log('-'.repeat(40));
  
  const ownershipTests = [
    'booking.com',    // Has US parent
    'github.com',     // Microsoft subsidiary
    'instagram.com',  // Meta subsidiary
    'youtube.com',    // Alphabet/Google
    'spotify.com'     // No parent (independent)
  ];
  
  for (const domain of ownershipTests) {
    const result = await testOwnershipDisplay(browser, domain);
    console.log(`${domain}:`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    } else {
      console.log(`  Has ownership: ${result.hasOwnership}`);
      if (result.hasOwnership) {
        console.log(`  Items: ${result.itemCount}`);
        result.items.forEach((item, i) => console.log(`    ${i + 1}. ${item.substring(0, 60)}...`));
      }
    }
  }
  
  // Test 3: Text extraction (checking for i18n issues)
  console.log('\n## Text Content Verification');
  console.log('-'.repeat(40));
  
  const textTests = ['spotify.com', 'amazon.com', 'booking.com', 'example.com'];
  
  for (const domain of textTests) {
    const result = await testDomain(browser, domain);
    console.log(`${domain}:`);
    console.log(`  Status Badge: "${result.statusBadge}"`);
    console.log(`  Status Text: "${result.statusText}"`);
    if (result.unknownDomain) {
      console.log(`  Unknown Text: "${result.unknownDomain}"`);
    }
  }
  
  await browser.disconnect();
  console.log('\n' + '='.repeat(60));
  console.log('Tests complete');
}

main().catch(console.error);
