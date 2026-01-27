# EuroCheck Store Submission Checklist

**Created:** January 27, 2026  
**Status:** 🟢 READY FOR SUBMISSION

---

## Pre-Submission Requirements

### Extension Code
- [x] All source code complete (`/src/`)
- [x] No console.log statements in production code
- [x] Error handling implemented
- [x] i18n fully implemented (31 languages)
- [x] Performance optimizations applied

### Extension Manifest
- [x] manifest.json valid for Chrome (MV3)
- [x] manifest.json valid for Firefox (MV3)
- [x] Permissions minimal and justified
- [x] All icon sizes present (16, 32, 48, 128)
- [x] Version number set (0.1.0)

### Data Files
- [x] companies.json (840 companies)
- [x] domains.json (404 domains)
- [x] Data format validated

### Localizations
- [x] **31 languages supported:**
  - be, bg, ca, cs, da, de, el, en, es, et
  - fi, fr, ga, hr, hu, it, lt, lv, mk, nl
  - no, pl, pt, ro, sk, sl, sq, sr, sv, tr, uk

---

## Store Assets Ready

### Chrome Web Store
Location: `/store-assets/chrome/`
- [x] `listing.md` — Short + full description, features, keywords
- [x] `screenshot-specs.md` — 5 screenshot specifications

**To create before submission:**
- [ ] 5 screenshots (1280x800 or 640x400)
- [ ] Promo tile (440x280, optional)
- [ ] Icon 128x128 (use `/src/icons/icon-128.png`)

### Firefox Add-ons (AMO)
Location: `/store-assets/firefox/`
- [x] `listing.md` — Summary + full description, features, keywords
- [x] `screenshot-specs.md` — 5 screenshot specifications

**To create before submission:**
- [ ] 5 screenshots (PNG/JPG)
- [ ] Icon 128x128 (use `/src/icons/icon-128.png`)

---

## Documentation
- [x] README.md
- [x] PRIVACY-POLICY.md (GDPR-compliant)
- [x] LICENSE (MIT)
- [x] CHANGELOG.md
- [x] CONTRIBUTING.md
- [x] QA-REPORT.md

---

## Testing Completed
See: `/QA-REPORT.md`

| Test | Status |
|------|--------|
| Extension loads | ✅ PASS |
| EU company detection | ✅ PASS |
| Non-EU company detection | ✅ PASS |
| Unknown domain handling | ✅ PASS |
| Edge cases | ✅ PASS |
| i18n (de, fr) | ✅ PASS |
| Settings page | ⚠️ MINOR (link non-functional) |
| Error states | ✅ PASS |

**Overall:** READY FOR RELEASE

---

## Build Commands

### Create Distribution Packages
```bash
cd /Users/antti/clawd/projects/004-eurocheck

# Chrome (creates dist/chrome/)
npm run build:chrome

# Firefox (creates dist/firefox/)
npm run build:firefox
```

### Test in Browsers
```bash
# Chrome
./test-extension.sh chrome

# Firefox
./test-extension.sh firefox
```

---

## Submission Steps

### Chrome Web Store

1. Go to: https://chrome.google.com/webstore/devconsole
2. Log in with: eurocheck-team@googlegroups.com
3. Click "New Item"
4. Upload `dist/chrome.zip`
5. Fill in store listing (from `/store-assets/chrome/listing.md`):
   - Short description (132 chars)
   - Detailed description
   - Category: Shopping
   - Language: English (default)
6. Upload screenshots (follow specs in `screenshot-specs.md`)
7. Set privacy practices:
   - No data collection
   - No remote code
   - Single purpose: EU company identification
8. Submit for review

**Estimated review time:** 1-3 business days

### Firefox Add-ons (AMO)

1. Go to: https://addons.mozilla.org/developers/
2. Log in with Mozilla account
3. Click "Submit a New Add-on"
4. Upload `dist/firefox.zip` (or submit for self-hosting)
5. Fill in listing (from `/store-assets/firefox/listing.md`):
   - Summary (250 chars)
   - Description
   - Categories: Privacy & Security, Shopping
6. Upload screenshots
7. Submit for review

**Estimated review time:** 1-7 days (AMO is more thorough)

---

## Post-Submission

- [ ] Monitor email for review feedback
- [ ] Address any reviewer comments
- [ ] Prepare marketing materials
- [ ] Announce on social media (LinkedIn 10K, Twitter 8.2K)

---

## Contact

**Publisher:** EuroCheck Team  
**Email:** eurocheck-team@googlegroups.com  
**GitHub:** https://github.com/pekka-eu/eurocheck

---

*Checklist complete. Extension ready for store submission!* 🚀
