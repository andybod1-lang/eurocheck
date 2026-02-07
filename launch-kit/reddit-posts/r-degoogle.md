# r/degoogle Post Draft

## Title
Browser extension to find European alternatives while shopping - no Google services, fully local

## Body

Part of degoogling for me has been thinking more broadly about where my data goes. Even when avoiding Google directly, buying from US companies still means my purchase data ends up under US jurisdiction.

Made a browser extension called **EuroCheck** that shows when you're shopping from European companies. Simple premise: EU flag badge appears on product pages from companies headquartered in Europe.

**Why this fits degoogling:**
- European companies must comply with GDPR
- Your data stays under EU data protection laws
- Many EU companies use European hosting (though not all)
- Supports the ecosystem that's actually trying to regulate big tech

**Technical approach (no Google services used):**
- No Google Analytics
- No Firebase
- No Google Fonts
- No CDN dependencies
- Everything bundled locally
- Zero external requests during normal use

**Permissions kept minimal:**
- Only activates on e-commerce sites
- No broad "access all sites" permission
- Can't read your data on any other sites
- Open source: [GitHub]

**Available on:**
- Firefox Add-ons (Mozilla reviewed) ✓
- Chrome Web Store (yes, ironic, but many degooglers still need Chrome for work)

If you're using a Chromium fork like Brave or Vivaldi, the Chrome version works. For Ungoogled Chromium, you'll need to sideload from the GitHub releases.

The company database is expandable - PRs welcome for adding European companies I've missed.

---

**Suggested flair:** Tools/Resources

**Engagement notes:**
- Acknowledge the irony of Chrome Web Store but explain practicality
- Have instructions ready for sideloading on Ungoogled Chromium
- Be ready to discuss which EU companies actually use European hosting
