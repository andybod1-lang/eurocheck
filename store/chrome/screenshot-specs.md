# Chrome Web Store Screenshot Specifications

**Dimensions:** 1280×800 pixels (Chrome Web Store requirement)
**Format:** PNG, 24-bit color
**Layout:** Browser window with extension popup visible in top-right

---

## Screenshot 1: Hero - EU Company (Green Badge)
**Filename:** `screenshot-1-hero-eu.png`

### Setup
- **URL:** `https://open.spotify.com/`
- **Popup state:** Click EuroCheck extension icon to open

### What Popup Shows
- 🟢 **Green "EU" badge** — "European Company"
- **Company:** Spotify
- **Location:** 🇸🇪 Stockholm, Sweden
- **Details card:**
  - Founded: 2006
  - Confidence: High
  - Last verified: 2025-01-15
- Footer: Settings | GitHub links

### Annotations/Callouts
- Add subtle callout arrow pointing to green badge with text: **"Instantly know it's European"**
- Optional: Highlight the confidence level ("High" gives users trust)

### Browser Context
- Spotify homepage visible in background
- Address bar showing `open.spotify.com`
- Clean browser chrome (no other extensions visible)

---

## Screenshot 2: Non-EU Company (Red Badge)
**Filename:** `screenshot-2-non-eu.png`

### Setup
- **URL:** `https://www.amazon.com/`
- **Popup state:** Click EuroCheck extension icon to open

### What Popup Shows
- 🔴 **Red "NON-EU" badge** — "Non-European Company"
- **Company:** Amazon
- **Location:** 🇺🇸 Seattle, USA
- **Details card:**
  - Founded: 1994
  - Confidence: High
  - Last verified: 2025-01-15
- Footer: Settings | GitHub links

### Annotations/Callouts
- Add callout with text: **"Red means non-European"**
- Optional: Show price/product in background to establish shopping context

### Browser Context
- Amazon homepage visible in background
- Address bar showing `www.amazon.com`

---

## Screenshot 3: Ownership Chain (Mixed Status)
**Filename:** `screenshot-3-ownership-chain.png`

### Setup
- **URL:** `https://www.booking.com/`
- **Popup state:** Click EuroCheck extension icon to open

### What Popup Shows
- 🟡 **Yellow "MIXED" badge** — "EU Company, Non-EU Owned"
- **Company:** Booking.com
- **Location:** 🇳🇱 Amsterdam, Netherlands
- **Ownership Chain section:**
  - ⚠️ "Non-EU owned" warning label
  - 🇺🇸 **Booking Holdings** (ULTIMATE) — Norwalk, USA
  - ↓ arrow
  - 🇳🇱 **Booking.com** (CURRENT) — Amsterdam, Netherlands
- **Details card:**
  - Founded: 1996
  - Confidence: High

### Annotations/Callouts
- Add prominent callout: **"See who really owns it"**
- Point to ownership chain visualization
- This is EuroCheck's killer feature — ownership transparency

### Browser Context
- Booking.com homepage visible in background
- Address bar showing `www.booking.com`

---

## Screenshot 4: Another Mixed Example (Trivago)
**Filename:** `screenshot-4-mixed-trivago.png`

### Setup
- **URL:** `https://www.trivago.com/`
- **Popup state:** Click EuroCheck extension icon to open

### What Popup Shows
- 🟡 **Yellow "MIXED" badge** — "EU Company, Non-EU Owned"
- **Company:** Trivago
- **Location:** 🇩🇪 Düsseldorf, Germany
- **Ownership Chain:**
  - 🇺🇸 **Expedia Group** (ULTIMATE) — Seattle, USA
  - ↓ arrow
  - 🇩🇪 **Trivago** (CURRENT) — Düsseldorf, Germany
- **Details card:**
  - Founded: 2005
  - Confidence: High

### Annotations/Callouts
- Add callout: **"German brand, American owned"**
- Good example showing that EU headquarters ≠ EU ownership

### Browser Context
- Trivago homepage visible in background
- Address bar showing `www.trivago.com`

---

## Screenshot 5: Unknown Domain / Request Feature
**Filename:** `screenshot-5-unknown.png`

### Setup
- **URL:** Visit any site NOT in the database (e.g., `https://www.exampleshop.fi/` or a small local business)
- **Popup state:** Click EuroCheck extension icon to open

### What Popup Shows
- ⚪ **Gray badge** — "Unknown Company"
- **Domain:** exampleshop.fi (or whatever test domain)
- **Message:** "This company is not yet in our database"
- **Action button:** "Request this company" (links to GitHub issues)
- Footer: Settings | GitHub links

### Annotations/Callouts
- Add callout: **"Contribute: Request any missing company"**
- Highlight the "Request" button
- Shows community-driven nature of project

### Browser Context
- Any website not in database
- Address bar showing the domain

---

## Alternative Screenshot Options

### Option 5A: EU Retailer (Zalando)
If unknown domain screenshot doesn't render well:
- **URL:** `https://www.zalando.de/`
- Shows another EU company (green badge)
- **Location:** 🇩🇪 Berlin, Germany
- Good for German market appeal

### Option 5B: Privacy-Focused Screenshot
- Show the extension options/settings page
- Highlight "100% Local Lookups" text
- Add callout: **"Your browsing stays private"**
- Good for privacy-conscious users

---

## Production Notes

### Screenshot Capture Process
1. Open Chrome with clean profile (no other extensions)
2. Install EuroCheck extension
3. Navigate to target URL
4. Click extension icon to open popup
5. Use screenshot tool at 1280×800
6. Add annotations in image editor (Figma/Photoshop)

### Annotation Style
- **Font:** System sans-serif (SF Pro, Segoe UI, or Roboto)
- **Colors:** 
  - Background: Semi-transparent dark (#1a1a2e, 80% opacity)
  - Text: White (#ffffff)
  - Accent: EU yellow (#FFCC00) for emphasis
- **Arrow style:** Rounded, 2px stroke, EU blue (#003399)

### File Checklist
- [ ] screenshot-1-hero-eu.png
- [ ] screenshot-2-non-eu.png
- [ ] screenshot-3-ownership-chain.png
- [ ] screenshot-4-mixed-trivago.png
- [ ] screenshot-5-unknown.png

---

## Chrome Web Store Requirements

- **Minimum dimensions:** 1280×800 or 640×400
- **Maximum file size:** 2MB per image
- **Format:** PNG or JPEG
- **Quantity:** 1-5 screenshots (5 recommended)
- **Localization:** Can provide different screenshots per language
