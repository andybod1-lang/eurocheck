# EuroCheck MVP — 1-Week Sprint Plan
*Building while Antti sleeps 🌙*

---

## Scope: Minimum Viable Product

**What it does:**
- Browser extension (Chrome first)
- Detects website domain → looks up company ownership
- Shows EU verification badge (✅ European / ⚠️ Mixed / ❌ Non-European)
- Popup with company details + ownership chain

**What it doesn't do (yet):**
- Mobile app
- B2B API
- Full 10K company database
- Community contributions

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Extension | WebExtension API | Cross-browser compatible |
| Browsers | Chrome, Firefox, Safari | All major browsers |
| Data | Static JSON + Wikidata | Fast MVP, no backend needed |
| Backend | None (v1) / Cloudflare Workers (v2) | Zero ops, free tier |
| Storage | Extension local storage | Offline-capable |

**Safari Note:** Requires Xcode wrapper (Safari Web Extension). Mac Mini has Xcode available.

---

## Night-by-Night Plan

### Night 1 (Tonight): Foundation

| # | Task | Agent | Est. |
|---|------|-------|------|
| 19 | Project structure | pekka | 30m |
| 20 | Wikidata SPARQL research | data-researcher | 1h |
| 21 | GLEIF data research | data-researcher | 1h |
| 22 | Seed 500 company dataset | market-researcher | 3h |
| 23 | Domain-to-company mapping | market-researcher | 1h |
| 24 | Data schema design | data-engineer | 30m |
| 25 | Chrome extension boilerplate | frontend-developer | 1h |
| 26 | Domain detection logic | frontend-developer | 1h |
| 27 | Basic popup UI | frontend-developer | 1h |
| 28 | Extension icons | ui-designer | 30m |
| 29 | Local testing & integration | qa-expert | 1h |
| 30 | Git repo + .gitignore | pekka | 15m |
| 31 | GoEuropean competitor analysis | competitive-analyst | 1h |
| 32 | Build/package scripts | frontend-developer | 1h |
| 33 | Wikidata ingestion script | data-engineer | 1.5h |
| 34 | Ownership classification logic | frontend-developer | 1h |
| 35 | Unknown domain handling | frontend-developer | 30m |

**Sequential estimate:** ~17 hours
**Parallel estimate:** ~4 hours (with 7 workers)

---

### Night 1 Parallel Execution Plan

```
╔═══════════════════════════════════════════════════════════════════╗
║  PHASE 1 — Research & Foundation (parallel, ~2h)                  ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ data-researcher     │  │ market-researcher   │                ║
║  │ #20 Wikidata research│  │ #22 500 companies   │                ║
║  │ #21 GLEIF research   │  │ #23 Domain mapping  │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ competitive-analyst │  │ ui-designer         │                ║
║  │ #31 GoEuropean      │  │ #28 Extension icons │                ║
║  │     analysis        │  │                     │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 2 — Build (parallel, ~2h)                                  ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ data-engineer       │  │ frontend-developer  │                ║
║  │ #24 Data schema     │  │ #25 Extension       │                ║
║  │ #33 Wikidata script │  │ #26 Domain detect   │                ║
║  │                     │  │ #27 Popup UI        │                ║
║  │                     │  │ #32 Build scripts   │                ║
║  │                     │  │ #34 Classification  │                ║
║  │                     │  │ #35 Unknown domains │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 3 — Integration & Test (~1h)                               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ pekka               │  │ qa-expert           │                ║
║  │ #19 Project setup   │  │ #29 Testing         │                ║
║  │ #30 Git init        │  │     20+ sites       │                ║
║  │ Integrate all parts │  │     Bug report      │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Deliverable:** Working extension with 500 companies, EU classification, proper error handling

### Night 2: Data Expansion + UI Polish

| # | Task | Agent | Est. |
|---|------|-------|------|
| 36 | Night 1 bug fixes | frontend-developer | 1h |
| 37 | Expand to 1000 companies | market-researcher | 2h |
| 38 | GLEIF integration script | data-engineer | 1.5h |
| 39 | Ownership chain visualization | frontend-developer | 1.5h |
| 40 | Company detail view | frontend-developer | 1h |
| 41 | Animated badge states | ui-designer | 30m |
| 42 | Data quality validation | qa-expert | 1.5h |
| 43 | Data deduplication | data-engineer | 1h |
| 44 | Confidence scores | data-engineer | 1h |
| 45 | Fuzzy domain matching | frontend-developer | 1h |
| 46 | Git commit + changelog | pekka | 30m |
| 47 | Night 2 testing | qa-expert | 1h |

**Sequential estimate:** ~14 hours
**Parallel estimate:** ~4 hours (with 5 workers)

---

### Night 2 Parallel Execution Plan

```
╔═══════════════════════════════════════════════════════════════════╗
║  PHASE 1 — Data & Fixes (parallel, ~2h)                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ market-researcher   │  │ data-engineer       │                ║
║  │ #37 1000 companies  │  │ #38 GLEIF script    │                ║
║  │                     │  │ #43 Deduplication   │                ║
║  │                     │  │ #44 Confidence      │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ frontend-developer  │  │ ui-designer         │                ║
║  │ #36 Bug fixes       │  │ #41 Animated badges │                ║
║  │ #45 Fuzzy matching  │  │                     │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 2 — UI Features (parallel, ~1.5h)                          ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ frontend-developer  │  │ qa-expert           │                ║
║  │ #39 Ownership chain │  │ #42 Data validation │                ║
║  │ #40 Detail view     │  │                     │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 3 — Integration & Test (~1h)                               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ pekka               │  │ qa-expert           │                ║
║  │ #46 Git commit      │  │ #47 Full testing    │                ║
║  │ Integrate all parts │  │ 50+ sites           │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Deliverable (Phase 1-3):** 1000 companies, ownership visualization, polished UI, validated data

---

### Night 2 Continued: Firefox + Features (formerly Night 3)

| # | Task | Agent | Est. |
|---|------|-------|------|
| 48 | Firefox manifest adaptation | frontend-developer | 1h |
| 49 | Firefox full testing | qa-expert | 1h |
| 50 | Request company form | frontend-developer | 1h |
| 51 | Options/settings page | frontend-developer | 1h |
| 52 | Localization (EN, DE, FR) | frontend-developer | 1.5h |
| 53 | Git commit + v0.2.0 tag | pekka | 30m |

```
╔═══════════════════════════════════════════════════════════════════╗
║  PHASE 4 — Firefox & Features (parallel, ~1.5h)                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ frontend-developer  │  │ frontend-developer  │                ║
║  │ #48 Firefox manifest│  │ #50 Request form    │                ║
║  │ #51 Settings page   │  │ #52 i18n setup      │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 5 — Final Testing & Commit (~1h)                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ qa-expert           │  │ pekka               │                ║
║  │ #49 Firefox testing │  │ #53 Git commit      │                ║
║  │ Cross-browser QA    │  │ v0.2.0-alpha tag    │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Final Night 2 Deliverable:** Chrome + Firefox working, 1000 companies, settings, i18n, request form

---

### Night 3: Safari + Performance + Store Prep (MEGA Night)

| # | Task | Agent | Est. |
|---|------|-------|------|
| 54 | Safari Web Extension wrapper | frontend-developer | 1.5h |
| 55 | Safari code signing | frontend-developer | 30m |
| 56 | Safari-specific testing | qa-expert | 1h |
| 57 | Performance optimization | frontend-developer | 1h |
| 58 | Caching layer | data-engineer | 1h |
| 59 | Memory optimization | frontend-developer | 1h |
| 60 | Cross-browser final QA | qa-expert | 1h |
| 61 | Git commit + v0.3.0 | pekka | 30m |
| 62 | Privacy policy | technical-writer | 1h |
| 63 | Terms of service | technical-writer | 30m |
| 64 | Chrome Web Store listing | technical-writer | 1h |
| 65 | Firefox Add-ons listing | technical-writer | 30m |
| 66 | Safari App Store listing | technical-writer | 30m |
| 67 | Chrome screenshots | ui-designer | 1h |
| 68 | Firefox screenshots | ui-designer | 30m |
| 69 | Safari screenshots | ui-designer | 30m |
| 70 | Promotional graphics | ui-designer | 1h |
| 71 | Store assets review | qa-expert | 30m |
| 72 | Git commit + v0.4.0-rc | pekka | 30m |

**Sequential estimate:** ~16 hours
**Parallel estimate:** ~5 hours (with 5 workers)

---

### Night 3 Parallel Execution Plan

```
╔═══════════════════════════════════════════════════════════════════╗
║  PHASE 1 — Safari + Performance (parallel, ~2h)                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ frontend-developer  │  │ data-engineer       │                ║
║  │ #54 Safari wrapper  │  │ #58 Caching layer   │                ║
║  │ #55 Code signing    │  │                     │                ║
║  │ #57 Performance     │  │                     │                ║
║  │ #59 Memory optim    │  │                     │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 2 — Safari QA + Legal Docs (parallel, ~1.5h)               ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ qa-expert           │  │ technical-writer    │                ║
║  │ #56 Safari testing  │  │ #62 Privacy policy  │                ║
║  │ #60 Cross-browser   │  │ #63 Terms of service│                ║
║  │                     │  │ #64 Chrome listing  │                ║
║  │                     │  │ #65 Firefox listing │                ║
║  │                     │  │ #66 Safari listing  │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 3 — Store Assets (parallel, ~1.5h)                         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ ui-designer         │  │ pekka               │                ║
║  │ #67 Chrome screens  │  │ #61 Git v0.3.0      │                ║
║  │ #68 Firefox screens │  │ Integrate Safari    │                ║
║  │ #69 Safari screens  │  │                     │                ║
║  │ #70 Promo graphics  │  │                     │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 4 — Final Review (~30m)                                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ qa-expert           │  │ pekka               │                ║
║  │ #71 Assets review   │  │ #72 Git v0.4.0-rc   │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Final Night 3 Deliverable:** All 3 browsers optimized + store-ready with all listings and screenshots

---

### Night 4: Marketing + Launch (FINAL MEGA Night)

| # | Task | Agent | Est. |
|---|------|-------|------|
| 73 | Landing page HTML/CSS | frontend-developer | 2h |
| 74 | Landing page copy | technical-writer | 1h |
| 75 | SEO optimization | seo-specialist | 1h |
| 76 | r/BuyFromEU launch post | technical-writer | 1h |
| 77 | Product Hunt prep | product-manager | 1h |
| 78 | Social media assets | ui-designer | 1h |
| 79 | Chrome Web Store submit | pekka | 30m |
| 80 | Firefox Add-ons submit | pekka | 30m |
| 81 | Safari App Store submit | pekka | 1h |
| 82 | Final smoke test | qa-expert | 1h |
| 83 | Deploy landing page | pekka | 30m |
| 84 | GitHub repo public | pekka | 30m |
| 85 | Launch day comms | technical-writer | 1h |
| 86 | Git commit + v1.0.0 | pekka | 30m |

**Sequential estimate:** ~13 hours
**Parallel estimate:** ~4 hours (with 6 workers)

---

### Night 4 Parallel Execution Plan

```
╔═══════════════════════════════════════════════════════════════════╗
║  PHASE 1 — Marketing Assets (parallel, ~2h)                       ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ frontend-developer  │  │ technical-writer    │                ║
║  │ #73 Landing page    │  │ #74 Landing copy    │                ║
║  │                     │  │ #76 Reddit post     │                ║
║  │                     │  │ #85 Launch comms    │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ seo-specialist      │  │ ui-designer         │                ║
║  │ #75 SEO             │  │ #78 Social assets   │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
║  ┌─────────────────────┐                                         ║
║  │ product-manager     │                                         ║
║  │ #77 Product Hunt    │                                         ║
║  └─────────────────────┘                                         ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 2 — Final QA (~1h)                                         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────┐  ┌─────────────────────┐                ║
║  │ qa-expert           │  │ pekka               │                ║
║  │ #82 Final smoke test│  │ Integrate landing   │                ║
║  │ All 3 browsers      │  │ Review all assets   │                ║
║  └─────────────────────┘  └─────────────────────┘                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  PHASE 3 — SUBMIT & DEPLOY (~1.5h)                                ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────────────────────────────┐                 ║
║  │ pekka                                       │                 ║
║  │ #79 Chrome Web Store submit                 │                 ║
║  │ #80 Firefox Add-ons submit                  │                 ║
║  │ #81 Safari App Store submit                 │                 ║
║  │ #83 Deploy landing page                     │                 ║
║  │ #84 GitHub repo public                      │                 ║
║  │ #86 Git commit v1.0.0                       │                 ║
║  └─────────────────────────────────────────────┘                 ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Final Night 4 Deliverable:** LAUNCHED! All stores submitted + landing page live + GitHub public 🚀

---

## MVP Summary: 4 Nights (MAXIMUM ACCELERATION!)

| Night | Focus | Key Deliverable |
|-------|-------|-----------------|
| **1** | Foundation | Chrome + 500 companies |
| **2** | Data + Firefox | 1000 companies + Firefox + i18n |
| **3** | Safari + Store | All 3 browsers + store-ready |
| **4** | LAUNCH | Submitted + Live! 🚀 |

**Total agents used across 7 nights:**
- `frontend-developer` (heavy)
- `market-researcher`
- `data-engineer`
- `ui-designer`
- `qa-expert`
- `technical-writer`
- `competitive-analyst`
- `data-researcher`
- `seo-specialist`
- `product-manager`
- `pekka` (orchestration)

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Companies in database | 500+ |
| Accuracy on top 100 brands | 95%+ |
| Extension load time | <100ms |
| Store submission | By Day 7 |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Wikidata data gaps | Manual curation for top brands |
| Domain matching complexity | Start with exact domain match |
| Store review delays | Submit early, iterate |
| Scope creep | Strict MVP, features go to backlog |

---

## What I'll Update You On

Daily WhatsApp update each morning with:
- What got done overnight
- Any blockers or decisions needed
- Demo link/screenshots when available

---

*Starting tonight. Sleep well! 🛏️*
