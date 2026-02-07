# EuroCheck Technical SEO Audit

**Audit Date:** 2026-01-30  
**Auditor:** Pekka (Night Shift Wave 9)  
**Target:** Landing page at `/projects/004-eurocheck/landing/`  
**Production URL:** https://eurocheck.eu/

---

## Executive Summary

**Overall Score: 7.5/10** — Good foundation with room for improvement

### Quick Wins (High Impact, Low Effort)
1. ✅ Add canonical URL tag (5 min) — **CRITICAL**
2. ✅ Embed structured data JSON-LD (5 min) — **CRITICAL**
3. ⬜ Create robots.txt (2 min)
4. ⬜ Create sitemap.xml (5 min)
5. ⬜ Add preconnect hints for external resources (2 min)

---

## 1. Page Speed Analysis

### Score: 8/10

| Metric | Status | Notes |
|--------|--------|-------|
| HTML Size | ✅ Excellent | ~15KB uncompressed — very lean |
| CSS Size | ✅ Good | ~16KB — reasonable |
| External JS | ✅ None | No JavaScript dependencies! |
| Images | ⚠️ Needs Work | PNG screenshots could be WebP |
| Fonts | ✅ Excellent | System fonts only — no web font loads |
| Third-party | ✅ None | Zero external requests |

### Recommendations

**HIGH Priority:**
```html
<!-- Add preconnect for store links (when user hovers) -->
<link rel="preconnect" href="https://chrome.google.com" crossorigin>
<link rel="preconnect" href="https://addons.mozilla.org" crossorigin>
```

**MEDIUM Priority:**
- Convert PNG screenshots to WebP format (40-60% smaller)
- Add `width` and `height` attributes to all images (prevents CLS)
- Consider critical CSS inlining for above-fold content

**Core Web Vitals (Estimated):**
| Metric | Estimated | Target |
|--------|-----------|--------|
| LCP | < 1.5s | < 2.5s ✅ |
| FID | N/A (no JS) | < 100ms ✅ |
| CLS | ~0.05 | < 0.1 ✅ |

---

## 2. Mobile Friendliness

### Score: 9/10

| Check | Status | Notes |
|-------|--------|-------|
| Viewport meta | ✅ Present | `width=device-width, initial-scale=1.0` |
| Responsive CSS | ✅ Yes | Mobile-first with breakpoints |
| Touch targets | ✅ Good | Buttons have adequate size (48x48 min) |
| Font sizes | ✅ Good | Readable on mobile |
| Content width | ✅ Good | No horizontal scroll |
| Hero buttons | ✅ Good | Stack vertically on mobile |

### Code Verification
```css
/* Found in style.css - mobile-first approach */
:root {
  /* Spacing system scales properly */
  --space-md: 1rem;
  --space-lg: 1.5rem;
}
```

### Minor Issues
- Consider larger tap targets for nav links on small screens
- FAQ items could use larger click/tap area

---

## 3. SSL/Security

### Score: 7/10 (Needs deployment verification)

| Check | Status | Notes |
|-------|--------|-------|
| HTTPS ready | ✅ Yes | All links use https:// |
| Mixed content | ✅ None | No http:// resources |
| External links | ✅ Secure | `rel="noopener"` on target="_blank" |
| CSP header | ⬜ Not set | Should add Content-Security-Policy |
| HSTS | ⬜ Unknown | Check when deployed |

### Recommended Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'
```

---

## 4. Sitemap

### Score: 4/10

| Check | Status | Notes |
|-------|--------|-------|
| sitemap.xml | ❌ Missing | **CRITICAL** |
| Submitted to GSC | ❌ No | Need to create first |
| All pages included | N/A | — |

### Required Action
Create `/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://eurocheck.eu/</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://eurocheck.eu/privacy</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## 5. Robots.txt

### Score: 3/10

| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | ❌ Missing | **CRITICAL** |
| Sitemap reference | N/A | — |
| Crawl directives | N/A | — |

### Required Action
Create `/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://eurocheck.eu/sitemap.xml

# Block any future admin/api paths
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
```

---

## 6. Structured Data

### Score: 6/10

| Check | Status | Notes |
|-------|--------|-------|
| JSON-LD exists | ✅ Yes | In `structured-data.json` |
| Embedded in HTML | ❌ No | **MUST embed in `<head>`** |
| WebApplication | ✅ Complete | Very thorough schema |
| FAQPage | ✅ Complete | 7 FAQ items |
| Organization | ✅ Complete | — |
| BreadcrumbList | ✅ Present | — |
| Valid syntax | ✅ Yes | Well-formed JSON |

### Critical Action Required
The structured data exists in a separate JSON file but is NOT embedded in the HTML. Add this to `<head>`:

```html
<script type="application/ld+json">
/* Contents of structured-data.json */
</script>
```

### Validation
- Test with: https://search.google.com/test/rich-results
- Test with: https://validator.schema.org/

---

## 7. Meta Tags

### Score: 8/10

| Tag | Status | Value |
|-----|--------|-------|
| `<title>` | ✅ Good | "EuroCheck — Know Who Owns..." (53 chars) |
| `meta description` | ✅ Good | 147 chars, includes value prop |
| `og:title` | ✅ Present | Matches title |
| `og:description` | ✅ Present | Matches meta description |
| `og:image` | ✅ Present | og-image.png |
| `og:url` | ✅ Present | https://eurocheck.eu/ |
| `og:type` | ✅ Present | website |
| `twitter:card` | ✅ Present | summary_large_image |
| `canonical` | ❌ Missing | **CRITICAL** |
| `robots` | ❌ Missing | Should add |
| `theme-color` | ❌ Missing | Add for browser chrome |

### Required Additions
```html
<!-- Canonical URL - CRITICAL -->
<link rel="canonical" href="https://eurocheck.eu/">

<!-- Robots directive -->
<meta name="robots" content="index, follow, max-image-preview:large">

<!-- Theme color for browser chrome -->
<meta name="theme-color" content="#003399">

<!-- Missing OG tags -->
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="EuroCheck">
```

---

## 8. URL Structure

### Score: 9/10

| Check | Status | Notes |
|-------|--------|-------|
| Clean URLs | ✅ Yes | No query strings, IDs |
| Lowercase | ✅ Yes | All lowercase |
| Hyphens | ✅ Yes | Not underscores |
| Canonical | ❌ Missing | Need `<link rel="canonical">` |
| Trailing slashes | ✅ Consistent | Uses trailing slash |

### Current Structure
```
https://eurocheck.eu/           # Landing page
https://eurocheck.eu/privacy    # Privacy policy (planned)
```

---

## 9. Internal Linking

### Score: 8/10

| Check | Status | Notes |
|-------|--------|-------|
| Navigation present | ✅ Yes | Header nav with anchor links |
| Skip to content | ❌ Missing | Accessibility improvement |
| Footer links | ✅ Yes | Privacy, Terms, GitHub |
| Anchor text | ✅ Good | Descriptive links |
| Broken links | ⚠️ Check | External links point to generic store URLs |

### Internal Links Found
- `#features` — Features section
- `#how-it-works` — How it works
- `#faq` — FAQ section
- `#download` — Download CTA

### Recommended Addition
```html
<!-- Add skip link for accessibility -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

---

## 10. Image Optimization

### Score: 6/10

| Check | Status | Notes |
|-------|--------|-------|
| Alt text | ✅ Present | Descriptive alt on screenshot |
| Width/height | ✅ Present | On main screenshot |
| Lazy loading | ✅ Yes | `loading="lazy"` on below-fold |
| Format | ⚠️ PNG | Should use WebP |
| Compression | ⚠️ Unknown | Need to verify |
| Srcset | ❌ Missing | For responsive images |

### Images Found
```html
<img 
  src="../store/screenshots/1-eu-company.png" 
  alt="EuroCheck popup showing Spotify as a European Company..."
  loading="lazy"
  width="320"
  height="400"
>
```

### Recommendations
1. **Convert to WebP** with PNG fallback:
```html
<picture>
  <source srcset="screenshots/1-eu-company.webp" type="image/webp">
  <img src="screenshots/1-eu-company.png" alt="..." width="320" height="400">
</picture>
```

2. **Add srcset** for retina displays:
```html
<img 
  src="screenshot-1x.webp" 
  srcset="screenshot-1x.webp 1x, screenshot-2x.webp 2x"
  ...
>
```

---

## Priority Action Matrix

### 🔴 Critical (Do Immediately)
| Action | Impact | Effort | Status |
|--------|--------|--------|--------|
| Add `<link rel="canonical">` | High | 5 min | ⬜ |
| Embed structured data in HTML | High | 5 min | ⬜ |
| Create robots.txt | High | 2 min | ⬜ |
| Create sitemap.xml | High | 5 min | ⬜ |

### 🟡 Important (This Week)
| Action | Impact | Effort | Status |
|--------|--------|--------|--------|
| Add robots meta tag | Medium | 1 min | ⬜ |
| Add theme-color meta | Low | 1 min | ⬜ |
| Add og:locale and og:site_name | Medium | 2 min | ⬜ |
| Convert images to WebP | Medium | 15 min | ⬜ |
| Add skip-to-content link | Low | 5 min | ⬜ |

### 🟢 Nice to Have (This Month)
| Action | Impact | Effort | Status |
|--------|--------|--------|--------|
| Add preconnect hints | Low | 2 min | ⬜ |
| Implement srcset for images | Low | 20 min | ⬜ |
| Add security headers | Medium | 10 min | ⬜ |
| Critical CSS inlining | Low | 30 min | ⬜ |
| Submit to Google Search Console | High | 10 min | ⬜ |

---

## Code Snippets for Implementation

### Complete `<head>` additions (copy-paste ready)
```html
<!-- Add after existing meta tags -->

<!-- Canonical URL -->
<link rel="canonical" href="https://eurocheck.eu/">

<!-- Robots directive -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">

<!-- Theme color -->
<meta name="theme-color" content="#003399">

<!-- Additional Open Graph -->
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="EuroCheck">

<!-- Preconnect hints -->
<link rel="preconnect" href="https://chrome.google.com">
<link rel="preconnect" href="https://addons.mozilla.org">

<!-- Structured Data (paste contents of structured-data.json) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    /* ... full contents from structured-data.json ... */
  ]
}
</script>
```

---

## Monitoring Checklist

After deployment, verify with these tools:

- [ ] **Google Search Console** — Submit sitemap, check indexing
- [ ] **Bing Webmaster Tools** — Secondary search engine coverage
- [ ] **PageSpeed Insights** — Core Web Vitals score
- [ ] **Rich Results Test** — Structured data validation
- [ ] **Mobile-Friendly Test** — Google's mobile check
- [ ] **SSL Labs** — HTTPS configuration (when deployed)
- [ ] **Security Headers** — Check security headers

---

## Summary

The EuroCheck landing page has a **solid technical SEO foundation** with excellent semantic HTML, mobile responsiveness, and performance (no JavaScript!). The main gaps are:

1. **Missing canonical URL** — Search engines may index duplicate versions
2. **Structured data not embedded** — Rich snippets won't appear
3. **No robots.txt or sitemap** — Crawlers have no guidance

All critical issues can be fixed in under 30 minutes. Once these are addressed, the technical SEO score should jump from 7.5/10 to 9/10.

---

*Audit completed: 2026-01-30 01:00 | Night Shift Wave 9*
