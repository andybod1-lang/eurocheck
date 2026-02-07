# GoEuropean Competitor Analysis

**Date:** 2025-01-26  
**Repository:** https://codeberg.org/K-Robin/GoEuropean  
**Current Version:** 1.13.5  
**Store Links:**
- [Chrome Web Store](https://chromewebstore.google.com/detail/go-european/klmgadmgadfhjgomffmpamppmkajdloc)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/go-european/)

---

## 1. Architecture

### Manifest Version
- **Chrome:** Manifest V3 (modern)
- **Firefox:** Manifest V2 (legacy, noted as "until Firefox supports Manifest V3")

### Project Structure
```
GoEuropean/
├── dist/                    # Built extensions
│   ├── chrome/              # Chrome build (MV3)
│   └── firefox/             # Firefox build (MV2)
├── sites/                   # Individual site JSON files (116 files)
├── src/
│   ├── js/
│   │   ├── background.js    # Service worker/background script
│   │   ├── content.js       # Page injection script
│   │   └── popup.js         # Popup UI logic
│   ├── html/
│   │   ├── popup.html       # Main popup
│   │   └── support.html     # Donation page
│   ├── css/
│   │   ├── styles.css       # Popup styles
│   │   └── support.css      # Support page styles
│   └── countryMappings.json # Combined data (built)
├── buildMapping.js          # Combines sites/*.json → countryMappings.json
├── buildVersions.js         # Copies to dist/ for Chrome/Firefox
└── README.md
```

### Key Files

**`manifest.json` (Chrome MV3):**
```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "storage"],
  "background": { "service_worker": "js/background.js" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["js/content.js"]
  }]
}
```

**Build Process:**
1. Individual site JSON files in `sites/` folder
2. `buildMapping.js` combines all JSONs into single `countryMappings.json`
3. `buildVersions.js` copies built files to `dist/chrome/` and `dist/firefox/`

---

## 2. Data Sources

### Manual Curation
- **No automated data fetching** — all data is manually curated
- Contributors submit alternatives via [Tally form](https://tally.so/r/meYd2k) or pull request
- Single developer (K-Robin) reviews and approves all additions
- Data verification: "Proof that the website is based in Europe"

### Data Volume
- **116 site files** covering various services
- **~458 alternative URLs** in the database
- **21 category files** for grouping common alternatives
- **47 European countries** supported

### Category System
Sites can reference shared categories to reduce duplication:
```json
// discord.json
{ "discord.com": { "ref": "11-communication-category" } }

// google.json - path-specific routing
{
  "www.google.*": { "ref": "16-search-engines-category" },
  "www.google.*/maps": { "ref": "21-maps-category" }
}
```

### Data Gaps Observed
- No verification of alternative site uptime
- No pricing/freemium info
- No user ratings or quality indicators
- Some stale data (e.g., Mullvad LETA recently removed in commit `b30d54d`)

---

## 3. Features

### Core Functionality
| Feature | Description |
|---------|-------------|
| **Badge notification** | Shows count of alternatives on toolbar icon |
| **In-page popup** | Slide-in notification suggesting alternatives (max 4 shown) |
| **Country-specific alternatives** | Prioritizes local alternatives (e.g., Allegro for Poland) |
| **Wildcard matching** | Supports `www.google.*` patterns |
| **Path-specific matching** | Different alternatives for `google.com/maps` vs `google.com` |
| **Reference system** | Sites can point to shared category definitions |

### User Controls
| Feature | Description |
|---------|-------------|
| **Allowlist** | Permanently disable for specific sites |
| **Temporary disable** | Snooze notifications for 1-30 days |
| **Country selector** | User picks their country for localized suggestions |
| **Global toggle** | Disable all popups |
| **Settings panel** | Manage allowlist and reminders |

### Smart Detection
```javascript
// Detects if current site is already European
function checkIfAlternative(currentUrl) {
    // Checks if visited URL matches any alternative in the database
    // Shows flag badge instead of suggestions
}
```

---

## 4. Data Format

### Site Definition Schema
```json
{
  "www.amazon.*": {
    "countrySpecific": {
      "Poland": [
        { "url": "allegro.pl", "name": "Allegro", "origin": "Poland" }
      ],
      "Germany": [
        { "url": "otto.de", "name": "Otto", "origin": "Germany" },
        { "url": "kaufland.de", "name": "Kaufland", "origin": "Germany" }
      ]
    },
    "alternatives": [
      { "url": "global-euro-store.com", "name": "EuroStore", "origin": "EU" }
    ]
  }
}
```

### Alternative Object
```typescript
interface Alternative {
  url: string;      // Domain without https:// (e.g., "bol.com")
  name: string;     // Display name
  origin: string;   // Country of origin
}
```

### Reference Pattern
```json
// Shared category (16-search-engines-category.json)
{
  "16-search-engines-category": {
    "alternatives": [
      { "url": "qwant.com", "name": "Qwant", "origin": "France" },
      { "url": "ecosia.org", "name": "Ecosia", "origin": "Germany" }
    ]
  }
}

// Individual site referencing category
{ "www.google.*": { "ref": "16-search-engines-category" } }
```

### Wildcard Matching
```javascript
function matchesWildcard(pattern, hostname) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(hostname);
}
```

---

## 5. Weaknesses

### 🔴 Critical Issues

**1. No automated data updates**
- Manual curation doesn't scale
- Data goes stale (companies get acquired, sites shut down)
- No API to check if alternatives are still valid

**2. Limited ownership information**
- Only stores `origin` (country string)
- No information about parent companies
- Can't detect when European company gets acquired by US tech

**3. Binary European/non-European classification**
- Doesn't handle complex ownership structures
- UK included despite Brexit (edge case)
- No EU vs Europe distinction

### 🟠 Major Gaps

**4. No source citations**
- Alternatives are asserted without proof
- No links to company registration, Wikipedia, etc.

**5. UX friction**
- Popup appears on every page visit (annoying)
- No "smart" timing (shows during checkout, sensitive operations)
- Mobile browser support unclear

**6. Limited discovery**
- Can only find alternatives for pre-indexed sites
- No fallback for unknown sites

### 🟡 Minor Issues

**7. Code quality**
- Duplicate code between `popup.js` and `background.js`
- Multiple `DOMContentLoaded` listeners in `popup.js`
- No TypeScript, no tests

**8. No analytics or metrics**
- Can't track which alternatives users actually prefer
- No feedback loop for data quality

**9. Inconsistent data format**
- `countrySpecific` values can be array or single object (inconsistent)
```json
"Ireland": { "url": "..." }           // Single object
"Poland": [{ "url": "..." }]          // Array
```

---

## 6. Learnings for EuroCheck

### ✅ What to Copy

**1. Category reference system**
The `ref` pattern reduces duplication and makes maintenance easier:
```json
{ "discord.com": { "ref": "communication-category" } }
```

**2. Country-specific prioritization**
Good UX to show local alternatives first (Allegro for Poland vs Bol.com for Netherlands)

**3. Path-specific matching**
Smart to differentiate `google.com/maps` from `google.com` search

**4. Wildcard patterns**
`www.amazon.*` catches all TLD variants cleanly

**5. "Already European" detection**
Shows positive reinforcement when user is on a European site

### ⬆️ What to Improve

**1. Rich ownership data**
```typescript
interface Company {
  name: string;
  headquarters: { country: string; city?: string };
  parentCompany?: Company;
  ownership: "european" | "non-european" | "mixed";
  dataSource: { url: string; lastVerified: Date };
  gdprCompliant?: boolean;
}
```

**2. Automated data pipeline**
- Scrape company registrations (OpenCorporates, etc.)
- Wikipedia infobox extraction
- Wikidata SPARQL queries
- Periodic staleness checks

**3. Better UX**
- Non-intrusive badge-only mode
- Smart triggers (not during checkout)
- "Learn more" with detailed ownership info

**4. Confidence scoring**
```json
{
  "url": "qwant.com",
  "name": "Qwant",
  "origin": "France",
  "confidence": 0.95,
  "lastVerified": "2025-01-20",
  "sources": ["wikipedia"]
}
```

**5. Community contribution with verification**
- Allow submissions but require sources
- Automated verification against data sources

---

## Improvement Opportunities for EuroCheck

### Opportunity 1: **Ownership Chain Tracking**
GoEuropean just says "origin: France" — we should track full ownership chains.
- Skype: Founded Swedish → Owned by Microsoft (US)
- GitHub: Founded US → Owned by Microsoft
- Show: "Originally European, now US-owned"

### Opportunity 2: **Data Freshness Indicators**
- Show "Last verified: 3 months ago" 
- Automated checks for domain availability
- Alert when company is acquired

### Opportunity 3: **Smart Notification Timing**
- Don't show on checkout pages
- Learn from user dismissals
- Quieter mode by default, louder opt-in

### Opportunity 4: **Richer Alternative Metadata**
```json
{
  "url": "proton.me",
  "name": "Proton Mail",
  "origin": "Switzerland",
  "category": "email",
  "pricing": "freemium",
  "privacyRating": "A+",
  "openSource": true,
  "gdprHosting": true
}
```

### Opportunity 5: **"Why Switch" Education**
GoEuropean says "Go European" but doesn't explain why.
- Data sovereignty benefits
- GDPR protection
- Support local economy
- Privacy implications

### Opportunity 6: **Fallback Discovery**
When site isn't in database:
- "We don't have data for this site yet"
- "Help us by researching: [link]"
- Suggest category-based alternatives

### Opportunity 7: **Quality Alternatives**
GoEuropean lists quantity over quality. Some alternatives are weak:
- Generic "Kennys (Books)" for Ireland shown for many countries
- No indication of feature parity

### Opportunity 8: **API Access**
- Offer API for other tools to integrate
- Browser-agnostic core data
- Mobile app potential

---

## Competitive Positioning

| Factor | GoEuropean | EuroCheck (Target) |
|--------|------------|-------------------|
| Data accuracy | Manual, unverified | Automated + verified |
| Ownership depth | Country only | Full corporate chain |
| Data freshness | Unknown | Timestamped + alerts |
| UX intrusion | High (popup every page) | Low (badge + optional) |
| Why switch | None | Educational content |
| Quality signal | None | Ratings + reviews |
| Open data | No API | Public API |

---

## UI Description

Since screenshots aren't available, here's the UI description:

### Popup (350px wide)
- **Header:** Logo + "Settings" button + "Support Us" button
- **Current site display:** Shows hostname with allowlist status badge
- **Action buttons:** "Disable pop-ups" + "Disable temporarily"
- **Alternatives list:** Up to 4 items with name, URL, origin country
- **Message area:** Context-sensitive messages

### In-page notification
- Fixed position overlay (top center)
- Animated slide-in
- Lists alternatives with clickable links
- "Got it" dismiss + "Don't show again" + "Disable temporarily"

### Settings panel
- Slides in from right
- Country picker with autocomplete
- Temporary disable duration slider (1-30 days)
- Allowlist manager
- Reminder manager

---

## Recommendations

### Must Have
1. **Better data model** — ownership chains, not just origin
2. **Source citations** — every claim backed by URL
3. **Staleness detection** — timestamps and freshness checks

### Should Have
4. **Quieter defaults** — badge only, popup opt-in
5. **Path-aware matching** — copy their pattern
6. **Category system** — reduces maintenance

### Nice to Have
7. **Quality indicators** — ratings, feature comparison
8. **Educational content** — why European matters
9. **Public API** — broader ecosystem

---

*Analysis completed: 2025-01-26*
*Analyst: Clawdbot Subagent*
