# EuroCheck — Chrome Web Store Screenshot Specifications

## General Requirements

- **Dimensions:** 1280 × 800 pixels (or 640 × 400 minimum)
- **Format:** PNG (24-bit, no transparency) or JPEG (high quality)
- **Aspect Ratio:** 16:10 recommended
- **Text:** Legible at thumbnail size, minimal text overlay
- **Branding:** Consistent EuroCheck colors (EU blue/gold accents)

---

## Screenshot 1: Hero Shot — EU Company Detection

**Purpose:** Primary store listing image. Show the extension working on a well-known European company.

**Composition:**
- Browser window showing **Spotify.com** or **IKEA.com** homepage
- EuroCheck popup open in top-right corner
- **Green badge** prominently displayed
- Popup showing:
  - Company name: "Spotify AB" or "IKEA"
  - Status: "🟢 European Company"
  - Headquarters: "Stockholm, Sweden"
  - Simple ownership display

**Text Overlay (optional):**
- Small tagline: "Know if it's European" in corner

**Key Elements:**
- Clean, modern browser chrome (Chrome or minimal)
- Recognizable EU brand website
- Green status clearly visible
- Professional, trustworthy feel

**Mood:** Confidence, clarity, ease of use

---

## Screenshot 2: Non-EU Company Detection

**Purpose:** Show contrast — how the extension identifies non-European companies.

**Composition:**
- Browser window showing **Amazon.com** or **Apple.com** homepage
- EuroCheck popup open
- **Red badge** prominently displayed
- Popup showing:
  - Company name: "Amazon.com, Inc." or "Apple Inc."
  - Status: "🔴 Non-European Company"
  - Headquarters: "Seattle, USA" or "Cupertino, USA"
  - Parent company: "—" (none, they are the ultimate parent)

**Text Overlay (optional):**
- None or subtle "Non-EU Detected"

**Key Elements:**
- Familiar non-EU brand
- Red status unmistakable
- Clear contrast to Screenshot 1
- Same popup design for consistency

**Mood:** Informative, neutral (not negative), factual

---

## Screenshot 3: Ownership Chain Visualization

**Purpose:** Highlight the unique ownership chain feature — show how EU subsidiaries trace to non-EU parents.

**Composition:**
- Browser window showing a brand with mixed ownership (e.g., **YouTube.com**, **WhatsApp.com**, or **Instagram.com**)
- EuroCheck popup open
- **Yellow badge** displayed
- Popup showing ownership chain:
  ```
  Instagram LLC
    ↳ Meta Platforms, Inc.
       📍 Menlo Park, USA
  ```
- Status: "🟡 Mixed Ownership"

**Text Overlay:**
- "Trace ownership to the source" or "See the full picture"

**Key Elements:**
- Clear visual hierarchy showing parent-child relationship
- Yellow badge (mixed) demonstrates nuance
- Ownership chain visible with indentation or arrows
- Ultimate parent country highlighted

**Mood:** Transparency, insight, informed decisions

---

## Screenshot 4: Settings/Options Page

**Purpose:** Show customization options and language support.

**Composition:**
- Full browser tab showing EuroCheck options/settings page
- Settings visible:
  - **Language selector:** English, Deutsch, Français (with flags)
  - **Badge display:** Show on all sites / Only known companies
  - **Notification preferences:** (if applicable)
  - **About section:** Version, privacy policy link

**Layout:**
- Clean, spacious design
- Grouped settings with clear labels
- EU-themed accent colors (blue, gold)
- Footer with "Made with 🇪🇺 in Europe"

**Key Elements:**
- Language dropdown expanded showing all 3 languages
- Toggle switches for preferences
- Professional settings UI
- Privacy-related settings highlighted

**Mood:** User control, customization, trust

---

## Screenshot 5: Badge/Icon States Overview

**Purpose:** Educational — show all possible badge states at a glance.

**Composition:**
- **NOT a browser screenshot** — instead, a clean infographic-style image
- Four sections showing each badge state:

| Badge | Color | Meaning |
|-------|-------|---------|
| 🟢 | Green | European company (HQ + ownership in EU/EEA) |
| 🟡 | Yellow | Mixed ownership (EU presence, non-EU parent) |
| 🔴 | Red | Non-European company |
| ⚪ | Gray | Unknown / Not in database |

**Visual Design:**
- Each badge shown as toolbar icon would appear
- Example company name under each (Spotify, YouTube, Amazon, Unknown Site)
- Brief 5-7 word explanation per badge
- EuroCheck logo in corner

**Style:**
- Clean white or light gray background
- Bold badge colors
- Sans-serif typography (Inter or similar)
- Minimal, scannable layout

**Mood:** Educational, clear, quick reference

---

## Production Notes

### Recommended Tools
- **Browser:** Chrome (real screenshots)
- **Mockup:** Figma or Canva for overlays
- **Icons:** Use actual extension assets from `src/icons/`

### Test Sites for Screenshots
- **Green (EU):** spotify.com, ikea.com, adidas.com, zalando.com, sap.com
- **Yellow (Mixed):** youtube.com, instagram.com, whatsapp.com
- **Red (Non-EU):** amazon.com, apple.com, google.com, microsoft.com
- **Gray (Unknown):** Any small/local site not in database

### Brand Consistency
- Use EuroCheck's actual popup design
- Match colors from extension CSS
- Include version number if space permits

### Localization
- Primary screenshots in English
- Consider German/French variants for those locales

---

## File Naming Convention

```
eurocheck-chrome-screenshot-1-hero-eu.png
eurocheck-chrome-screenshot-2-non-eu.png
eurocheck-chrome-screenshot-3-ownership.png
eurocheck-chrome-screenshot-4-settings.png
eurocheck-chrome-screenshot-5-badges.png
```

---

## Checklist Before Submission

- [ ] All screenshots are 1280×800px
- [ ] No copyrighted content visible (just URLs, not full site designs)
- [ ] Text is readable at thumbnail size
- [ ] Badge colors are accurate
- [ ] Popup UI matches actual extension
- [ ] No personal data visible in screenshots
- [ ] Consistent visual style across all 5 images
