# EuroCheck Extension - Bug Report

**Test Date:** 2025-01-26  
**Extension Version:** 0.1.0  
**Browser Tested:** Chrome 144 (via CDP port 9333)

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 High | 1 | i18n translation failures |
| 🟡 Medium | 3 | Subdomain handling, edge case states |
| 🟢 Low | 2 | Minor UI inconsistencies |

---

## 🔴 High Severity

### BUG-001: i18n Translations Not Loading Properly

**Description:**  
Text elements show raw i18n keys instead of translated messages in some scenarios.

**Affected Elements:**
- Status text shows `statusEu`, `statusNonEu`, `statusMixed` instead of proper text
- Confidence shows `confidenceHigh`, `confidenceMedium` instead of "High", "Medium"
- Unknown state shows `unknownNoData` instead of "No data available for [domain]"
- Ownership badges show `badgeCurrent`, `badgeParent`, `badgeUltimate`

**Steps to Reproduce:**
1. Open popup for any domain
2. Observe text content (sometimes loads properly, sometimes shows raw keys)

**Expected:** All text should display properly translated strings  
**Actual:** Raw i18n keys displayed

**Root Cause Analysis:**  
The `getMessage()` function falls back to the raw key when `chrome.i18n.getMessage()` returns empty:
```javascript
function getMessage(key, substitutions = []) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}
```

**Recommended Fix:**
1. Add hardcoded fallback translations in popup.js
2. Or pre-load translations before displaying content:
```javascript
const FALLBACK_MESSAGES = {
  statusEu: 'European Company',
  statusNonEu: 'Non-European Company',
  statusMixed: 'Mixed Ownership',
  confidenceHigh: 'High',
  confidenceMedium: 'Medium',
  confidenceLow: 'Low',
  unknownNoData: 'No data available for this domain',
  badgeCurrent: 'Current',
  badgeParent: 'Parent',
  badgeUltimate: 'Ultimate'
};

function getMessage(key, substitutions = []) {
  const msg = chrome.i18n.getMessage(key, substitutions);
  return msg || FALLBACK_MESSAGES[key] || key;
}
```

---

## 🟡 Medium Severity

### BUG-002: Subdomains Don't Fall Back to Parent Domain

**Description:**  
When looking up subdomains not explicitly in the database, the extension shows "Unknown" instead of falling back to the parent domain.

**Affected Domains:**
- `drive.google.com` → shows "Unknown" (should show Google)
- `mail.google.com` → shows "Unknown" (should show Google)
- `docs.google.com` → would show "Unknown"
- `maps.google.com` → would show "Unknown"

**Working Subdomain:**
- `aws.amazon.com` → correctly shows "Amazon Web Services" (explicitly in database)

**Root Cause:**  
The `lookupCompany()` function in `domain.js` only does exact domain matches. When the popup receives a domain via URL parameter, it passes it directly without extraction.

**Recommended Fix:**
Add subdomain fallback in `lookupCompany()`:
```javascript
export function lookupCompany(domain, domainsData, companiesData) {
  // ... existing exact match code ...
  
  // If no exact match, try parent domain
  const parts = domain.split('.');
  if (parts.length > 2) {
    const parentDomain = parts.slice(-2).join('.');
    const parentEntry = domainsData.domains.find(d => 
      d.domain.toLowerCase() === parentDomain
    );
    if (parentEntry) {
      return findCompanyById(parentEntry.company_id, companiesData);
    }
  }
  
  return null;
}
```

---

### BUG-003: Browser Internal Pages Show Inconsistent States

**Description:**  
Browser internal URLs (chrome://, about:, file://) show inconsistent error states.

**Test Results:**
| URL | State | Message |
|-----|-------|---------|
| `chrome://settings` | unknown | "Something went wrong" |
| `about:blank` | unknown | "Something went wrong" |
| `file:///path` | unknown | "Something went wrong" |

**Expected:**  
These should show a clear, user-friendly message like "Cannot check internal browser pages"

**Recommended Fix:**
1. In `popup.js`, detect internal URLs early and show specific error:
```javascript
if (domain === null && testDomain) {
  // Check if it's a browser internal URL
  if (testDomain.startsWith('chrome://') || 
      testDomain.startsWith('about:') || 
      testDomain.startsWith('file://')) {
    displayError('errorCannotAccess'); // or a new specific key
    return;
  }
}
```

---

### BUG-004: booking.com Listed as EU but Shows Mixed

**Description:**  
In test categorization, `booking.com` was listed as an "EU company" but the extension correctly shows it as "Mixed Ownership" (Dutch company with US parent).

**Status:** ✅ This is NOT a bug in the extension - the extension correctly identifies the mixed ownership. This was a test categorization error.

**Company Data:**
- Booking.com: HQ in Amsterdam, Netherlands (EU)
- Parent: Booking Holdings - HQ in Norwalk, Connecticut, USA (Non-EU)
- Correct classification: `mixed`

---

## 🟢 Low Severity

### BUG-005: YouTube Ownership Chain Missing Google's Country Flag

**Description:**  
In the ownership chain for YouTube, Google is shown with a generic building emoji 🏢 instead of the US flag 🇺🇸.

**Current Display:**
```
🇺🇸 YouTube (Current)
🏢 Google (Parent)
🏛️ Alphabet Inc. (Ultimate)
```

**Expected:**
```
🇺🇸 YouTube (Current)
🇺🇸 Google (Parent)
🇺🇸 Alphabet Inc. (Ultimate)
```

**Root Cause:**  
The `buildOwnershipChain()` function uses hardcoded emojis for parent companies:
```javascript
<span class="flag">🏢</span>  // Parent
<span class="flag">🏛️</span>  // Ultimate
```

**Recommended Fix:**
Look up parent company data to get their actual country flags:
```javascript
// Need access to companies data in popup or lookup parent by name
```

---

### BUG-006: Details Section Default Text Shows Before Loading

**Description:**  
During the brief loading period, the company info section might flash with default values (showing "EU" badge and "European Company" text) before the actual data loads.

**Impact:** Minor visual glitch, barely noticeable in normal use.

**Recommended Fix:**
Keep company-info section hidden until data is ready.

---

## ✅ Working Features Verified

### Classifications (All Correct)

**EU Companies:**
| Domain | Company | Status | Location |
|--------|---------|--------|----------|
| spotify.com | Spotify | EU ✅ | Stockholm, Sweden |
| zalando.de | Zalando | EU ✅ | Berlin, Germany |
| klarna.com | Klarna | EU ✅ | Stockholm, Sweden |
| nokia.com | Nokia | EU ✅ | Espoo, Finland |
| ericsson.com | Ericsson | EU ✅ | Stockholm, Sweden |
| sap.com | SAP | EU ✅ | Walldorf, Germany |
| philips.com | Philips | EU ✅ | Amsterdam, Netherlands |

**Non-EU Companies:**
| Domain | Company | Status | Location |
|--------|---------|--------|----------|
| amazon.com | Amazon | !EU ✅ | Seattle, United States |
| google.com | Google | !EU ✅ | Mountain View, United States |
| facebook.com | Facebook | !EU ✅ | Menlo Park, United States |
| apple.com | Apple | !EU ✅ | Cupertino, United States |
| microsoft.com | Microsoft | !EU ✅ | Redmond, United States |
| netflix.com | Netflix | !EU ✅ | Los Gatos, United States |
| twitter.com | X (Twitter) | !EU ✅ | San Francisco, United States |
| tiktok.com | TikTok | !EU ✅ | Culver City, United States |

**Mixed Ownership:**
| Domain | Company | Status | Parent |
|--------|---------|--------|--------|
| booking.com | Booking.com | MIX ✅ | Booking Holdings (US) |
| trivago.com | Trivago | MIX ✅ | Expedia Group (US) |
| zooplus.com | Zooplus | MIX ✅ | Hellman & Friedman (US) |

### Country-Specific Domains (Correct)
- `amazon.de` → Amazon (!EU) ✅
- `google.fr` → Google (!EU) ✅
- `google.fi` → Google (!EU) ✅

### Subdomain with Explicit Entry
- `aws.amazon.com` → Amazon Web Services (!EU) ✅

### Unknown Domains (Correct Behavior)
- `example.com` → Unknown ✅
- `randomsite123.org` → Unknown ✅
- `unknown-company.fi` → Unknown ✅

### Ownership Chain Display
- ✅ booking.com shows: Booking.com → Booking Holdings
- ✅ github.com shows: GitHub → Microsoft
- ✅ instagram.com shows: Instagram → Meta Platforms
- ✅ youtube.com shows: YouTube → Google → Alphabet Inc.
- ✅ spotify.com shows no ownership (independent)

### Details Section
- ✅ Expandable/collapsible
- ✅ Shows Founded year
- ✅ Shows Confidence level
- ✅ Shows Last verified date

---

## Missing Data (Enhancement Suggestions)

Companies/services that could be added:

1. **Google Services** (as separate entries or subdomain fallback):
   - drive.google.com
   - mail.google.com (Gmail)
   - docs.google.com
   - maps.google.com
   - cloud.google.com

2. **Popular EU Companies Not in Database:**
   - (would need research to identify gaps)

3. **Regional Variants:**
   - Many country-specific TLDs might need entries

---

## Test Files Generated

- `/Users/antti/clawd/projects/004-eurocheck/test-extension.mjs` - Main test script
- `/Users/antti/clawd/projects/004-eurocheck/test-edge-cases.mjs` - Edge case tests
- `/Users/antti/clawd/projects/004-eurocheck/test-results.json` - Full test results

---

## Recommendations

### Priority 1 (Fix Before Release)
1. Fix i18n fallback messages (BUG-001)
2. Add subdomain fallback logic (BUG-002)

### Priority 2 (Nice to Have)
1. Improve browser internal page handling (BUG-003)
2. Add country flags to parent companies in ownership chain (BUG-005)

### Priority 3 (Future Enhancement)
1. Add more Google service subdomains to database
2. Consider automatic subdomain → parent domain fallback
3. Add more EU companies to database
