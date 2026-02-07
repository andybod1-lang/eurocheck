# EuroCheck Launch Day Communications Plan

**Version:** 2.0  
**Launch Date:** TBD  
**Author:** Pekka

---

## 📋 Quick Reference

| Platform | Time (EET) | Priority | Status |
|----------|------------|----------|--------|
| Hacker News | 14:00-16:00 (Tue-Thu) | 🔴 Critical | ⬜ |
| Twitter/X | 15:00 | 🔴 Critical | ⬜ |
| LinkedIn | 16:00 | 🟡 Important | ⬜ |
| Reddit | 17:00 | 🟡 Important | ⬜ |
| Discord/Slack | 18:00 | 🟢 Nice-to-have | ⬜ |
| Email blast | After HN traction | 🟢 Nice-to-have | ⬜ |

---

## 1️⃣ Twitter/X Thread (Ready to Post)

**Best time:** 15:00-17:00 EET (8:00-10:00 EST for US tech audience)  
**Character counts verified ✓**

---

### Tweet 1 — Hook (Pattern Interrupt)
```
Most people have no idea who actually owns the websites they use.

That "German" company? American parent.
That "privacy-focused" service? Owned by a Chinese conglomerate.

I built a one-click way to find out. 🧵
```
*[Characters: 234]*

---

### Tweet 2 — Problem (Pain Point)
```
GDPR protects your data — until it doesn't.

The moment your data flows to a US parent company, it's subject to the CLOUD Act. Your "European" service might be a legal fiction.

Ownership chains are complex. Most people don't have time to trace them.

So I automated it.
```
*[Characters: 280]*

---

### Tweet 3 — Solution (Introduce EuroCheck)
```
Introducing EuroCheck 🇪🇺

A browser extension that instantly shows if a website is European.

🟢 Green = EU company
🟡 Yellow = EU presence, non-EU parent  
🔴 Red = Non-European
⚪ Gray = Unknown

One click. No accounts. No tracking.
```
*[Characters: 246]*

---

### Tweet 4 — Benefits (Not Features)
```
Why this matters:

→ Know where your data jurisdiction actually lies
→ See through complex subsidiary structures  
→ Make informed choices about EU alternatives
→ Support European digital sovereignty

321 companies. Chrome + Firefox. English/German/French.
```
*[Characters: 273]*

---

### Tweet 5 — Trust Building (Open Source + Privacy)
```
Privacy-first by design:

• Works 100% OFFLINE (no network requests)
• Zero telemetry, zero analytics
• All data bundled locally
• MIT licensed — read every line

You don't have to trust me.
Audit the code yourself: github.com/andybod1-lang/eurocheck
```
*[Characters: 264]*

---

### Tweet 6 — CTA with Links
```
Try it:

🔗 Chrome: [Chrome Web Store link]
🔗 Firefox: [Firefox Add-ons link]
🔗 Source: github.com/andybod1-lang/eurocheck

Star ⭐ if useful. PRs welcome — especially company additions.

Built in Finland 🇫🇮 for Europe 🇪🇺
```
*[Characters: 224]*

---

### Optional Tweet 7 — Social Proof (Post Later if Traction)
```
Update: [X] installs in [Y] hours.

Thanks for the overwhelming response! 

Working through feature requests. If your site isn't in the database yet, drop a GitHub issue or PR.

This is what open source is about. 🙏
```

---

## 2️⃣ LinkedIn Post (Ready to Post)

**Best time:** 08:00-10:00 or 16:00-18:00 EET (Tuesday-Thursday)  
**Tone:** Professional, thought leadership, contribution-focused

---

```
🇪🇺 Digital sovereignty starts with a simple question: Who owns the websites you use?

I just launched EuroCheck — a browser extension that answers this instantly.

THE PROBLEM:

In 2020, Schrems II invalidated the EU-US Privacy Shield. The 2023 Data Privacy Framework patched some gaps, but the core tension remains:

When European data flows to US-headquartered companies, it's subject to the CLOUD Act and FISA Section 702. Jurisdiction matters.

But ownership is opaque. That "European" SaaS tool might be three subsidiaries away from a Silicon Valley parent. Finding out requires digging through Crunchbase, Wikipedia, and corporate filings.

THE SOLUTION:

EuroCheck surfaces this information at browsing time:

🟢 Green = European company (HQ + ownership in EU/EEA)
🟡 Yellow = Complex ownership (EU presence, non-EU parent)
🔴 Red = Non-European company

One click. Full ownership chain. No guesswork.

HOW IT'S BUILT:

✅ Privacy-first: All lookups happen locally. Zero network requests. No telemetry.
✅ Transparent data: 321 companies sourced from Wikidata and GLEIF, with citations.
✅ Fully open source: MIT license. Audit the code, fork it, improve it.

CONTRIBUTE:

This is a community project. The database grows through contributions:

→ Add missing companies via GitHub PR
→ Report incorrect ownership data
→ Help with translations (currently EN/DE/FR)
→ Suggest features

Every PR gets reviewed and merged quickly. Your name goes in CONTRIBUTORS.md.

Whether you're making procurement decisions for a European business, or you're a privacy-conscious individual who wants to know where your data goes — this tool is for you.

🔗 GitHub: github.com/andybod1-lang/eurocheck
🔗 Chrome: [Chrome Web Store link]
🔗 Firefox: [Firefox Add-ons link]

Feedback welcome. What companies should be in v2?

---

#DigitalSovereignty #Privacy #GDPR #OpenSource #EU #EuropeanTech #DataProtection #BrowserExtension
```

---

## 3️⃣ Hacker News "Show HN" Post (Ready to Post)

**Best time:** Tuesday-Thursday, 14:00-16:00 EET (7:00-9:00 EST)  
**Critical:** Monitor and respond to ALL comments for first 4 hours

---

### Title
```
Show HN: EuroCheck – See if a website is European-owned (offline, open source)
```

### Body
```
Hi HN,

I built a browser extension that shows whether the site you're visiting belongs to a European or non-European company. One click, instant answer.

GitHub: https://github.com/andybod1-lang/eurocheck
Chrome: [link]
Firefox: [link]

**Why I built this**

After following the Schrems II fallout and realizing how murky ownership structures can be (that "German" company might be owned by a Delaware holding company owned by a Cayman Islands entity), I wanted a quick way to surface this info while browsing.

Use cases:
- Checking if a service keeps data under EU jurisdiction
- Finding EU alternatives for procurement
- Curiosity about who owns what

**Technical approach**

- Manifest V3, vanilla JS, ~50KB bundle
- Domain → company → ultimate parent lookup from bundled JSON
- Data sourced from Wikidata SPARQL + GLEIF LEI database
- Single build script outputs Chrome/Firefox variants

Everything runs locally. Zero network requests. No analytics. No telemetry. The entire database (321 companies, ~30KB gzipped) ships with the extension.

Classification logic:
- Green: HQ in EU/EEA, ultimate parent in EU/EEA
- Yellow: EU operating entity but non-EU ultimate parent
- Red: Non-EU company
- Gray: Not in database

**Architecture decisions**

Considered a backend API but rejected it for privacy. The tradeoff is database freshness — currently manual updates with releases. Ownership data changes slowly enough that this works.

Firefox MV3 support was trickier than expected (background.scripts vs service_worker). Tested with web-ext lint for AMO compliance.

**What's next**

- Expand to 1000+ companies (currently 321)
- GitHub issue → PR workflow for community additions
- Optional anonymous contribution of "domain not found" events to discover new companies

**Known limitations**

- Database coverage is limited
- Ownership data can go stale
- "European" is simplified to EU+EEA (not geographic Europe)
- Some edge cases in ownership classification

Curious if this is useful to anyone else, or if I'm solving my own niche problem. Would love feedback on the approach and suggestions for data sources.
```

---

## 4️⃣ Email Template (Newsletter/Journalist Outreach)

**Subject line options:**
- `New: Browser extension shows if a website is European`
- `EuroCheck — one-click EU company detection (open source)`
- `Privacy tool: Know who owns the sites you use`

---

```
Hi [Name],

Quick heads up on something I just launched that might interest [your readers / you]:

**EuroCheck** is a browser extension that shows whether a website belongs to a European or non-European company — tracing ownership chains to the ultimate parent.

**The pitch:**
Post-Schrems II, data jurisdiction matters. But ownership is opaque. EuroCheck surfaces this information at browsing time with a single click.

**Key points:**
• 321 companies in the database (major tech, social, e-commerce)
• Privacy-first: works 100% offline, zero tracking
• Open source (MIT) with full data citations
• Chrome + Firefox

**Links:**
→ GitHub: github.com/andybod1-lang/eurocheck
→ Chrome: [Chrome Web Store link]  
→ Firefox: [Firefox Add-ons link]

Happy to provide more details, screenshots, or do a quick call if you're interested.

Best,
Pekka

P.S. If you cover EU tech, privacy tools, or open source — this might be worth a mention.
```

---

## 5️⃣ Discord/Slack Announcements (Ready to Post)

### Short Version (Strict Channels)
```
👋 Just launched EuroCheck — browser extension that shows if a website is EU-owned.

Privacy-first (100% local, zero tracking), open source (MIT), 321 companies.

github.com/andybod1-lang/eurocheck

Feedback welcome!
```

---

### Standard Version (Community Channels)
```
Hey everyone 👋

Just shipped something that might interest this community:

**EuroCheck** — a browser extension that instantly shows whether the website you're on is European or non-European owned.

**How it works:**
🟢 Green = European company  
🟡 Yellow = EU presence, non-EU parent
🔴 Red = Non-European
⚪ Gray = Not in database

**Why I built it:**
After Schrems II, I wanted a quick way to see where my data actually ends up. Ownership chains are complex — this traces to the ultimate parent so you know the real jurisdiction.

**Privacy:**
• Works 100% offline (entire database bundled)
• Zero network requests
• No telemetry, no tracking
• Open source — audit it yourself

**Links:**
🔗 GitHub: github.com/andybod1-lang/eurocheck
🔗 Chrome: [link]
🔗 Firefox: [link]

Database has 321 companies. If something's missing, PRs welcome!

Would love feedback from privacy-minded folks. 🇪🇺
```

---

### Target Communities

**High priority:**
- r/privacy Discord
- r/PrivacyGuides community
- Self-hosted communities (r/selfhosted Discord)
- FOSS/open source Discords

**Medium priority:**
- r/europe Discord
- European tech/startup Slacks
- Developer communities with privacy channels

**Approach:**
- Check channel rules first
- Don't cross-post to multiple channels in same server
- Engage with responses, don't just drop and leave

---

## ⏰ Timing Strategy

### Optimal Launch Day: **Tuesday or Wednesday**

**Rationale:**
- HN traffic peaks Tuesday-Thursday
- Avoids Monday inbox chaos
- Gives 3-4 days for momentum before weekend slowdown
- Allows Day 2 follow-up without hitting Friday

---

### Launch Day Schedule (All Times EET)

| Time | Platform | Action | Duration |
|------|----------|--------|----------|
| 13:30 | — | Final checks: all links work, stores live | 30 min |
| 14:00 | **Hacker News** | Post Show HN | — |
| 14:00-18:00 | HN | **Monitor & reply to every comment** | 4 hours |
| 15:00 | **Twitter/X** | Post thread | — |
| 15:30 | Twitter | Engage with early replies | ongoing |
| 16:00 | **LinkedIn** | Post | — |
| 17:00 | **Reddit** | Post to r/privacy | — |
| 18:00 | **Discord/Slack** | Post to 2-3 communities | — |
| 19:00+ | **Email** | Send if HN/Twitter showing traction | — |
| 21:00 | — | Review metrics, note learnings | 30 min |

---

### Time Zone Optimization

| Target Audience | Their Peak | Your Time (EET) |
|-----------------|------------|-----------------|
| US East Coast (NYC, DC) | 9:00-11:00 EST | 16:00-18:00 |
| US West Coast (SF, LA) | 9:00-11:00 PST | 19:00-21:00 |
| Central Europe (Berlin, Paris) | 9:00-11:00 CET | 10:00-12:00 |
| UK (London) | 9:00-11:00 GMT | 11:00-13:00 |

**Strategy:**  
14:00 EET = 7:00 EST (catches US East morning commute + EU afternoon).  
This is the sweet spot for HN.

---

### Day 2 Actions

- [ ] Reply to ALL remaining HN comments (ranking factor)
- [ ] Quote-tweet/reply to engaging Twitter responses
- [ ] Post to r/opensource if Day 1 went well
- [ ] Post to r/europe (different angle: sovereignty)
- [ ] Thank any GitHub contributors publicly
- [ ] Update README if feedback revealed confusion

---

## 📝 Pre-Launch Checklist

### 48 Hours Before
- [ ] Chrome extension published and **approved** (not pending)
- [ ] Firefox add-on published and **approved**
- [ ] GitHub repo public with polished README
- [ ] Landing page live (if using)
- [ ] Privacy policy accessible at stable URL
- [ ] All store screenshots current
- [ ] Test install on fresh browser profiles

### 24 Hours Before
- [ ] Draft all posts in native apps (Twitter, LinkedIn)
- [ ] Test every link in drafts
- [ ] Clear calendar for launch day
- [ ] Charge devices, stable internet
- [ ] Prep coffee ☕

### Launch Morning
- [ ] Final link check (stores sometimes change URLs)
- [ ] Open HN, Twitter, LinkedIn in tabs
- [ ] GitHub notifications ON
- [ ] Phone on Do Not Disturb (focus)

---

## 📊 Success Metrics

| Metric | Baseline | Good | Great | Exceptional |
|--------|----------|------|-------|-------------|
| HN points | 10+ | 50+ | 150+ | 300+ |
| HN comments | 5+ | 20+ | 50+ | 100+ |
| GitHub stars (Day 1) | 20+ | 100+ | 300+ | 500+ |
| Chrome installs (Day 1) | 50+ | 200+ | 500+ | 1000+ |
| Firefox installs (Day 1) | 25+ | 100+ | 250+ | 500+ |
| Twitter impressions | 5K+ | 20K+ | 50K+ | 100K+ |
| LinkedIn impressions | 1K+ | 5K+ | 15K+ | 30K+ |

---

## 🔄 Post-Launch Roadmap

### Week 1: Momentum
- Respond to all feedback within 24h
- Hotfix any reported bugs immediately
- Add top-requested companies
- Write "lessons learned" thread if HN hit 100+

### Week 2-3: Expand Reach
- Submit to Product Hunt (schedule for Tuesday)
- Pitch to privacy newsletters (see list below)
- Post technical blog about ownership data challenges
- Add suggested companies from community

### Month 1: Consolidate
- Review and merge community PRs
- Consider v1.1 with most-requested features
- Reach out to podcast hosts covering privacy/EU tech
- Start planning database expansion to 1000 companies

---

## 📰 Newsletter/Media Targets

**Privacy & Security:**
- TLDR Newsletter (tech)
- Privacy Guides newsletter
- The Markup
- Wired (privacy section)

**Open Source:**
- Console.dev
- Changelog News
- Open Source Weekly

**EU Tech:**
- Sifted (EU startup news)
- Tech.eu
- The Europas

**Developer:**
- Hacker Newsletter (aggregates HN)
- JavaScript Weekly (if relevant)
- Frontend Focus

---

## 💬 FAQ / Talking Points

**Q: Why not just check WHOIS?**  
A: WHOIS shows domain registration, not corporate ownership. A US company can register domains in Ireland.

**Q: How do you define "European"?**  
A: HQ in EU or EEA member state AND European ultimate parent. If a Swedish company is owned by a US private equity firm, that's "mixed" (yellow).

**Q: How often is the database updated?**  
A: Currently with releases (targeting monthly). Major ownership changes are prioritized.

**Q: Can I add companies?**  
A: Yes! GitHub PR with company data + source links. Most PRs merged within 48h.

**Q: Will you add [country] outside EU?**  
A: Focused on EU/EEA for GDPR jurisdiction relevance. Open to expanding scope based on demand.

**Q: Is there a mobile version?**  
A: Not yet. Mobile browser extension support is limited. Considering a standalone app if there's demand.

---

## 📋 Copy-Paste Links Block

```
LINKS (update before launch):

GitHub: https://github.com/andybod1-lang/eurocheck
Chrome Web Store: [PASTE LINK]
Firefox Add-ons: [PASTE LINK]
Landing Page: [PASTE LINK]
Privacy Policy: [PASTE LINK]
```

---

*Last updated: 2025-01-27*
*Version: 2.0*
