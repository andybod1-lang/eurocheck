# EuroCheck Landing Page Pre-Launch Checklist

## Critical - Must Fix Before Launch

### Links & URLs
- [x] **Chrome Web Store link** - Updated to actual extension URL
- [x] **Firefox Add-ons link** - Updated to actual extension URL
- [ ] **Privacy Policy link** - Update `/privacy` to `https://andybod1-lang.github.io/eurocheck-privacy/`
- [ ] **Terms of Use link** - Create terms page or remove link
- [ ] **GitHub link** - ✅ Correct: `https://github.com/andybod1-lang/eurocheck`
- [ ] **Contact email** - ✅ Correct: `ea.pekka@proton.me`
- [ ] **Buy Me a Coffee link** - ✅ Correct: `https://buymeacoffee.com/pekkaprime`

### Images & Assets
- [ ] **Screenshot path** - Fix `../store/screenshots/1-eu-company.png` → `1-eu-company.png` (after copying to docs/)
- [ ] **OG Image** - Create `og-image.png` (1200x630px) for social sharing
- [ ] **Favicon** - ✅ Using inline SVG (EU flag emoji)

### Meta Tags
- [ ] **og:url** - Update if not using eurocheck.eu domain
- [ ] **og:image** - Ensure og-image.png exists at specified URL
- [ ] **twitter:image** - Same as og:image

---

## Important - Should Fix

### Content
- [ ] **User count** - Update "Join 1,000+ users" with actual number (or change to "Join our community")
- [ ] **Company count** - Verify "321+ companies" matches actual database
- [ ] **Copyright year** - ✅ Shows 2025

### Accessibility
- [ ] Test with keyboard navigation (Tab key)
- [ ] Test with screen reader (VoiceOver on Mac)
- [ ] Check color contrast ratios
- [ ] Verify alt text on images

### Responsiveness
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1200px+ width)
- [ ] Check sticky header on scroll

---

## Nice to Have

### Performance
- [ ] Optimize screenshot image (WebP format, compress)
- [ ] Consider preloading critical fonts
- [ ] Add resource hints for external links

### SEO
- [ ] Add structured data (Organization schema)
- [ ] Create robots.txt
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console

### Analytics (Optional)
- [ ] Add privacy-friendly analytics (Plausible, Fathom)
- [ ] Or: Intentionally skip analytics (privacy-first messaging)

### Legal
- [ ] Privacy Policy hosted and linked ✅ (separate repo exists)
- [ ] Terms of Service (optional for free extension)
- [ ] Cookie banner (not needed - no cookies!)

---

## Testing Checklist

### Browsers
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Functionality
- [ ] All navigation links work
- [ ] Smooth scroll to sections
- [ ] FAQ accordions open/close
- [ ] External links open in new tab
- [ ] Buttons have hover states

### SSL/Security
- [ ] HTTPS enforced (GitHub Pages setting)
- [ ] No mixed content warnings
- [ ] All external resources use HTTPS

---

## Post-Launch

After deployment:
- [ ] Verify all links work on live site
- [ ] Test social sharing (paste URL in Twitter, Discord, etc.)
- [ ] Check OG image displays correctly
- [ ] Monitor GitHub Pages build status
- [ ] Share landing page URL in relevant communities

---

## Quick Fixes Reference

### Update Store Links (in index.html)

```html
<!-- Chrome -->
href="https://chrome.google.com/webstore/detail/eurocheck/YOUR_EXTENSION_ID"

<!-- Firefox -->
href="https://addons.mozilla.org/firefox/addon/eurocheck/"

<!-- Edge (optional, same as Chrome if using same package) -->
href="https://microsoftedge.microsoft.com/addons/detail/eurocheck/YOUR_EDGE_ID"
```

### Update Privacy Policy Link

```html
<a href="https://andybod1-lang.github.io/eurocheck-privacy/">Privacy Policy</a>
```

### Fix Image Path

```html
<!-- Change from -->
src="../store/screenshots/1-eu-company.png"

<!-- To -->
src="1-eu-company.png"
```

### Update Meta URLs (if not using eurocheck.eu)

```html
<meta property="og:url" content="https://andybod1-lang.github.io/eurocheck/">
<meta property="og:image" content="https://andybod1-lang.github.io/eurocheck/og-image.png">
<meta name="twitter:image" content="https://andybod1-lang.github.io/eurocheck/og-image.png">
```
