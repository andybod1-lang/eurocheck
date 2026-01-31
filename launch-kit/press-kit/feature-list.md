# EuroCheck - Full Feature Breakdown

## Core Features

### 🇪🇺 European Company Badge
- Visual EU flag indicator on product pages
- Appears only when company HQ is in EU/EEA
- Unobtrusive design - doesn't interfere with shopping
- Positioned consistently across sites
- Smooth appearance animation

### 🔍 Smart Detection
- Matches website domains against curated database
- Activates only on e-commerce and product pages
- Ignores non-shopping pages (blogs, news, etc.)
- Works on major retail sites and smaller European shops

### 🌍 European Coverage
**EU Member States (27):**
Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

**EEA Members:**
Norway, Iceland, Liechtenstein

**Also Included:**
Switzerland (strong data protection alignment)

**Not Included:**
United Kingdom (post-Brexit, no longer EU)

---

## Privacy Features

### Zero Tracking
- No analytics whatsoever
- No user identification
- No session tracking
- No behavioral data collection

### Local Processing
- Company database bundled in extension
- All matching happens in your browser
- No server queries required
- No data leaves your device

### Minimal Permissions
- Only activates on shopping sites
- No "access all websites" permission
- Cannot read data on non-commerce sites
- No clipboard access
- No history access

### No Account Required
- Install and use immediately
- No registration
- No email collection
- No sync features that require login

### Open Source
- Full source code on GitHub
- MIT license
- Anyone can audit
- Community contributions welcome

---

## Browser Support

### Chrome
- Chrome Web Store listing
- Manifest V3 compliant
- Service worker architecture
- Works on Chrome 88+

### Firefox
- Mozilla Add-ons (AMO) listing
- Passed full Mozilla review
- Manifest V2 (better privacy model)
- Works on Firefox 78+
- Firefox for Android supported

### Chromium-Based Browsers
- ✅ Brave
- ✅ Microsoft Edge
- ✅ Vivaldi
- ✅ Arc
- ✅ Opera
- ⚠️ Ungoogled Chromium (sideload required)

---

## Database Features

### Company Coverage
- ~500 European companies at launch
- Major retailers across all EU countries
- Mix of well-known and mid-size companies
- Growing through community contributions

### Company Criteria
**Included:**
- Headquarters in EU/EEA/Switzerland
- Active commercial presence
- Sell products/services to consumers

**Excluded:**
- US companies with EU subsidiaries only
- Shell companies for tax purposes
- Companies that moved HQ but operate elsewhere
- B2B-only companies

### Community Contributions
- GitHub issues for suggesting companies
- Pull requests welcome
- Clear contribution guidelines
- Transparent review process

---

## Technical Specifications

### Architecture
- Manifest V3 (Chrome) / V2 (Firefox)
- Service worker (Chrome) / Background script (Firefox)
- Content scripts for badge injection
- JSON database for company matching

### Performance
- Lightweight (~50KB total)
- No performance impact on browsing
- Lazy loading of content scripts
- Efficient domain matching algorithm

### Compatibility
- Modern browsers (2020+)
- Works with most e-commerce platforms
- Compatible with other shopping extensions
- No conflicts with ad blockers

---

## User Interface

### Badge Design
- Clean, recognizable EU flag
- Consistent positioning
- Appropriate size (visible but not intrusive)
- Works on light and dark backgrounds

### Interactions
- Hover tooltip with company info (optional)
- Click to see details (optional)
- No disruptive popups
- No notifications

### Settings (if implemented)
- Toggle badge on/off
- Position preference
- Size adjustment
- Domain blacklist

---

## What EuroCheck Does NOT Do

### Not a Shopping Assistant
- No price comparisons
- No deal alerts
- No affiliate links
- No product recommendations

### Not an Ethics Rater
- No sustainability scores
- No labor practice ratings
- No environmental grades
- Just origin information

### Not a Data Collector
- No browsing history
- No purchase tracking
- No user profiles
- No targeted anything

### Not a Blocker
- Doesn't prevent purchases
- No warning screens
- No "are you sure" dialogs
- Information only

---

## Future Roadmap (Potential)

### Under Consideration
- More detailed company info on hover
- Country-specific badge (🇩🇪 🇫🇷 🇳🇱 etc.)
- API for third-party integrations
- Browser bookmark for company lookup
- Safari support

### Community Requested
- Track via GitHub issues
- Prioritized by demand
- Transparent development

### Not Planned
- Monetization features
- User accounts
- Cloud sync
- Premium tiers

---

## Comparison with Alternatives

| Feature | EuroCheck | Generic Shopping Extensions | Manual Research |
|---------|-----------|---------------------------|-----------------|
| Shows company origin | ✅ | ❌ | ✅ (with effort) |
| Privacy | ✅ Zero tracking | ❌ Heavy tracking | ✅ |
| Effort required | ✅ Automatic | N/A | ❌ Manual |
| Cost | ✅ Free | Often freemium | ✅ Free |
| Open source | ✅ | Usually ❌ | N/A |
| GDPR focus | ✅ | ❌ | Depends |
