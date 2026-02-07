# EU Alternative Suggestions Feature Specification

**Version:** 1.0.0  
**Status:** Design  
**Created:** 2025-07-13  

## Overview

When users browse non-EU online shops (Amazon, AliExpress, Shein, etc.), EuroCheck will display a subtle, non-intrusive suggestion banner showing EU-based alternatives. The goal is to help users discover European shops that offer similar products with better data protection, shorter shipping times, and support for the EU economy.

## Goals

1. **Educate** — Help users realize when they're shopping outside the EU
2. **Suggest** — Offer relevant EU alternatives without being pushy
3. **Respect** — Never annoy the user; one gentle nudge per session is enough
4. **Empower** — Let users easily enable/disable and customize the feature

## Non-Goals

- Not a price comparison tool
- Not blocking or restricting access to non-EU shops
- Not collecting any shopping behavior data

---

## Detection Logic

### Domain Matching

The extension detects non-EU shops by matching the current URL's hostname against a curated list in `non-eu-shops.json`.

```javascript
// Pseudo-code
const hostname = new URL(tab.url).hostname;
const shop = nonEuShops.find(shop => 
  shop.domains.some(domain => hostname.includes(domain))
);
```

### Pattern Types

1. **Exact domain match**: `aliexpress.com` → matches `www.aliexpress.com`
2. **Wildcard subdomains**: `amazon.*` → matches `amazon.de`, `amazon.fr`, `amazon.es`
3. **Regional TLDs**: Handled via patterns like `amazon.de`, `amazon.co.uk`

### Categories

Each non-EU shop is tagged with categories to enable relevant alternative suggestions:

- `fashion` — Clothing, shoes, accessories
- `electronics` — Computers, phones, gadgets
- `general` — Multi-category marketplace
- `home` — Furniture, home goods, decor
- `beauty` — Cosmetics, skincare, perfume
- `sports` — Athletic wear, equipment
- `toys` — Games, children's products

---

## EU Alternatives Database

### Structure (`eu-alternatives.json`)

```json
{
  "alternatives": [
    {
      "id": "zalando",
      "name": "Zalando",
      "url": "https://www.zalando.com",
      "country": "DE",
      "categories": ["fashion", "sports", "beauty"],
      "description": "Europe's leading online fashion platform",
      "coverage": ["DE", "AT", "CH", "FR", "IT", "ES", "NL", "PL", "SE", "FI"],
      "founded": 2008,
      "highlights": ["Free returns", "30-day returns", "EU company"]
    }
  ]
}
```

### Selection Algorithm

When a user visits a non-EU shop:

1. Get the shop's categories
2. Filter EU alternatives that share at least one category
3. Prefer alternatives that ship to user's country (if known from locale)
4. Randomly select 2-3 alternatives to show
5. Avoid showing the same alternatives repeatedly (track shown IDs)

```javascript
function getAlternatives(shopCategories, userLocale, recentlyShown) {
  return euAlternatives
    .filter(alt => alt.categories.some(c => shopCategories.includes(c)))
    .filter(alt => !recentlyShown.includes(alt.id))
    .sort((a, b) => {
      // Prefer alternatives available in user's country
      const aHasCountry = a.coverage.includes(userLocale);
      const bHasCountry = b.coverage.includes(userLocale);
      return bHasCountry - aHasCountry;
    })
    .slice(0, 3);
}
```

---

## User Settings

### Options (stored in `chrome.storage.sync`)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `euAlternatives.enabled` | boolean | `true` | Master on/off switch |
| `euAlternatives.frequency` | enum | `"once_per_session"` | How often to show suggestions |
| `euAlternatives.dismissedShops` | string[] | `[]` | Shops where user clicked "Don't show again" |
| `euAlternatives.preferredCountries` | string[] | auto-detect | EU countries user shops in |

### Frequency Options

- `"always"` — Show on every non-EU shop visit
- `"once_per_session"` — Show once per browser session (default)
- `"once_per_shop"` — Show once per unique shop
- `"once_per_day"` — Maximum once per day
- `"disabled"` — Never show

### Settings UI

Add to extension's options page:

```
┌─────────────────────────────────────────────────────────┐
│ EU Alternative Suggestions                              │
├─────────────────────────────────────────────────────────┤
│ ☑ Show EU alternatives when visiting non-EU shops      │
│                                                          │
│ How often: [Once per session ▾]                         │
│                                                          │
│ Reset dismissed shops: [Reset]                          │
│   (3 shops currently dismissed)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Display Logic & Triggers

### When to Show

1. User navigates to a URL matching a non-EU shop
2. Feature is enabled in settings
3. Frequency rules allow showing (not already shown this session/day/etc.)
4. Shop is not in user's dismissed list
5. Page has finished loading (wait for `document.readyState === 'complete'`)

### When NOT to Show

- On checkout/payment pages (don't interrupt purchases)
- If user dismissed within last 30 seconds
- If another EuroCheck banner is already visible
- On mobile viewports < 400px (too small)

### Checkout Detection

Avoid these URL patterns:
```javascript
const checkoutPatterns = [
  /\/checkout/i,
  /\/cart/i,
  /\/basket/i,
  /\/payment/i,
  /\/order/i,
  /\/buy/i
];
```

---

## Technical Implementation

### Files to Create/Modify

```
src/
├── features/
│   └── eu-alternatives/
│       ├── index.js           # Feature entry point
│       ├── detector.js        # Shop detection logic
│       ├── suggestions.js     # Alternative selection
│       ├── ui.js              # Banner rendering
│       └── settings.js        # Settings management
├── data/
│   ├── non-eu-shops.json      # Shop detection database
│   └── eu-alternatives.json   # EU alternatives database
└── content/
    └── eu-alternatives.css    # Banner styles
```

### Content Script Flow

```javascript
// content.js
import { detectNonEuShop } from './features/eu-alternatives/detector';
import { shouldShowSuggestion } from './features/eu-alternatives/settings';
import { renderSuggestionBanner } from './features/eu-alternatives/ui';

async function init() {
  const shop = detectNonEuShop(window.location.href);
  if (!shop) return;
  
  const canShow = await shouldShowSuggestion(shop.id);
  if (!canShow) return;
  
  const alternatives = await getRelevantAlternatives(shop.categories);
  if (alternatives.length === 0) return;
  
  renderSuggestionBanner(shop, alternatives);
}

// Wait for page load
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
```

### Storage Schema

```javascript
// chrome.storage.sync
{
  "euAlternatives": {
    "enabled": true,
    "frequency": "once_per_session",
    "dismissedShops": ["aliexpress", "wish"],
    "preferredCountries": ["FI", "DE"]
  }
}

// chrome.storage.session (temporary)
{
  "euAlternatives_shown": {
    "lastShown": 1720892400000,
    "shownShops": ["amazon"],
    "shownAlternatives": ["zalando", "aboutyou"]
  }
}
```

---

## Localization

### Supported Languages (initial)

- English (en) — default
- German (de)
- French (fr)
- Finnish (fi)

### Message Keys

```json
{
  "eu_alternatives_title": {
    "en": "Shopping outside the EU?",
    "de": "Einkaufen außerhalb der EU?",
    "fr": "Achats hors UE ?",
    "fi": "Ostat EU:n ulkopuolelta?"
  },
  "eu_alternatives_subtitle": {
    "en": "Try these EU-based alternatives:",
    "de": "Probiere diese EU-Alternativen:",
    "fr": "Essayez ces alternatives européennes :",
    "fi": "Kokeile näitä EU-vaihtoehtoja:"
  },
  "eu_alternatives_dismiss": {
    "en": "Not now",
    "de": "Nicht jetzt",
    "fr": "Pas maintenant",
    "fi": "Ei nyt"
  },
  "eu_alternatives_never": {
    "en": "Don't show for this shop",
    "de": "Für diesen Shop nicht mehr anzeigen",
    "fr": "Ne plus afficher pour ce site",
    "fi": "Älä näytä tälle kaupalle"
  }
}
```

---

## Privacy Considerations

### Data Collection: NONE

This feature does **not** collect, transmit, or store:
- URLs visited
- Shopping behavior
- Purchase information
- Personal data

### Local Storage Only

All settings and state are stored locally:
- `chrome.storage.sync` — User preferences (syncs via Google account if enabled)
- `chrome.storage.session` — Temporary session state (cleared on browser close)

### No Network Calls

The shop database and alternatives are bundled with the extension. No external API calls are made.

---

## Analytics & Metrics

### Local Metrics Only (Optional)

If user opts in to anonymous analytics in main settings:

- Count: How often suggestions are shown
- Count: How often users click an alternative
- Count: How often users dismiss suggestions

These would be aggregated and anonymized. **Not implemented in v1.**

---

## Future Enhancements

### Phase 2 Ideas

1. **Category-aware suggestions** — "Looking for fashion? Try Zalando" instead of generic
2. **Price hints** — "Often cheaper on EU sites due to no import fees"
3. **Country selector** — Let users pick their country for better suggestions
4. **User-submitted alternatives** — Community-contributed shop database
5. **Smart learning** — Remember which alternatives users click, suggest similar

### Phase 3 Ideas

1. **Product search** — Search the same product on EU sites
2. **Deal comparison** — Show if EU alternative has a sale
3. **Sustainability info** — Highlight eco-friendly EU alternatives

---

## Testing Plan

### Unit Tests

- Domain matching (various URL formats)
- Category filtering
- Frequency limiting
- Settings persistence

### Integration Tests

- Banner renders correctly on test pages
- Dismiss buttons work
- Settings changes reflect immediately
- No banner on checkout pages

### Manual Test Cases

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Visit amazon.de | Banner shows with fashion/electronics alternatives |
| 2 | Visit aliexpress.com | Banner shows with general alternatives |
| 3 | Visit amazon.de checkout | No banner |
| 4 | Dismiss banner, revisit | No banner (same session) |
| 5 | Click "Don't show for this shop" | Never see banner on that shop |
| 6 | Disable feature in settings | No banners anywhere |
| 7 | Visit EU shop (zalando.de) | No banner |

---

## Success Metrics

### Definition of Success

1. **Non-intrusive**: < 5% of users disable the feature
2. **Useful**: > 10% of shown suggestions get clicked
3. **Reliable**: Zero false positives on EU shops

### Feedback Collection

Add a tiny feedback link in the banner: "Wrong suggestion? Let us know"
→ Opens GitHub issue template

---

## Implementation Timeline

| Phase | Tasks | Estimate |
|-------|-------|----------|
| 1 | Database creation (shops + alternatives) | 2h |
| 2 | Detection logic | 2h |
| 3 | UI component (banner) | 3h |
| 4 | Settings integration | 2h |
| 5 | Localization | 1h |
| 6 | Testing & polish | 2h |
| **Total** | | **12h** |

---

## References

- [EuroCheck Main Spec](../../README.md)
- [non-eu-shops.json](./non-eu-shops.json)
- [eu-alternatives.json](./eu-alternatives.json)
- [UI Mockup](./ui-mockup.md)
