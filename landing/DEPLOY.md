# EuroCheck Landing Page Deployment Guide

## Overview

The landing page needs to be deployed as a static site. **GitHub Pages** is the recommended option since the repo is already public.

**Repo:** https://github.com/andybod1-lang/eurocheck (PUBLIC)

---

## Option 1: GitHub Pages (Recommended)

**Note:** The `/docs` folder contains project documentation. Use the **gh-pages branch** method.

### Deploy via gh-pages branch (Recommended)

Run the deployment script:

```bash
./landing/deploy-landing.sh
```

Or manually:

```bash
cd /Users/antti/clawd/projects/004-eurocheck

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create temporary directory with landing files
mkdir -p /tmp/eurocheck-landing
cp landing/index.html /tmp/eurocheck-landing/
cp landing/style.css /tmp/eurocheck-landing/
cp store/screenshots/1-eu-company.png /tmp/eurocheck-landing/

# Fix image path
sed -i '' 's|../store/screenshots/||g' /tmp/eurocheck-landing/index.html

# Create/update gh-pages branch
git checkout --orphan gh-pages-temp
git rm -rf .
cp /tmp/eurocheck-landing/* .
git add .
git commit -m "Update landing page"

# Force push to gh-pages
git branch -D gh-pages 2>/dev/null || true
git branch -m gh-pages
git push -f origin gh-pages

# Return to original branch
git checkout $CURRENT_BRANCH

# Cleanup
rm -rf /tmp/eurocheck-landing
```

### Enable GitHub Pages:

1. Go to: https://github.com/andybod1-lang/eurocheck/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** → **/ (root)**
4. Click **Save**

**Wait 1-2 minutes** for deployment.

**Access site at:** https://andybod1-lang.github.io/eurocheck/

---

## Option 2: Custom Domain Setup

### For eurocheck.eu (if acquired):

1. **Create CNAME file in docs/:**
   ```
   eurocheck.eu
   ```

2. **Configure DNS (at domain registrar):**
   
   **A Records (apex domain):**
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   
   **CNAME Record (www subdomain):**
   ```
   www → andybod1-lang.github.io
   ```

3. **Enable HTTPS in GitHub Pages settings:**
   - Wait for DNS propagation (up to 24h)
   - Check "Enforce HTTPS" in settings

### For subdomain (e.g., www.eurocheck.eu):

1. **CNAME file contains:**
   ```
   www.eurocheck.eu
   ```

2. **DNS CNAME record:**
   ```
   www → andybod1-lang.github.io
   ```

---

## Option 3: Alternative Platforms

### Vercel (Free)

1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory to `landing/`
4. Deploy

**Pros:** Instant deploys, preview URLs, free SSL
**Cons:** Another account to manage

### Netlify (Free)

1. Go to https://netlify.com
2. New site from Git
3. Build settings:
   - Base directory: `landing`
   - Build command: (leave empty)
   - Publish directory: `landing`

**Pros:** Form handling, split testing
**Cons:** Another account to manage

### Cloudflare Pages (Free)

1. Go to https://pages.cloudflare.com
2. Connect GitHub
3. Set framework preset to "None"
4. Root directory: `landing/`

**Pros:** Global CDN, analytics, DDoS protection
**Cons:** More complex setup

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Update store links (Chrome, Firefox) with actual URLs
- [ ] Fix image paths (relative → same directory)
- [ ] Update or remove meta URL references if not using eurocheck.eu
- [ ] Link privacy policy to actual GitHub Pages URL
- [ ] Test locally: `python3 -m http.server 8080`

---

## Quick Deploy

The deployment script is ready to use:

```bash
cd /Users/antti/clawd/projects/004-eurocheck
./landing/deploy-landing.sh
```

This script:
1. Copies landing files to temp directory
2. Fixes image paths
3. Creates/updates gh-pages branch
4. Pushes to GitHub
5. Returns you to your original branch

---

## URLs After Deployment

| Type | URL |
|------|-----|
| GitHub Pages (default) | https://andybod1-lang.github.io/eurocheck/ |
| Custom domain (if set) | https://eurocheck.eu/ |
| Privacy Policy | https://andybod1-lang.github.io/eurocheck-privacy/ |

---

## Monitoring

GitHub Pages provides:
- Build status in Actions tab
- No built-in analytics

For analytics, consider:
- Plausible Analytics (privacy-friendly, €9/mo)
- Fathom Analytics (privacy-friendly)
- Simple Analytics

Or skip analytics entirely (aligns with privacy-first messaging).
