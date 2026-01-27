# EuroCheck — Firefox Screenshot Specifications

## General Guidelines

### Firefox AMO Requirements
- **Dimensions:** 1280×800 or 1920×1080 (16:10 or 16:9 aspect ratio)
- **Format:** PNG (preferred) or JPEG
- **Max file size:** 4MB per image
- **Quantity:** 5 screenshots (maximum 10 allowed)

### Firefox-Specific Styling
- Use **Firefox Photon design** aesthetic (clean, modern)
- Show Firefox UI chrome (toolbar, URL bar) for authenticity
- Use **Firefox's default theme** (light mode preferred for readability)
- Include the EuroCheck icon visible in the toolbar
- Use a clean Firefox profile (no distracting bookmarks/extensions)

### Brand Colors
- EU Blue: `#003399`
- EU Gold: `#FFCC00`
- Status Green: `#2E7D32`
- Status Yellow: `#F9A825`
- Status Red: `#C62828`
- Status Gray: `#757575`

### Typography in Annotations
- Font: Inter or system sans-serif
- Annotation text: White on semi-transparent dark background
- Keep text minimal — let the UI speak

---

## Screenshot 1: Hero Shot — EU Company Detection

### Objective
Show the core value proposition: instant EU company identification

### Scene
- **Website:** ikea.com (Swedish company, clear EU example)
- **Browser:** Firefox with EuroCheck toolbar icon showing **green badge**
- **Popup:** Open, displaying:
  - Company name: "IKEA"
  - EU flag icon and "European Company" label
  - Headquarters: Sweden 🇸🇪
  - Green status indicator

### Composition
- Full browser window visible
- IKEA homepage partially visible in background (hero section)
- EuroCheck popup prominently displayed in upper-right
- Popup should not obscure key IKEA branding

### Annotations
- Arrow pointing to green badge: "Instant status indicator"
- Below popup: "Know it's European — with one click"

### Visual Notes
- Warm, trustworthy feel
- Green tones should dominate the status area
- Clean, uncluttered IKEA page section visible

---

## Screenshot 2: Non-EU Company Detection

### Objective
Demonstrate detection of non-European companies

### Scene
- **Website:** amazon.com (US company, clear non-EU example)
- **Browser:** Firefox with EuroCheck toolbar icon showing **red badge**
- **Popup:** Open, displaying:
  - Company name: "Amazon"
  - US flag icon and "Non-European Company" label
  - Headquarters: United States 🇺🇸
  - Red status indicator

### Composition
- Similar framing to Screenshot 1 for consistency
- Amazon homepage visible (keep it generic, not product-focused)
- Popup in same position as Screenshot 1
- Clear visual contrast with green Screenshot 1

### Annotations
- Arrow pointing to red badge: "Non-EU alert"
- Tagline: "Make informed choices"

### Visual Notes
- Red should draw attention without being alarming
- Factual presentation, not judgmental
- Same popup position maintains visual consistency

---

## Screenshot 3: Ownership Chain Visualization

### Objective
Highlight the unique ownership tracing feature

### Scene
- **Website:** A company with mixed ownership (EU subsidiary of non-EU parent)
- **Example:** instagram.com (Meta-owned) or youtube.com (Google/Alphabet)
- **Browser:** Firefox with **yellow badge** showing
- **Popup:** Expanded to show ownership chain:
  ```
  YouTube (Service)
     ↓ owned by
  Google LLC (USA 🇺🇸)
     ↓ subsidiary of
  Alphabet Inc. (USA 🇺🇸)
  ```

### Composition
- Popup taller to accommodate ownership chain
- Chain visualization should be the focal point
- Website in background should be recognizable but not distracting

### Annotations
- "Trace ownership to the ultimate parent"
- Arrow indicating the chain flow

### Visual Notes
- Yellow badge indicates mixed/complex ownership
- Chain should use clear visual hierarchy (indentation, arrows)
- Parent company names clearly readable
- Country flags help quick identification

---

## Screenshot 4: Settings Page

### Objective
Show customization options and privacy-focused defaults

### Scene
- **View:** EuroCheck options/settings page (opens in Firefox tab)
- **Content visible:**
  - Badge visibility toggle: ✓ Enabled
  - Notification preferences
  - Language selector (EN/DE/FR dropdown)
  - "Privacy" section highlighting:
    - "All data stored locally"
    - "No network requests"
    - "No analytics or tracking"
  - Link to privacy policy
  - About section with version number

### Composition
- Full settings page, well-organized
- Clean Firefox tab appearance
- EuroCheck branding in settings header
- Privacy section should be prominent

### Annotations
- Circle around privacy section: "100% local — your data stays yours"
- Point to language selector: "Multilingual support"

### Visual Notes
- Clean, professional settings UI
- Use Firefox form controls styling
- Privacy messaging should feel reassuring, not paranoid
- Open source badge/link visible

---

## Screenshot 5: Badge States Overview

### Objective
Educational reference showing all possible badge states

### Scene
- **Split-screen or grid layout** showing 4 badge states:
  1. 🟢 Green badge + example (e.g., Spotify)
  2. 🟡 Yellow badge + example (e.g., Instagram)
  3. 🔴 Red badge + example (e.g., Amazon)
  4. ⚪ Gray badge + example (e.g., unknown site)

### Composition
- Grid layout: 2×2 or 1×4 horizontal
- Each cell shows:
  - Badge icon (enlarged)
  - Status label
  - Brief explanation
  - Example company name

### Layout Example
```
┌─────────────────┬─────────────────┐
│  🟢 EUROPEAN    │  🟡 MIXED       │
│  EU HQ & owner  │  EU presence,   │
│  Example: IKEA  │  non-EU parent  │
│                 │  Ex: Instagram  │
├─────────────────┼─────────────────┤
│  🔴 NON-EU      │  ⚪ UNKNOWN     │
│  Non-European   │  Not in our     │
│  company        │  database yet   │
│  Ex: Amazon     │  Ex: local site │
└─────────────────┴─────────────────┘
```

### Annotations
- Header: "Quick Reference Guide"
- Subtitle: "Understand status at a glance"

### Visual Notes
- Clean, infographic-style design
- Consistent iconography
- Could be used as standalone educational graphic
- Consider making this shareable/downloadable

---

## Production Checklist

### Before Capture
- [ ] Fresh Firefox profile (no personal data)
- [ ] EuroCheck extension loaded and active
- [ ] Window size set to 1920×1080
- [ ] System in light mode
- [ ] No notifications or distractions visible
- [ ] Bookmarks bar hidden or minimal

### Post-Processing
- [ ] Crop to exact dimensions (1280×800 or 1920×1080)
- [ ] Add annotations (minimal, readable)
- [ ] Ensure text is legible at thumbnail size
- [ ] Optimize file size (<2MB recommended)
- [ ] Name files: `eurocheck-firefox-01-hero.png`, etc.
- [ ] Verify no personal data visible in screenshots

### Accessibility
- [ ] Annotations have sufficient contrast
- [ ] Color isn't the only indicator (add labels)
- [ ] Text readable at 50% zoom
- [ ] Screenshots work for colorblind users (status labels help)

---

## File Naming Convention

```
eurocheck-firefox-01-hero-eu-company.png
eurocheck-firefox-02-non-eu-detection.png
eurocheck-firefox-03-ownership-chain.png
eurocheck-firefox-04-settings-privacy.png
eurocheck-firefox-05-badge-states-guide.png
```

---

## Notes for Designer/Developer

1. **Consistency is key** — Popup position, annotation style, and browser chrome should match across all screenshots

2. **Mobile consideration** — These screenshots will display as thumbnails; ensure key elements are visible when scaled down

3. **Localization** — If creating localized screenshots for DE/FR, swap annotations and ensure the extension UI matches the locale

4. **Real data only** — Use actual companies from our database; don't mock fake company names

5. **Firefox authenticity** — Users should immediately recognize this as a Firefox extension; Chrome-style screenshots will look out of place on AMO
