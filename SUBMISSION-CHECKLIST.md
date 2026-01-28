# EuroCheck Browser Extension — Store Submission Checklist

**Version:** 0.1.0  
**Last Updated:** 2025-01-27

---

## 📋 Pre-Submission Status Summary

| Store | Status | Blockers |
|-------|--------|----------|
| Chrome Web Store | 🟡 Ready for submission | Need developer account, final screenshots |
| Firefox Add-ons | 🟡 Ready for submission | Need developer account, final screenshots |

---

## 🌐 Chrome Web Store Checklist

### Account Setup
- [ ] **Developer account created** — https://chrome.google.com/webstore/devconsole/
- [ ] **One-time $5 registration fee paid** — Required before first submission
- [ ] **Account verified** — Email verification complete

### Extension Package
- [x] **Extension ZIP ready** — `dist/chrome/` contains build
- [x] **manifest.json valid (Manifest V3)** — Validated, MV3 compliant
- [x] **Version number set** — `0.1.0`
- [x] **_locales included** — English default, German, French

### Icons (Required)
- [x] **128×128 icon** — `dist/chrome/icons/icon-128.png` ✓
- [x] **48×48 icon** — `dist/chrome/icons/icon-48.png` ✓
- [x] **16×16 icon** — `dist/chrome/icons/icon-16.png` ✓

### Store Listing Content
- [x] **Extension name** — "EuroCheck - EU Company Identifier" (35 chars)
- [x] **Short description** (max 132 chars) — "Instantly know if a website is European. Privacy-first: all lookups happen locally. Supports 320+ companies with ownership chains." (130 chars) ✓
- [x] **Detailed description** — Full marketing copy in `store/chrome-listing.md`
- [x] **Category selected** — Shopping (primary)
- [x] **Language** — English (with translations)

### Screenshots (Required: 1-5)
*Dimensions: 1280×800 or 640×400*

- [x] **Screenshot 1** — `store/screenshots/store-1-eu-company.png` (EU company result)
- [x] **Screenshot 2** — `store/screenshots/store-2-non-eu-company.png` (Non-EU company)
- [x] **Screenshot 3** — `store/screenshots/store-3-mixed-ownership.png` (Mixed ownership)
- [x] **Screenshot 4** — `store/screenshots/store-4-options.png` (Settings page)
- [x] **Screenshot 5** — `store/screenshots/store-5-unknown-domain.png` (Unknown domain)

### Promotional Images (Optional but Recommended)
- [x] **Small promo tile** (440×280) — `store/promo-tile.png`
- [ ] **Large promo tile** (920×680) — *Optional, for featured placement*
- [ ] **Marquee promo tile** (1400×560) — *Optional, for featured placement*

### Privacy & Policies
- [x] **Privacy policy URL** — Will be hosted at GitHub Pages or within repo
  - Content ready: `PRIVACY-POLICY.md`
- [ ] **Privacy policy published** — Need public URL (e.g., `https://pekka-eu.github.io/eurocheck/privacy`)
- [x] **No remote code execution** — All JS bundled locally ✓
- [x] **Permissions justified** — `activeTab`, `storage`, `tabs` only

### Pricing & Distribution
- [x] **Pricing** — Free
- [x] **Visibility** — Public
- [ ] **Distribution countries** — All (or select regions)

### Compliance
- [x] **Single purpose declared** — "Identify EU vs non-EU company ownership"
- [x] **No deceptive behavior** — Transparent functionality
- [x] **No data collection** — Verified, all local
- [ ] **Developer Program Policies reviewed** — https://developer.chrome.com/docs/webstore/program-policies/

---

## 🦊 Firefox Add-ons (AMO) Checklist

### Account Setup
- [ ] **Firefox Account created** — https://addons.mozilla.org/developers/
- [ ] **Developer Hub accessed** — Submit page available
- [ ] **Two-factor authentication** — Recommended for security

### Extension Package
- [x] **Extension ZIP/XPI ready** — `dist/firefox/` contains build
- [x] **manifest.json valid for Firefox** — MV3 with `browser_specific_settings`
- [x] **Gecko ID set** — `{e4f7c1b2-8a9d-4b3e-9c5f-6d8a7b2c1e0f}`
- [x] **Minimum Firefox version** — 126.0
- [x] **Version number set** — `0.1.0`

### Icons (Required)
- [x] **48×48 icon** — Required (present)
- [x] **128×128 icon** — Recommended for AMO listing (present)

### Store Listing Content
- [x] **Extension name** — "EuroCheck - EU Company Identifier"
- [x] **Summary** (max 250 chars) — Ready in `store-assets/firefox/listing.md`
- [x] **Description** — Full copy in `store/firefox-listing.md`
- [x] **Category** — Shopping / Privacy & Security
- [x] **Tags/Keywords** — european, privacy, shopping, company checker

### Screenshots (Required: 1+)
*Dimensions: flexible, recommend 1280×800*

- [x] **Screenshot 1** — Reuse Chrome screenshots
- [x] **Screenshot 2** — Multiple available in `store/screenshots/`

### Privacy & License
- [x] **Privacy policy content** — `PRIVACY-POLICY.md`
- [ ] **Privacy policy URL published** — Need public URL
- [x] **License selected** — MIT License (`LICENSE` file)
- [x] **Source code available** — Open source on GitHub

### Compliance
- [ ] **Add-on Policies reviewed** — https://extensionworkshop.com/documentation/publish/add-on-policies/
- [x] **No obfuscated code** — All source readable
- [x] **No remote code loading** — All bundled
- [ ] **Source code submission** — May be required for review (ZIP of src/)

---

## ✅ Pre-Submission Verification

### Functional Testing
- [x] **Chrome testing** — Extension loads and functions
- [x] **Firefox testing** — Extension loads and functions
- [x] **Popup displays correctly** — Tested on various domains
- [x] **Options page works** — Language switching, settings persist
- [x] **All supported languages** — EN, DE, FR verified

### Permission Audit
| Permission | Justification | Required |
|------------|---------------|----------|
| `activeTab` | Read current tab's domain for lookup | ✅ Yes |
| `storage` | Save user preferences locally | ✅ Yes |
| `tabs` | Access tab URL for domain extraction | ✅ Yes |

### Policy Compliance
- [x] **No user data collection** — Verified, 100% local
- [x] **No external network requests** — Verified
- [x] **No tracking/analytics** — Verified
- [x] **No crypto mining** — N/A
- [x] **No affiliate injection** — N/A
- [x] **No SEO manipulation** — N/A
- [x] **Clear, honest description** — Matches functionality
- [x] **No trademark violations** — Original branding

### Security Review
- [x] **No `eval()` usage** — Verified
- [x] **Content Security Policy** — Default MV3 restrictions
- [x] **No inline scripts** — Compliant with CSP
- [x] **No remote scripts** — All local

---

## 📁 Required Files Checklist

### Chrome Package Contents
```
dist/chrome/
├── manifest.json          ✅
├── background.js          ✅
├── _locales/
│   ├── en/messages.json   ✅
│   ├── de/messages.json   ✅
│   └── fr/messages.json   ✅
├── content/
│   └── content.js         ✅
├── popup/
│   ├── popup.html         ✅
│   ├── popup.js           ✅
│   └── popup.css          ✅
├── options/
│   ├── options.html       ✅
│   └── options.js         ✅
├── icons/
│   ├── icon-16.png        ✅
│   ├── icon-32.png        ✅
│   ├── icon-48.png        ✅
│   └── icon-128.png       ✅
└── data/
    └── companies.json     ✅
```

### Firefox Package Contents
```
dist/firefox/
├── manifest.json          ✅ (with gecko ID)
├── background.js          ✅
├── _locales/              ✅
├── content/               ✅
├── popup/                 ✅
├── options/               ✅
├── icons/                 ✅
└── data/                  ✅
```

---

## 🚀 Submission Workflow

### Chrome Web Store
1. [ ] Create developer account & pay $5
2. [ ] Create new item in Developer Dashboard
3. [ ] Upload ZIP of `dist/chrome/`
4. [ ] Fill in store listing (name, description, screenshots)
5. [ ] Add privacy policy URL
6. [ ] Set category to "Shopping"
7. [ ] Set visibility to "Public"
8. [ ] Submit for review
9. [ ] **Expected review time:** 1-3 business days

### Firefox Add-ons (AMO)
1. [ ] Create Firefox developer account
2. [ ] Go to Submit a New Add-on
3. [ ] Upload ZIP of `dist/firefox/`
4. [ ] Choose "On this site" for distribution
5. [ ] Fill in listing details
6. [ ] Add privacy policy URL
7. [ ] Select MIT License
8. [ ] Submit for review
9. [ ] **Expected review time:** 1-7 days (often faster)

---

## ⚠️ Remaining Blockers

### High Priority
1. **Privacy Policy URL** — Need to publish PRIVACY-POLICY.md to a public URL
   - Option A: GitHub Pages (`https://pekka-eu.github.io/eurocheck/privacy`)
   - Option B: GitHub repo raw file
   - Option C: Dedicated landing page

2. **Developer Accounts** — Need to create accounts on both stores
   - Chrome: $5 one-time fee
   - Firefox: Free

### Medium Priority
3. **Screenshot refinement** — Current screenshots functional but could be polished
4. **Large promo tiles** — Optional but helps with featuring

### Low Priority
5. **Additional languages** — Could add more localizations post-launch
6. **Safari version** — Requires Xcode wrapper project

---

## 📝 Post-Submission Tasks

- [ ] Monitor review status
- [ ] Respond to reviewer feedback (if any)
- [ ] Announce launch on r/BuyFromEU
- [ ] Set up GitHub Pages for privacy policy
- [ ] Create version 0.1.1 with any review feedback fixes

---

## 📚 Reference Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Chrome Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- [Firefox Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Extension Workshop (Mozilla)](https://extensionworkshop.com/)

---

*Checklist generated for EuroCheck v0.1.0 submission preparation.*
