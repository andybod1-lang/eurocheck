# r/chrome Post Draft

## Title
Extension: EuroCheck shows European company badge while shopping

## Body

Made a Chrome extension that shows a 🇪🇺 badge on product pages when you're browsing a European company's site.

**Chrome Web Store:** [link]

**Use case:**
If you're trying to buy more from European companies - whether for sustainability (shorter shipping), data privacy (GDPR), or just supporting local businesses - this makes it visible without having to research each company.

**How it works:**
- Small badge appears in the corner on product pages
- Matches the site domain against a database of EU/EEA companies
- Database is bundled locally in the extension
- No tracking, no analytics, no external requests

**Chrome/MV3 specifics:**
- Built on Manifest V3 (required for Chrome Web Store)
- Uses service worker architecture
- Host permissions limited to e-commerce domains
- No persistent background process

**Also works on:**
- Brave
- Edge
- Vivaldi
- Arc
- Any Chromium-based browser

**Open source:** [GitHub link]

If you find European companies that aren't in the database, the GitHub repo accepts contributions. Trying to make the database as comprehensive as possible.

---

**Best posting time:** Weekday, US hours

**Engagement notes:**
- r/chrome is smaller and less active than r/firefox
- Keep it brief and practical
- Be ready to confirm Brave/Edge/etc compatibility if asked
- Don't bash Chrome even if asked about privacy concerns
