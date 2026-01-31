# EU Alternative Suggestions - UI Mockup

## Design Philosophy

**Core Principles:**
1. **Helpful, not intrusive** — Inform, don't block or nag
2. **Dismissable** — One click and it's gone
3. **Smart timing** — Don't appear during checkout or repeatedly
4. **Consistent** — Match EuroCheck's existing visual language
5. **Accessible** — Works for all users, including keyboard navigation

---

## Banner Component

### Position & Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                      [ Page Content ]                               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ 🇪🇺 Shopping outside the EU?  Try these alternatives:              │
│    Zalando • About You • H&M                    [Not now] [×]       │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Position:** Fixed bottom of viewport (doesn't scroll with page)
- **Width:** 100% viewport width
- **Height:** ~56px (compact, single line on desktop)
- **Z-index:** High but below browser UI (99999)
- **Animation:** Slide up from bottom (300ms ease-out)

### Visual Design

```css
.eurocheck-alternatives-banner {
  /* Position */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  
  /* Size */
  padding: 12px 20px;
  min-height: 56px;
  
  /* Colors - Light mode */
  background: linear-gradient(135deg, #1a3a5c 0%, #0f4c81 100%);
  color: #ffffff;
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  /* Style */
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  
  /* Animation */
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Color Scheme

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `#1a3a5c` → `#0f4c81` gradient | `#0d1b2a` → `#1b263b` gradient |
| Text | `#ffffff` | `#e0e1dd` |
| Links (alternatives) | `#7dd3fc` | `#90cdf4` |
| Links (hover) | `#bae6fd` | `#c6f6d5` |
| Buttons | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.1)` |
| Button hover | `rgba(255,255,255,0.25)` | `rgba(255,255,255,0.2)` |
| EU flag emoji | 🇪🇺 (native) | 🇪🇺 (native) |

### Component Structure

```html
<div class="eurocheck-alternatives-banner" role="complementary" aria-label="EU shopping alternatives">
  <!-- Left: Message -->
  <div class="eurocheck-banner-content">
    <span class="eurocheck-banner-icon">🇪🇺</span>
    <span class="eurocheck-banner-text">
      <strong>Shopping outside the EU?</strong>
      <span class="eurocheck-banner-separator">Try:</span>
    </span>
    <div class="eurocheck-alternatives-list">
      <a href="https://www.zalando.com" target="_blank" rel="noopener">Zalando</a>
      <span class="eurocheck-dot">•</span>
      <a href="https://www.aboutyou.com" target="_blank" rel="noopener">About You</a>
      <span class="eurocheck-dot">•</span>
      <a href="https://www.hm.com" target="_blank" rel="noopener">H&M</a>
    </div>
  </div>
  
  <!-- Right: Actions -->
  <div class="eurocheck-banner-actions">
    <button class="eurocheck-btn-dismiss" aria-label="Dismiss for now">
      Not now
    </button>
    <button class="eurocheck-btn-close" aria-label="Close banner">
      <svg><!-- × icon --></svg>
    </button>
  </div>
</div>
```

---

## Mobile Responsive Design

### Breakpoint: < 640px

```
┌────────────────────────────────────┐
│ 🇪🇺 Shopping outside the EU?      │
│ Try: Zalando • About You • H&M     │
│                        [✕]         │
└────────────────────────────────────┘
```

```css
@media (max-width: 640px) {
  .eurocheck-alternatives-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
    gap: 8px;
  }
  
  .eurocheck-banner-content {
    flex-wrap: wrap;
  }
  
  .eurocheck-btn-dismiss {
    display: none; /* Just show X on mobile */
  }
  
  .eurocheck-btn-close {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}
```

### Breakpoint: < 400px

Don't show the banner at all — screen too small, would be too intrusive.

```javascript
if (window.innerWidth < 400) {
  return; // Skip banner on very small screens
}
```

---

## Interaction States

### Hover States

```css
/* Alternative links */
.eurocheck-alternatives-list a:hover {
  color: #bae6fd;
  text-decoration: underline;
}

/* Buttons */
.eurocheck-btn-dismiss:hover,
.eurocheck-btn-close:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

### Focus States (Accessibility)

```css
.eurocheck-alternatives-list a:focus,
.eurocheck-btn-dismiss:focus,
.eurocheck-btn-close:focus {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
```

### Click Feedback

```css
.eurocheck-btn-dismiss:active,
.eurocheck-btn-close:active {
  transform: scale(0.95);
}
```

---

## Dismiss Animation

When user clicks "Not now" or ×:

```css
.eurocheck-alternatives-banner.eurocheck-dismissing {
  animation: slideDown 0.25s ease-in forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
```

---

## Contextual Menu (Optional Enhancement)

Right-clicking the banner shows additional options:

```
┌──────────────────────────────────┐
│ ✓ Show alternatives for fashion  │
│   Show alternatives for all      │
├──────────────────────────────────┤
│   Don't show for amazon.de       │
│   Disable all suggestions        │
├──────────────────────────────────┤
│   Give feedback                  │
└──────────────────────────────────┘
```

---

## Settings Integration

### Options Page Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  EU Alternative Suggestions                                    [?]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [✓] Show EU alternatives when visiting non-EU shops                │
│                                                                     │
│  How often:                                                         │
│  ○ Always                                                           │
│  ● Once per session (recommended)                                   │
│  ○ Once per shop                                                    │
│  ○ Once per day                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Dismissed shops: 3                                                 │
│  Amazon, AliExpress, Shein                    [Reset all]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Popup Quick Toggle

In the main EuroCheck popup, add a quick toggle:

```
┌───────────────────────────────────┐
│  EuroCheck                   [⚙]  │
├───────────────────────────────────┤
│  ✓ EU Company Detection           │
│  ✓ GDPR Privacy Warnings          │
│  ✓ EU Alternative Suggestions  ←  │
└───────────────────────────────────┘
```

---

## Accessibility Checklist

- [x] `role="complementary"` on banner
- [x] `aria-label` describing purpose
- [x] `aria-label` on icon-only buttons
- [x] Focus visible on all interactive elements
- [x] Keyboard navigable (Tab through links and buttons)
- [x] Escape key closes banner
- [x] Sufficient color contrast (WCAG AA)
- [x] Respects `prefers-reduced-motion`
- [x] Works with screen readers

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .eurocheck-alternatives-banner {
    animation: none;
  }
  .eurocheck-alternatives-banner.eurocheck-dismissing {
    animation: none;
    display: none;
  }
}
```

---

## Smart Display Logic

### When to Show

```javascript
const shouldShow = () => {
  // 1. Feature enabled?
  if (!settings.euAlternatives.enabled) return false;
  
  // 2. Not on checkout page?
  if (isCheckoutPage()) return false;
  
  // 3. Frequency rules satisfied?
  if (!checkFrequencyRules()) return false;
  
  // 4. Shop not dismissed?
  if (settings.euAlternatives.dismissedShops.includes(shopId)) return false;
  
  // 5. Screen big enough?
  if (window.innerWidth < 400) return false;
  
  // 6. Another banner not already showing?
  if (document.querySelector('.eurocheck-alternatives-banner')) return false;
  
  return true;
};
```

### Frequency Rules

| Setting | Logic |
|---------|-------|
| `always` | Always show (if other conditions met) |
| `once_per_session` | Check `sessionStorage.euAlternativesShown` |
| `once_per_shop` | Check if current shop in `shownShops` array |
| `once_per_day` | Compare `lastShown` timestamp to 24h ago |

### Checkout Detection

```javascript
const isCheckoutPage = () => {
  const url = window.location.href.toLowerCase();
  const checkoutPatterns = [
    /\/checkout/,
    /\/cart/,
    /\/basket/,
    /\/payment/,
    /\/order/,
    /\/purchase/,
    /\/pay\b/
  ];
  return checkoutPatterns.some(p => p.test(url));
};
```

---

## Example Screenshots

### Desktop (1440px)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [amazon.de header]                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│                              Amazon.de Product Page                                 │
│                                                                                     │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ 🇪🇺 Shopping outside the EU?  Try: Zalando • About You • H&M        [Not now] [×]   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (375px)

```
┌───────────────────────────────┐
│ [amazon.de]                   │
├───────────────────────────────┤
│                               │
│   Amazon.de                   │
│   Product Page                │
│                               │
│                               │
├───────────────────────────────┤
│ 🇪🇺 Shopping outside the EU?  │
│ Try: Zalando • About You   [×]│
└───────────────────────────────┘
```

---

## Implementation Priority

1. **Phase 1:** Basic banner with dismiss (ship first)
2. **Phase 2:** Settings integration
3. **Phase 3:** Smart frequency
4. **Phase 4:** Context menu / "Don't show for this shop"
5. **Phase 5:** Category-aware suggestions

---

## Files to Create

```
src/
├── content/
│   └── eu-alternatives.css      # All styles above
├── features/
│   └── eu-alternatives/
│       ├── ui.js                # Banner rendering logic
│       └── ui.test.js           # UI tests
└── _locales/
    ├── en/messages.json         # English strings
    ├── de/messages.json         # German strings
    ├── fi/messages.json         # Finnish strings
    └── fr/messages.json         # French strings
```
