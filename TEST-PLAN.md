# EuroCheck Browser Extension - User Acceptance Test (UAT) Plan

**Version:** 0.1.0  
**Last Updated:** 2025-01-28  
**Test Environment:** Chrome 88+, Firefox 109+  
**Extension Type:** Manifest V3

---

## Table of Contents

1. [Test Overview](#test-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Installation Tests](#1-installation-tests)
4. [Core Functionality Tests](#2-core-functionality-tests)
5. [Edge Cases](#3-edge-cases)
6. [UI/UX Tests](#4-uiux-tests)
7. [Performance Tests](#5-performance-tests)
8. [Cross-Browser Tests](#6-cross-browser-tests)
9. [Regression Tests](#7-regression-tests)
10. [Test Summary Template](#test-summary-template)

---

## Test Overview

### Purpose
Verify that EuroCheck correctly identifies EU vs non-EU company ownership for websites and displays accurate information to users.

### Key Features Under Test
- Flag indicator in browser toolbar
- Company identification from 500+ domain database
- Popup UI with company details
- Ownership chain display
- Multi-language support (30+ locales)
- Offline operation (no data collection)

### Pass/Fail Criteria
- **Pass:** Feature works as expected with correct data displayed
- **Fail:** Feature doesn't work, shows incorrect data, or causes errors

---

## Test Environment Setup

### Prerequisites
- [ ] Chrome browser (v88 or later)
- [ ] Firefox browser (v109 or later)
- [ ] Built extension in `/dist/chrome/` and `/dist/firefox/`
- [ ] Test URLs accessible

### Build Extension (if needed)
```bash
cd /Users/antti/clawd/projects/004-eurocheck
./test-extension.sh build
```

---

## 1. Installation Tests

### TC-1.1: Chrome Installation (Unpacked Extension)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Preconditions** | Chrome browser open, Developer mode enabled |

**Steps:**
1. Open Chrome browser
2. Navigate to `chrome://extensions`
3. Enable "Developer mode" toggle (top right)
4. Click "Load unpacked"
5. Select folder: `/Users/antti/clawd/projects/004-eurocheck/dist/chrome`
6. Observe extension loading

**Expected Results:**
- [ ] Extension installs without errors
- [ ] Extension appears in extensions list with correct name "EuroCheck"
- [ ] Extension icon appears in toolbar (may need to pin from puzzle icon)
- [ ] No error badges on extension card

**Notes:** _______________________________________________

---

### TC-1.2: Firefox Installation (Temporary Add-on)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Preconditions** | Firefox browser open |

**Steps:**
1. Open Firefox browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select file: `/Users/antti/clawd/projects/004-eurocheck/dist/firefox/manifest.json`
5. Observe extension loading

**Expected Results:**
- [ ] Extension installs without errors
- [ ] Extension appears in "Temporary Extensions" section
- [ ] Extension icon appears in toolbar
- [ ] No error messages in the debugging page

**Notes:** _______________________________________________

---

### TC-1.3: Extension Toolbar Visibility

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Preconditions** | Extension installed |

**Steps:**
1. Look at browser toolbar
2. If icon not visible, click puzzle/extensions icon
3. Pin EuroCheck extension to toolbar
4. Click the EuroCheck icon

**Expected Results:**
- [ ] Icon is visible in toolbar (or can be pinned)
- [ ] Icon displays correctly (not broken/missing)
- [ ] Clicking icon opens popup
- [ ] Popup displays loading state initially

**Notes:** _______________________________________________

---

## 2. Core Functionality Tests

### Test URLs Reference

| Category | Domain | Company | Expected Status | Country |
|----------|--------|---------|-----------------|---------|
| EU E-commerce | zalando.com | Zalando | 🇪🇺 EU | DE |
| EU E-commerce | zalando.fi | Zalando | 🇪🇺 EU | DE |
| EU E-commerce | bol.com | Bol.com | 🇪🇺 EU | NL |
| EU E-commerce | allegro.pl | Allegro | 🇪🇺 EU | PL |
| EU Tech | spotify.com | Spotify | 🇪🇺 EU | SE |
| EU Tech | nokia.com | Nokia | 🇪🇺 EU | FI |
| EU Tech | sap.com | SAP | 🇪🇺 EU | DE |
| EU Fashion | hm.com | H&M | 🇪🇺 EU | SE |
| EU Fashion | zara.com | Zara/Inditex | 🇪🇺 EU | ES |
| Non-EU E-commerce | amazon.com | Amazon | 🇺🇸 Non-EU | US |
| Non-EU E-commerce | amazon.de | Amazon | 🇺🇸 Non-EU | US |
| Non-EU E-commerce | alibaba.com | Alibaba | 🇨🇳 Non-EU | CN |
| Non-EU E-commerce | aliexpress.com | Alibaba | 🇨🇳 Non-EU | CN |
| Non-EU E-commerce | temu.com | Temu | 🇺🇸 Non-EU | US |
| Non-EU Tech | google.com | Google | 🇺🇸 Non-EU | US |
| Non-EU Tech | microsoft.com | Microsoft | 🇺🇸 Non-EU | US |
| Non-EU Tech | apple.com | Apple | 🇺🇸 Non-EU | US |
| Non-EU Streaming | netflix.com | Netflix | 🇺🇸 Non-EU | US |
| Mixed Ownership | booking.com | Booking.com | ⚠️ Mixed | NL (US parent) |
| Mixed Ownership | wolt.com | Wolt | ⚠️ Mixed | FI (US parent) |
| Mixed Ownership | trivago.com | Trivago | ⚠️ Mixed | DE (US parent) |

---

### TC-2.1: EU Company Detection (Zalando)

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Test URL** | https://www.zalando.com |

**Steps:**
1. Navigate to https://www.zalando.com
2. Wait for page to load
3. Click EuroCheck extension icon
4. Observe popup content

**Expected Results:**
- [ ] Status badge shows "EU" with green/blue styling
- [ ] Company name shows "Zalando"
- [ ] Country flag shows 🇩🇪 (Germany)
- [ ] Location shows "Berlin, Germany" or similar
- [ ] Confidence shows "High"
- [ ] Founded year shows "2008"

**Notes:** _______________________________________________

---

### TC-2.2: EU Company Detection (Spotify)

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Test URL** | https://www.spotify.com |

**Steps:**
1. Navigate to https://www.spotify.com
2. Click EuroCheck extension icon
3. Observe popup content

**Expected Results:**
- [ ] Status badge shows "EU"
- [ ] Company name shows "Spotify"
- [ ] Country flag shows 🇸🇪 (Sweden)
- [ ] Location shows "Stockholm, Sweden"

**Notes:** _______________________________________________

---

### TC-2.3: EU Company Detection (Finnish Company - Nokia)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://www.nokia.com |

**Steps:**
1. Navigate to https://www.nokia.com
2. Click EuroCheck extension icon
3. Observe popup content

**Expected Results:**
- [ ] Status badge shows "EU"
- [ ] Company name shows "Nokia"
- [ ] Country flag shows 🇫🇮 (Finland)
- [ ] Location shows "Espoo, Finland"
- [ ] Founded year shows "1865"

**Notes:** _______________________________________________

---

### TC-2.4: Non-EU Company Detection (Amazon US)

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Test URL** | https://www.amazon.com |

**Steps:**
1. Navigate to https://www.amazon.com
2. Click EuroCheck extension icon
3. Observe popup content

**Expected Results:**
- [ ] Status badge shows "Non-EU" with different styling (red/orange)
- [ ] Company name shows "Amazon"
- [ ] Country flag shows 🇺🇸 (USA)
- [ ] Location shows "Seattle" or similar US location
- [ ] Confidence shows "High"

**Notes:** _______________________________________________

---

### TC-2.5: Non-EU Company Detection (Amazon.de - German Domain)

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Test URL** | https://www.amazon.de |

**Steps:**
1. Navigate to https://www.amazon.de
2. Click EuroCheck extension icon
3. Observe popup content

**Expected Results:**
- [ ] Status badge shows "Non-EU" (not EU despite .de domain!)
- [ ] Company name shows "Amazon"
- [ ] Country flag shows 🇺🇸 (USA) - HQ country, not domain
- [ ] This verifies we check company HQ, not domain TLD

**Notes:** _______________________________________________

---

### TC-2.6: Non-EU Company Detection (Chinese - Alibaba)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://www.alibaba.com |

**Steps:**
1. Navigate to https://www.alibaba.com
2. Click EuroCheck extension icon
3. Observe popup content

**Expected Results:**
- [ ] Status badge shows "Non-EU"
- [ ] Company name shows "Alibaba Group"
- [ ] Country flag shows 🇨🇳 (China)
- [ ] Location shows "Hangzhou, China"

**Notes:** _______________________________________________

---

### TC-2.7: Mixed Ownership Detection (Booking.com)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://www.booking.com |

**Steps:**
1. Navigate to https://www.booking.com
2. Click EuroCheck extension icon
3. Expand "Ownership Chain" section
4. Observe ownership details

**Expected Results:**
- [ ] Status badge shows "Mixed" with warning styling
- [ ] Company name shows "Booking.com"
- [ ] Country shows 🇳🇱 (Netherlands) for HQ
- [ ] Ownership chain shows US parent (Booking Holdings)
- [ ] Warning indicator visible for non-EU ownership

**Notes:** _______________________________________________

---

### TC-2.8: Mixed Ownership Detection (Wolt - Finnish, US-owned)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://www.wolt.com |

**Steps:**
1. Navigate to https://www.wolt.com
2. Click EuroCheck extension icon
3. Expand "Ownership Chain" section

**Expected Results:**
- [ ] Status badge shows "Mixed"
- [ ] Company name shows "Wolt"
- [ ] Country shows 🇫🇮 (Finland)
- [ ] Ownership chain shows "DoorDash" as parent
- [ ] Warning about non-EU ownership

**Notes:** _______________________________________________

---

### TC-2.9: Popup Details Section

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | Any known company site |

**Steps:**
1. Navigate to https://www.zalando.com
2. Click EuroCheck icon
3. Click/expand "Details" section
4. Review all displayed information

**Expected Results:**
- [ ] Founded year displays correctly
- [ ] Confidence level shows (High/Medium/Low)
- [ ] Last verified date displays
- [ ] All text is readable and properly formatted

**Notes:** _______________________________________________

---

## 3. Edge Cases

### TC-3.1: Unknown Domain (Not in Database)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://www.randomsmallbusiness123456.com (or any unknown site) |

**Steps:**
1. Navigate to a website not in the database (e.g., a random small business)
2. Click EuroCheck extension icon
3. Observe the unknown state

**Expected Results:**
- [ ] Shows "Unknown" state with ❓ icon
- [ ] Displays message about no data available
- [ ] Shows domain name that was checked
- [ ] "Request this company" button is visible and clickable
- [ ] No errors in console

**Notes:** _______________________________________________

---

### TC-3.2: Subdomain Handling (AWS)

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URL** | https://aws.amazon.com |

**Steps:**
1. Navigate to https://aws.amazon.com
2. Click EuroCheck extension icon
3. Observe company identification

**Expected Results:**
- [ ] Correctly identifies as "Amazon Web Services" (not just Amazon)
- [ ] Status shows "Non-EU"
- [ ] Country shows 🇺🇸

**Notes:** _______________________________________________

---

### TC-3.3: Subdomain Handling (Shop Subdomain)

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | https://shop.zalando.de |

**Steps:**
1. Navigate to https://shop.zalando.de (or similar subdomain)
2. Click EuroCheck extension icon

**Expected Results:**
- [ ] Correctly identifies parent company "Zalando"
- [ ] Status shows "EU"
- [ ] Falls back to base domain if subdomain not specifically mapped

**Notes:** _______________________________________________

---

### TC-3.4: Country-Specific Domain Variations

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URLs** | zalando.de, zalando.fr, zalando.fi |

**Steps:**
1. Navigate to https://www.zalando.de
2. Click EuroCheck, note results
3. Navigate to https://www.zalando.fr
4. Click EuroCheck, note results
5. Navigate to https://www.zalando.fi
6. Click EuroCheck, note results

**Expected Results:**
- [ ] All three domains correctly identified as Zalando
- [ ] All show "EU" status
- [ ] All show Germany as HQ country (not the domain TLD country)
- [ ] Company details are consistent across domains

**Notes:** _______________________________________________

---

### TC-3.5: Site with Redirects

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | https://amazon.com (without www) |

**Steps:**
1. Navigate to https://amazon.com (no www)
2. Let redirect complete to www.amazon.com
3. Click EuroCheck extension icon

**Expected Results:**
- [ ] Extension uses final URL after redirect
- [ ] Correct company displayed
- [ ] No stale data from redirect URL

**Notes:** _______________________________________________

---

### TC-3.6: Non-E-commerce Sites (News/Info Sites)

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | https://www.bbc.com |

**Steps:**
1. Navigate to https://www.bbc.com
2. Click EuroCheck extension icon

**Expected Results:**
- [ ] Either shows company info (if in database) OR
- [ ] Shows "Unknown" state gracefully
- [ ] No errors or crashes

**Notes:** _______________________________________________

---

### TC-3.7: Browser Internal Pages

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Test URLs** | chrome://extensions, about:blank |

**Steps:**
1. Navigate to chrome://extensions (or Firefox equivalent)
2. Click EuroCheck extension icon
3. Navigate to about:blank
4. Click EuroCheck extension icon

**Expected Results:**
- [ ] Extension handles gracefully (shows error or "not applicable")
- [ ] No crashes or hung states
- [ ] Clear message that this page type is not supported

**Notes:** _______________________________________________

---

### TC-3.8: HTTPS vs HTTP

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Test URL** | http://example.com vs https://example.com |

**Steps:**
1. Navigate to an HTTP site (if accessible)
2. Click EuroCheck
3. Navigate to HTTPS version
4. Click EuroCheck

**Expected Results:**
- [ ] Protocol doesn't affect company detection
- [ ] Same company info shown for both versions

**Notes:** _______________________________________________

---

## 4. UI/UX Tests

### TC-4.1: Popup Design and Readability

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Preconditions** | Extension installed, visit any known site |

**Steps:**
1. Navigate to https://www.spotify.com
2. Click EuroCheck icon
3. Observe popup appearance
4. Try expanding all sections

**Expected Results:**
- [ ] Popup opens smoothly without flicker
- [ ] Header displays "EuroCheck" with logo
- [ ] Status badge is prominently visible
- [ ] Text is readable (appropriate font size)
- [ ] Colors provide good contrast
- [ ] Sections expand/collapse smoothly
- [ ] Footer links work (Settings, GitHub)

**Notes:** _______________________________________________

---

### TC-4.2: Loading State

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | Any site |

**Steps:**
1. Navigate to any website
2. Quickly click EuroCheck icon before page fully loads
3. Observe loading state

**Expected Results:**
- [ ] Loading spinner displays
- [ ] "Checking..." text visible
- [ ] Transitions smoothly to results
- [ ] No jarring layout shifts

**Notes:** _______________________________________________

---

### TC-4.3: Error State Display

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Simulate error condition |

**Steps:**
1. Navigate to a page that might cause an error
2. Or manually trigger error state
3. Observe error display

**Expected Results:**
- [ ] Error icon (⚠️) displays
- [ ] Error message is user-friendly
- [ ] No technical jargon or stack traces shown
- [ ] User understands what went wrong

**Notes:** _______________________________________________

---

### TC-4.4: Icon Visibility in Toolbar

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Preconditions** | Extension installed |

**Steps:**
1. Look at extension icon in different states
2. Visit EU company site
3. Visit Non-EU company site
4. Visit unknown site

**Expected Results:**
- [ ] Icon is clearly visible against various toolbar backgrounds
- [ ] Icon doesn't appear broken or pixelated
- [ ] Icon size is appropriate (not too small or large)

**Notes:** _______________________________________________

---

### TC-4.5: Popup Responsive Behavior

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Preconditions** | Various content lengths |

**Steps:**
1. Test with companies having short names
2. Test with companies having long names
3. Test with complex ownership chains
4. Observe popup resizing

**Expected Results:**
- [ ] Long company names truncate or wrap appropriately
- [ ] Ownership chain scrolls if too long
- [ ] Popup doesn't overflow or break layout
- [ ] All text remains readable

**Notes:** _______________________________________________

---

### TC-4.6: Internationalization (i18n)

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Change browser language |

**Steps:**
1. Change browser language to German (de)
2. Restart browser
3. Open EuroCheck popup
4. Check translated strings

**Expected Results:**
- [ ] UI text appears in German
- [ ] Status labels translated ("EU" → may stay as is)
- [ ] Button text translated
- [ ] No missing translation placeholders

**Notes:** _______________________________________________

---

## 5. Performance Tests

### TC-5.1: Page Load Impact

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URLs** | Various sites |

**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to https://www.amazon.com
3. Note page load time
4. Disable EuroCheck extension
5. Clear cache, reload same page
6. Compare load times

**Expected Results:**
- [ ] Page load time difference is < 50ms
- [ ] No noticeable delay in page rendering
- [ ] Network requests from extension are minimal
- [ ] Extension doesn't block critical resources

**Notes:** 
- Load with extension: _____ ms
- Load without extension: _____ ms
- Difference: _____ ms

---

### TC-5.2: Extension Startup Time

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Fresh browser start |

**Steps:**
1. Close browser completely
2. Start browser with timer
3. Navigate to known company site
4. Click EuroCheck icon
5. Measure time until results display

**Expected Results:**
- [ ] Popup opens in < 500ms
- [ ] Results display in < 1 second
- [ ] No "hanging" or unresponsive states

**Notes:** 
- Time to first result: _____ ms

---

### TC-5.3: Memory Usage

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Extension installed |

**Steps:**
1. Open browser task manager (Shift+Esc in Chrome)
2. Find EuroCheck extension process
3. Note memory usage at idle
4. Visit 10 different sites, clicking EuroCheck each time
5. Note memory usage after activity
6. Wait 5 minutes, check memory again

**Expected Results:**
- [ ] Idle memory usage < 50MB
- [ ] Memory doesn't grow unbounded with use
- [ ] Memory stabilizes or decreases over time
- [ ] No memory leaks evident

**Notes:**
- Idle memory: _____ MB
- After activity: _____ MB
- After 5 min idle: _____ MB

---

### TC-5.4: Database Lookup Speed

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Test URL** | Various sites |

**Steps:**
1. Open browser DevTools → Console
2. Navigate to https://www.zalando.com
3. Click EuroCheck icon
4. Check console for any timing logs
5. Repeat for 5 different sites

**Expected Results:**
- [ ] Database lookup completes in < 10ms
- [ ] No console errors during lookup
- [ ] Consistent performance across different domains

**Notes:** _______________________________________________

---

## 6. Cross-Browser Tests

### TC-6.1: Chrome vs Firefox Consistency

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Test URLs** | zalando.com, amazon.com |

**Steps:**
1. Install extension in both Chrome and Firefox
2. Visit https://www.zalando.com in both browsers
3. Compare popup appearance and data
4. Visit https://www.amazon.com in both browsers
5. Compare popup appearance and data

**Expected Results:**
- [ ] Same company information displayed in both
- [ ] Popup layout is consistent
- [ ] Colors and styling are similar
- [ ] All features work in both browsers

**Differences Noted:**
- Chrome: _______________________________________________
- Firefox: _______________________________________________

---

### TC-6.2: Firefox-Specific Features

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Firefox browser |

**Steps:**
1. Install extension in Firefox
2. Check `about:addons` permissions
3. Verify extension settings/options page works
4. Test on Firefox-specific sites if any

**Expected Results:**
- [ ] Extension permissions are minimal and appropriate
- [ ] Options page accessible and functional
- [ ] No Firefox-specific errors in console

**Notes:** _______________________________________________

---

### TC-6.3: Chrome-Specific Features

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Preconditions** | Chrome browser |

**Steps:**
1. Verify extension works in Chrome incognito mode (if enabled)
2. Check chrome://extensions for any warnings
3. Verify service worker is active

**Expected Results:**
- [ ] Works in incognito if user allows
- [ ] No warnings on extension page
- [ ] Service worker shows as active

**Notes:** _______________________________________________

---

## 7. Regression Tests

### TC-7.1: Quick Smoke Test Suite

Run this abbreviated test after any code changes:

| Test | URL | Expected | Pass/Fail |
|------|-----|----------|-----------|
| EU Company | zalando.com | EU badge, DE flag | [ ] |
| Non-EU Company | amazon.com | Non-EU badge, US flag | [ ] |
| Finnish Company | nokia.com | EU badge, FI flag | [ ] |
| Unknown Domain | example12345.com | Unknown state | [ ] |
| Mixed Ownership | wolt.com | Mixed badge, ownership chain | [ ] |

---

### TC-7.2: Full Regression Checklist

Before any release, verify:

- [ ] All TC-2.x (Core Functionality) tests pass
- [ ] All TC-3.x (Edge Cases) tests pass
- [ ] TC-5.1 (Page Load Impact) within acceptable range
- [ ] TC-6.1 (Cross-Browser) consistency verified
- [ ] No console errors on any test
- [ ] No visual regressions in popup UI

---

## Test Summary Template

### Test Execution Summary

| Date | Tester | Browser | Version |
|------|--------|---------|---------|
| YYYY-MM-DD | [Name] | Chrome/Firefox | [Version] |

### Results Overview

| Category | Total Tests | Passed | Failed | Blocked |
|----------|-------------|--------|--------|---------|
| Installation | 3 | | | |
| Core Functionality | 9 | | | |
| Edge Cases | 8 | | | |
| UI/UX | 6 | | | |
| Performance | 4 | | | |
| Cross-Browser | 3 | | | |
| **TOTAL** | **33** | | | |

### Failed Tests

| Test ID | Description | Issue | Severity |
|---------|-------------|-------|----------|
| | | | |

### Blocked Tests

| Test ID | Description | Blocker |
|---------|-------------|---------|
| | | |

### Notes & Observations

_______________________________________________
_______________________________________________
_______________________________________________

### Sign-off

- [ ] All critical tests passed
- [ ] No high-severity issues unresolved
- [ ] Ready for release

**Approved by:** ____________________  
**Date:** ____________________

---

## Appendix: Quick Test URLs

### EU Companies (Should show EU badge)
```
https://www.zalando.com       - DE (Fashion)
https://www.zalando.fi        - DE (Finnish domain)
https://www.spotify.com       - SE (Streaming)
https://www.nokia.com         - FI (Tech)
https://www.sap.com           - DE (Software)
https://www.hm.com            - SE (Fashion)
https://www.bol.com           - NL (E-commerce)
https://www.allegro.pl        - PL (E-commerce)
https://www.klarna.com        - SE (Fintech)
https://www.bolt.eu           - EE (Transport)
https://www.vinted.com        - LT (Fashion resale)
https://www.adidas.com        - DE (Sports)
```

### Non-EU Companies (Should show Non-EU badge)
```
https://www.amazon.com        - US
https://www.amazon.de         - US (German domain!)
https://www.google.com        - US
https://www.microsoft.com     - US
https://www.apple.com         - US
https://www.alibaba.com       - CN
https://www.aliexpress.com    - CN
https://www.temu.com          - US
https://www.netflix.com       - US
https://www.nike.com          - US
https://www.asos.com          - GB
```

### Mixed Ownership (Should show Mixed/Warning)
```
https://www.booking.com       - NL (US parent: Booking Holdings)
https://www.wolt.com          - FI (US parent: DoorDash)
https://www.trivago.com       - DE (US parent: Expedia)
https://www.supercell.com     - FI (CN parent: Tencent)
```

### Finnish Companies (Special interest)
```
https://www.nokia.com         - EU (FI)
https://www.elisa.fi          - EU (FI)
https://www.fazer.fi          - EU (FI)
https://www.valio.fi          - EU (FI)
https://www.marimekko.com     - EU (FI)
https://www.kone.com          - EU (FI)
https://www.fortum.com        - EU (FI)
https://www.wolt.com          - Mixed (FI, US-owned)
https://www.supercell.com     - Mixed (FI, CN-owned)
```

---

*End of Test Plan*
