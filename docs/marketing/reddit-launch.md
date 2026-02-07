# EuroCheck Reddit Launch Posts

Ready-to-post versions for different subreddits. Adapt as needed.

---

## r/BuyFromEU (Primary Launch)

**Title:** I built a browser extension that shows if a website is EU or non-EU owned (including parent companies)

---

Ever tried to buy European only to discover that "European" brand is actually owned by an American PE firm? Yeah, me too.

**The problem:** It's surprisingly hard to know who actually owns the companies we buy from. That German-sounding brand? Might be a subsidiary of a US conglomerate. That Swedish company? Could've been acquired years ago.

**So I built something:** [EuroCheck](https://github.com/andybod1-lang/eurocheck) - a browser extension that shows you the ownership chain of websites you visit.

**What it does:**
- 🇪🇺 Shows if a site belongs to an EU, non-EU, or mixed-ownership company
- 🔍 Displays the full ownership chain (company → parent → ultimate parent)
- 🔒 100% local - all lookups happen on your device, nothing sent anywhere
- 📊 Currently covers 321 companies across 270 domains

**What it doesn't do:**
- Track you
- Phone home
- Sell your data
- Cost anything

It's fully open source (MIT license), so you can check exactly what it does. The database is also open - if you know a company's ownership structure, you can contribute.

**Links:**
- Chrome: https://chromewebstore.google.com/detail/eurocheck-eu-company-iden/dpfimkgpnmohfociiojeajoacdagjagi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/eurocheck-eu-company-id/
- GitHub: https://github.com/andybod1-lang/eurocheck

This is very much a work in progress. The database is small but growing. If you try it and notice missing companies or incorrect info, please let me know or open an issue on GitHub.

Would love your feedback - what features would make this more useful for you?

---

## r/europe

**Title:** Made a browser extension that shows if websites are EU or non-EU owned (tracks corporate ownership chains)

---

With all the talk about supporting European businesses lately, I kept running into the same problem: how do you actually know if a company is European?

That "Swedish" furniture brand might be owned by a Dutch holding company that's ultimately controlled by American investors. That "German" electronics company might have been quietly acquired by a Chinese firm.

So I built [EuroCheck](https://github.com/andybod1-lang/eurocheck) - a browser extension that shows you who really owns the websites you visit.

**How it works:**
- Small icon in your browser shows 🇪🇺 (EU), 🌍 (non-EU), or mixed
- Click it to see the full ownership chain
- All data stays on your device - no tracking, no servers, no accounts

**Current coverage:** 321 companies, 270 domains. It's a start, but the database is open source so it can grow with community contributions.

I'm not trying to tell anyone what to buy or where to shop - just making it easier to make informed choices if that matters to you.

It's free, open source (MIT), and you can verify everything it does: https://github.com/andybod1-lang/eurocheck

Happy to answer questions or take suggestions for companies to add.

---

## r/privacy

**Title:** Open source browser extension that checks corporate ownership - runs 100% locally, zero network requests

---

Built something the privacy-conscious might appreciate: a browser extension that shows who owns websites you visit, with a twist - **it makes zero network requests**.

**The privacy angle:**

Most "lookup" extensions phone home every URL you visit. EuroCheck doesn't. The entire company database ships with the extension and lookups happen locally via simple domain matching. No servers. No analytics. No accounts. No telemetry.

You can verify this yourself - it's fully open source: https://github.com/andybod1-lang/eurocheck

**What it actually does:**

Shows whether a website belongs to an EU, non-EU, or mixed-ownership company, including the corporate ownership chain (useful if you care about where your money ultimately ends up).

**Technical details:**
- Manifest V3 (Chrome) and V2 (Firefox)
- Database is a static JSON file bundled with the extension
- Only permissions: `activeTab` to read the current domain
- ~50KB total size
- MIT license

**Current state:** 321 companies, 270 domains. Database is manually curated from public sources (annual reports, SEC filings, etc).

Not trying to build a business here - just scratched my own itch and figured others might find it useful. Feedback and contributions welcome.

---

## r/browsers

**Title:** Released EuroCheck - MV3 extension that shows corporate ownership of websites (Chrome + Firefox)

---

Just shipped a browser extension I've been working on: [EuroCheck](https://github.com/andybod1-lang/eurocheck)

**What it does:** Shows whether websites belong to EU or non-EU companies, including the full ownership chain (company → parent → ultimate parent).

**Technical bits:**
- Manifest V3 for Chrome, V2 for Firefox
- Separate builds per browser (different manifest handling)
- All lookups are local - ships with a JSON database, no network requests
- Minimal permissions (`activeTab` only)
- ~50KB bundled

**The interesting part:** Building for both Chrome and Firefox with a shared codebase but different manifests. The MV3 service worker vs MV2 background script difference is still annoying, but workable.

**Current coverage:** 321 companies across 270 domains. The database is the main limitation - it's manually curated from public ownership records.

Open source (MIT): https://github.com/andybod1-lang/eurocheck

**Store links:**
- Chrome Web Store: [pending review]
- Firefox Add-ons: [pending review]

Would appreciate feedback from the extension dev folks here. Particularly interested in:
- Edge compatibility (should work but haven't tested extensively)
- Any MV3 gotchas I might have missed
- Ideas for expanding the database more efficiently

---

## Posting Notes

**Best times to post:**
- r/BuyFromEU: Weekday mornings EU time
- r/europe: Weekday afternoons EU time (higher traffic)
- r/privacy: Anytime, but weekends see good engagement
- r/browsers: Weekdays, technical crowd

**Follow-up engagement:**
- Reply to every comment in first 2 hours
- Be honest about limitations
- Thank people for suggestions
- If someone reports incorrect data, fix it fast and follow up

**Don't:**
- Cross-post immediately (looks spammy)
- Astroturf with alt accounts
- Get defensive about criticism
- Promise features you can't deliver
