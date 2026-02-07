# EuroCheck Reddit Launch Posts

> Master document for Reddit launch strategy. Each subreddit gets a tailored post matching community culture.

---

## 📅 Timing & Strategy

### Best Posting Times (all times CET/CEST)
| Subreddit | Best Time | Best Days | Why |
|-----------|-----------|-----------|-----|
| r/europeans | 18:00-21:00 | Tue-Thu | European evening, peak engagement |
| r/degoogle | 14:00-17:00 | Mon-Wed | Mix of EU/US users |
| r/privacy | 14:00-18:00 | Tue-Thu | Global audience, US afternoon + EU evening overlap |
| r/InternetIsBeautiful | 15:00-18:00 | Mon, Tue | US morning/afternoon, fresh week energy |
| r/webdev | 14:00-17:00 | Tue-Wed | Devs online during work hours |

### Spacing Strategy
- **Day 1:** r/europeans (home audience, gather testimonials)
- **Day 2-3:** r/privacy + r/degoogle (can cross-promote each other)
- **Day 4-5:** r/InternetIsBeautiful (cool tool angle, use any quotes from earlier posts)
- **Day 6-7:** r/webdev (technical angle, discuss architecture)

### Engagement Rules
1. **Respond to every comment** in first 2 hours (critical for algorithm)
2. **Don't be defensive** — acknowledge limitations openly
3. **Thank contributors** who suggest features or report bugs
4. **No self-promotion in comments** — only answer questions
5. **Upvote helpful replies** from others

---

## 1️⃣ r/europeans

**Subreddit culture:** Pan-European identity, supporting EU, buy-local sentiment, mild nationalism okay but avoid politics

### Title Options (pick one)
1. `I made a browser extension that shows when you're on a European company's website 🇪🇺`
2. `Built a tool to know instantly if a company is actually European`
3. `Tired of thinking a brand is European when it's actually American/Chinese? Made an extension for that`

### Post Body

---

With all the talk about trade and "buying local," I realized I had no easy way to know if a company was actually European or just had a European warehouse.

So I built **EuroCheck** — a small browser extension that shows whether the website you're on belongs to a European company.

**How it works:**
- Click the icon (or look at the badge)
- Green = European (HQ in EU/EEA)
- Yellow = Mixed (EU brand, non-EU parent)
- Red = Non-European
- Gray = Not in database yet

**What makes a company "European":**
- Headquarters in EU, EEA, or Switzerland
- Ultimate parent company also European
- Not just "European office" of a US giant

**The database includes:**
- 320+ verified companies
- From every EU/EEA country
- Sources: Wikidata, GLEIF, manual verification

**Privacy:**
- Everything runs locally — zero data sent anywhere
- Works offline
- Open source (MIT license)

I built this because I wanted it myself. Now I'm curious if others find it useful too.

Available for Chrome and Firefox. Database is community-expandable if you find gaps.

---

### Engagement Prep

**Q: What about UK companies?**
> A: UK isn't included since Brexit. It's no longer EU/EEA. Swiss companies ARE included since they're often grouped with the European market.

**Q: Isn't this just nationalism?**
> A: It's about informed choice. Some people prefer local, some care about labor laws, some want shorter supply chains. This just gives information.

**Q: Why isn't [company X] in the database?**
> A: Database is growing! Submit it on GitHub or tell me here — I'll add it.

**Q: What about subsidiaries?**
> A: EuroCheck traces ownership chains. If a Swedish brand is owned by a Chinese company, it shows yellow with the full chain explained.

---

## 2️⃣ r/degoogle + r/privacy

**Subreddit culture:** Privacy-obsessed, suspicious of data collection, appreciate technical details, FOSS preferred, hate corporate surveillance

### Title Options
1. `[Extension] Privacy-first tool to identify European vs non-European companies — no tracking, fully local, open source`
2. `Made a browser extension that identifies company origins without sending ANY data anywhere`
3. `Open source extension: Know if a company is EU/non-EU, all processing happens locally`

### Post Body

---

Built something you privacy folks might appreciate.

**EuroCheck** identifies whether the website you're visiting belongs to a European or non-European company. But here's the thing: **it does this entirely locally**.

**Privacy architecture:**
- ✅ Zero network requests for lookups
- ✅ Database bundled in extension (no external API)
- ✅ No telemetry, no analytics, no cookies
- ✅ Works completely offline
- ✅ Open source (MIT) — audit it yourself

**Why this matters:**
Most "company checker" tools phone home to some API, building a profile of every site you visit. EuroCheck explicitly avoids this. Your browsing stays yours.

**What it does:**
- Shows EU status of current website (green/yellow/red badge)
- Traces ownership chains (that "Swedish" brand might be Chinese-owned)
- 320+ companies in local database
- Chrome and Firefox support

**Tech stack:**
- Manifest V3
- Local JSON database (~80KB)
- No external dependencies
- Service worker only wakes on icon click

**Use case:**
Some people care about buying European (GDPR-governed companies, EU labor laws, shorter supply chains). This helps with that — without trading your privacy to find out.

GitHub: https://github.com/andybod1-lang/eurocheck
Firefox: https://addons.mozilla.org/en-US/firefox/addon/eurocheck-eu-company-id/  
Chrome: https://chromewebstore.google.com/detail/eurocheck-eu-company-iden/dpfimkgpnmohfociiojeajoacdagjagi

Happy to answer questions about the architecture or privacy claims.

---

### r/degoogle-specific add-on

> Add to post for r/degoogle specifically:

For those replacing Google services: this helps identify which alternatives are actually European vs just marketed as European. Useful when choosing between cloud providers, SaaS tools, or hardware.

---

### Engagement Prep

**Q: How do I know you're not lying about the privacy claims?**
> A: It's open source. The entire codebase is on GitHub. Check manifest.json — no host permissions except activeTab. Check background.js — no fetch() calls except for icon assets. Or use a network monitor while using it.

**Q: Why not make it check more companies dynamically via API?**
> A: That would require sending every domain you visit to a server. Defeats the purpose. The local database trade-off means less coverage but real privacy.

**Q: Firefox or Chrome?**
> A: Both! Firefox Add-ons and Chrome Web Store. Same codebase, slightly different manifests for compatibility.

**Q: Can I contribute companies?**
> A: Yes! Submit via GitHub. Include sources (Wikidata, company filings, etc.).

---

## 3️⃣ r/InternetIsBeautiful

**Subreddit culture:** Appreciates clever, useful, well-designed tools. Clean presentation matters. No marketing speak. "I found this cool thing" vibe.

### Title Options
1. `EuroCheck: One click to see if a company is European or not (free browser extension)`
2. `Browser extension that instantly shows whether a website belongs to an EU company`
3. `A surprisingly useful tool: see company origin with one click`

### Post Body

---

Found myself constantly wondering whether the companies I'm buying from are actually European or just have European warehouses.

Made a simple browser extension that answers this in one click.

**How it looks:**
- 🟢 Green badge = European company
- 🟡 Yellow = European brand, non-EU parent  
- 🔴 Red = Not European
- ⚪ Gray = Not in database

**What I like about it:**
- Actually shows ownership chains (reveals when a "Swedish" brand is Chinese-owned)
- Runs entirely offline — database is bundled
- No account needed
- Clean, minimal popup

**What it doesn't do:**
- Only covers 320 companies (growing)
- Won't know about small local shops
- Doesn't track your history or serve ads

Works on Chrome and Firefox. Open source if you're curious how it works.

Link in comments.

---

### Comment to Add
```
Links:
- Chrome: https://chromewebstore.google.com/detail/eurocheck-eu-company-iden/dpfimkgpnmohfociiojeajoacdagjagi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/eurocheck-eu-company-id/
- GitHub: [repo link]
```

### Engagement Tips
- Keep responses short and friendly
- If someone suggests a feature, say "great idea, added to the list"
- Don't over-explain technical details unless asked

---

## 4️⃣ r/webdev

**Subreddit culture:** Technical, appreciates clean code, likes hearing about architecture decisions, framework discussions, open source love

### Title Options
1. `Built a privacy-focused browser extension with MV3 + local-only data — architecture walkthrough`
2. `Side project: Browser extension that identifies EU companies, no external API (architecture discussion)`
3. `Shipping a Manifest V3 extension to Chrome + Firefox — lessons learned`

### Post Body

---

Just shipped a browser extension and thought I'd share some technical decisions that might be interesting.

**The project:** EuroCheck — identifies whether the website you're on belongs to a European company.

**Key constraint:** Must work without any network requests (for privacy). This shaped everything.

**Architecture decisions:**

**1. Local-first data**
- Bundled 320-company database as JSON (~80KB gzipped)
- Domain → company → ownership chain lookup
- Trade-off: limited coverage vs. no privacy leak

**2. Manifest V3 challenges**
- Service worker lifecycle is... interesting
- Had to handle worker waking/sleeping for badge updates
- Firefox MV3 support has quirks (background.scripts vs service_worker)

**3. Cross-browser build**
- Single codebase, build script generates Chrome/Firefox variants
- Main differences: manifest format, extension API namespaces
- Firefox requires explicit `browser_specific_settings` for AMO

**4. Ownership chain modeling**
```javascript
// Simplified structure
{
  "spotify": {
    "name": "Spotify AB",
    "country": "SE",
    "parent": null,
    "status": "eu"
  },
  "notino": {
    "name": "Notino s.r.o.",
    "country": "CZ", 
    "parent": "notino-holding",
    "status": "eu"
  }
}
```

**5. Badge state management**
- declarativeContent API for badge updates
- Fallback to activeTab for complex cases
- Icon color reflects status (green/yellow/red/gray)

**Learnings:**
- MV3 service workers are more limited than you'd expect
- Testing cross-browser is essential (things break in subtle ways)
- Local-only is possible but requires accepting coverage limits

Happy to dive deeper on any part. Code is MIT licensed on GitHub.

---

### Engagement Prep

**Q: Why not use IndexedDB for the company database?**
> A: Considered it, but the dataset is small enough that JSON-in-bundle works fine. IndexedDB would help with updates but adds complexity for ~80KB of data.

**Q: How do you handle updates to the company database?**
> A: Extension updates via store push new database versions. Community can also submit PRs on GitHub.

**Q: What's your test setup?**
> A: Jest for unit tests, Puppeteer for e2e, manual testing matrix across Chrome/Firefox/Brave.

**Q: Any MV3 gotchas to share?**
> A: Biggest one: service worker can die mid-operation. Design everything to be stateless or persist state immediately. Also, Firefox MV3 is "supported" but has differences — test both.

---

## 📝 Post-Launch Checklist

### Immediately After Posting
- [ ] Comment with links (some subs require this)
- [ ] Upvote helpful early comments
- [ ] Respond to every question within 2 hours
- [ ] Don't argue with critics — acknowledge and move on

### 24 Hours After
- [ ] Thank people who gave feedback
- [ ] Note feature requests for roadmap
- [ ] Cross-link between posts if relevant
- [ ] Screenshot any nice comments for social proof

### 1 Week After
- [ ] Follow up on feature requests you implemented
- [ ] Thank the community again
- [ ] Update post with "[UPDATE]" if there are significant improvements

---

## 🚫 What NOT to Do

1. **Don't post to all subs on the same day** — looks like spam
2. **Don't use marketing language** ("revolutionary," "game-changing")
3. **Don't argue with skeptics** — just provide facts
4. **Don't delete negative comments** — respond gracefully
5. **Don't ask for upvotes** — ever
6. **Don't PM people** asking them to check it out

---

## 📊 Success Metrics

| Metric | Good | Great | Amazing |
|--------|------|-------|---------|
| Upvotes | 50+ | 200+ | 500+ |
| Comments | 20+ | 50+ | 100+ |
| Store visits from post | 100+ | 500+ | 1000+ |
| GitHub stars from post | 10+ | 50+ | 100+ |

---

## 🎯 Key Messages to Reinforce

1. **Privacy-first** — Everything local, no tracking
2. **Open source** — Verify claims yourself
3. **Community-driven** — Anyone can contribute companies
4. **Simple utility** — Does one thing well
5. **Made in Europe** — For Europeans, by Europeans

---

*Last updated: 2026-01-29*
