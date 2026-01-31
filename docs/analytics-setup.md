# EuroCheck Landing Page Analytics Setup

## Recommendation: Plausible Analytics

After evaluating options, **Plausible Analytics** is the best fit:

| Feature | Plausible | Google Analytics | Umami |
|---------|-----------|------------------|-------|
| Privacy-focused | ✅ No cookies | ❌ Requires consent | ✅ No cookies |
| GDPR compliant | ✅ Built-in | ⚠️ Needs config | ✅ Built-in |
| Self-hosted option | ✅ Yes | ❌ No | ✅ Yes |
| Script size | ~1 KB | ~45 KB | ~2 KB |
| Dashboard | ✅ Clean, simple | ⚠️ Complex | ✅ Good |
| Cost | $9/mo or free (self) | Free | Free (self-hosted) |

### Why Plausible?
- **No cookie banner needed** — Doesn't use cookies, fully GDPR compliant out of the box
- **Lightweight** — 1 KB script won't slow down the page
- **Simple** — Shows what matters without overwhelming dashboards
- **Privacy-respecting** — Aligns with EuroCheck's European values

---

## Quick Setup (Plausible Cloud)

### 1. Sign Up
Go to [plausible.io](https://plausible.io) and start a 30-day free trial.

### 2. Add Site
Add `eurocheck.eu` as your domain.

### 3. Add Tracking Script
Add this before `</head>` in `index.html` and all other pages:

```html
<script defer data-domain="eurocheck.eu" src="https://plausible.io/js/script.js"></script>
```

That's it! Basic pageviews will be tracked immediately.

---

## Event Tracking

Track key actions with custom events:

### Install Button Clicks
```html
<a href="https://chrome.google.com/webstore/..." 
   onclick="plausible('Install Click', {props: {browser: 'chrome'}})">
  Add to Chrome
</a>
```

### Firefox Install
```html
<a href="https://addons.mozilla.org/..." 
   onclick="plausible('Install Click', {props: {browser: 'firefox'}})">
  Add to Firefox
</a>
```

### Scroll Depth (optional)
```html
<script>
  // Track when users scroll to FAQ section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        plausible('Scroll', {props: {section: entry.target.id}});
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.5});
  
  document.querySelectorAll('section[id]').forEach(el => observer.observe(el));
</script>
```

### External Link Clicks (auto)
Add `file-downloads` and `outbound-links` extensions:
```html
<script defer data-domain="eurocheck.eu" 
        src="https://plausible.io/js/script.file-downloads.outbound-links.js"></script>
```

---

## Key Events to Track

| Event Name | Props | Purpose |
|------------|-------|---------|
| `Install Click` | `{browser: 'chrome'/'firefox'}` | Main conversion |
| `FAQ Open` | `{question: 'text'}` | What users wonder about |
| `Scroll` | `{section: 'id'}` | Engagement depth |
| `Outbound Link` | (auto with extension) | Where users go |

---

## Implementation Checklist

### index.html
- [ ] Add Plausible script to `<head>`
- [ ] Add `onclick` handler to Chrome install button
- [ ] Add `onclick` handler to Firefox install button

### faq.html
- [ ] Add Plausible script to `<head>`
- [ ] Track FAQ question opens

### All Pages
- [ ] Consistent script placement
- [ ] Test events in Plausible dashboard

---

## Code Snippet for index.html

Add to `<head>`:
```html
<!-- Analytics - Privacy-focused, no cookies -->
<script defer data-domain="eurocheck.eu" src="https://plausible.io/js/script.js"></script>
```

Modify install buttons:
```html
<!-- Chrome -->
<a href="https://chrome.google.com/webstore/detail/eurocheck/..." 
   class="cta-button"
   onclick="plausible('Install Click', {props: {browser: 'chrome'}})">
  Add to Chrome — Free
</a>

<!-- Firefox -->
<a href="https://addons.mozilla.org/firefox/addon/eurocheck/..." 
   class="cta-button-secondary"
   onclick="plausible('Install Click', {props: {browser: 'firefox'}})">
  Get for Firefox
</a>
```

---

## Self-Hosted Alternative

If you want to avoid the $9/mo cost:

### Option 1: Plausible Community Edition
```bash
# Docker Compose setup
git clone https://github.com/plausible/community-edition
cd community-edition
docker-compose up -d
```
Runs on port 8000 by default.

### Option 2: Umami
```bash
# Similar setup, different tool
git clone https://github.com/umami-software/umami
cd umami
docker-compose up -d
```

Both work great, but Plausible's hosted version is worth it for simplicity.

---

## Dashboard Access

Once set up, access analytics at:
- **Plausible Cloud:** https://plausible.io/eurocheck.eu
- **Self-hosted:** https://your-domain:8000/eurocheck.eu

Make it public (optional) to share transparency with users:
Settings → Visibility → Public Dashboard

---

## Notes

- **No consent banner needed** — Plausible doesn't use cookies or track personal data
- **EU-compliant hosting** — Plausible servers are in the EU
- **Simple is better** — Don't over-engineer; track install clicks and pageviews
- **Review weekly** — Check what's working, where users drop off
